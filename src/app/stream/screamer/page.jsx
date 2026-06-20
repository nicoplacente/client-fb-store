"use client";

import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { envConfig } from "@/config";
import { normalizeScreamer } from "./screamer";

const SCREAMER_EVENT = "screamer:trigger";
const MAX_PLAYBACK_QUEUE_SIZE = 50;
const MAX_RECENT_EVENTS = 100;
const MEDIA_TIMEOUT_MS = 5000;

function waitForMedia(element, successEvent, errorEvent) {
  return new Promise((resolve, reject) => {
    const timeout = window.setTimeout(
      () => finish(new Error("Tiempo de carga agotado")),
      MEDIA_TIMEOUT_MS,
    );

    function finish(error) {
      window.clearTimeout(timeout);
      element.removeEventListener(successEvent, handleSuccess);
      element.removeEventListener(errorEvent, handleError);

      if (error) {
        reject(error);
        return;
      }

      resolve();
    }

    function handleSuccess() {
      finish();
    }

    function handleError() {
      finish(new Error("No se pudo cargar el recurso"));
    }

    element.addEventListener(successEvent, handleSuccess, { once: true });
    element.addEventListener(errorEvent, handleError, { once: true });
  });
}

function stopMedia(image, audio) {
  image.classList.remove("stream-screamer-visible");
  image.removeAttribute("src");
  audio.pause();
  audio.removeAttribute("src");
  audio.load();
}

export default function StreamScreamerPage() {
  const imageRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    const image = imageRef.current;
    const audio = audioRef.current;
    const queue = [];
    const recentEventIds = new Set();
    let active = false;
    let disposed = false;
    let playbackTimer = null;

    document.documentElement.classList.add("stream-screamer-route");
    document.body.classList.add("stream-screamer-route");

    function rememberEvent(eventId) {
      recentEventIds.add(eventId);

      if (recentEventIds.size <= MAX_RECENT_EVENTS) return;

      recentEventIds.delete(recentEventIds.values().next().value);
    }

    async function prepareMedia(screamer) {
      stopMedia(image, audio);

      const imageReady = waitForMedia(image, "load", "error");
      const audioReady = waitForMedia(audio, "canplaythrough", "error");

      image.src = screamer.gifUrl;
      audio.src = screamer.audioUrl;
      audio.preload = "auto";
      audio.volume = screamer.volume;
      audio.load();

      await Promise.all([imageReady, audioReady]);
    }

    function waitForPlayback(durationMs) {
      return new Promise((resolve) => {
        playbackTimer = window.setTimeout(resolve, durationMs);
      });
    }

    async function playScreamer(screamer) {
      await prepareMedia(screamer);

      if (disposed) return;

      image.removeAttribute("src");
      void image.offsetWidth;
      image.src = screamer.gifUrl;
      audio.currentTime = 0;
      image.classList.add("stream-screamer-visible");

      await audio.play();
      await waitForPlayback(screamer.durationMs);
    }

    async function processQueue() {
      if (active || disposed || queue.length === 0) return;

      active = true;
      const screamer = queue.shift();

      try {
        await playScreamer(screamer);
      } catch {
        // Un recurso inválido no debe bloquear los siguientes eventos.
      } finally {
        window.clearTimeout(playbackTimer);
        playbackTimer = null;
        active = false;

        if (!disposed) {
          stopMedia(image, audio);
          void processQueue();
        }
      }
    }

    function enqueueScreamer(payload) {
      const screamer = normalizeScreamer(payload);

      if (
        !screamer ||
        recentEventIds.has(screamer.id) ||
        queue.length >= MAX_PLAYBACK_QUEUE_SIZE
      ) {
        return;
      }

      rememberEvent(screamer.id);
      queue.push(screamer);
      void processQueue();
    }

    const socket = io(envConfig.SOCKET_URL, {
      transports: ["websocket", "polling"],
    });

    socket.on(SCREAMER_EVENT, enqueueScreamer);

    return () => {
      disposed = true;
      queue.length = 0;
      window.clearTimeout(playbackTimer);
      socket.off(SCREAMER_EVENT, enqueueScreamer);
      socket.disconnect();
      stopMedia(image, audio);
      document.documentElement.classList.remove("stream-screamer-route");
      document.body.classList.remove("stream-screamer-route");
    };
  }, []);

  return (
    <main className="stream-screamer-source" aria-live="off">
      <img
        ref={imageRef}
        alt=""
        className="stream-screamer-media"
        decoding="async"
      />
      <audio ref={audioRef} />

      <style jsx global>{`
        html.stream-screamer-route,
        body.stream-screamer-route {
          background: transparent !important;
          background-image: none !important;
          overflow: hidden !important;
        }

        body.stream-screamer-route header,
        body.stream-screamer-route aside,
        body.stream-screamer-route nav,
        body.stream-screamer-route nextjs-portal {
          display: none !important;
        }

        body.stream-screamer-route main {
          min-height: 0 !important;
          margin: 0 !important;
          padding: 0 !important;
          background: transparent !important;
        }

        .stream-screamer-source {
          position: fixed;
          inset: 0;
          z-index: 9998;
          overflow: hidden;
          pointer-events: none;
          background: transparent;
        }

        .stream-screamer-media {
          width: 100%;
          height: 100%;
          object-fit: contain;
          opacity: 0;
        }

        .stream-screamer-media.stream-screamer-visible {
          opacity: 1;
        }
      `}</style>
    </main>
  );
}
