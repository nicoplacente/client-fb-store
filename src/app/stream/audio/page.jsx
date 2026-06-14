"use client";

import { useEffect, useRef, useState } from "react";
import { envConfig } from "@/config";

const EMPTY_QUEUE_POLL_MS = 2500;
const NEXT_AUDIO_DELAY_MS = 500;

export default function StreamAudioPage() {
  const [currentAudio, setCurrentAudio] = useState(null);
  const [error, setError] = useState("");
  const audioRef = useRef(null);
  const activeClaimRef = useRef(null);
  const pollingRef = useRef(null);
  const stoppedRef = useRef(false);
  const obsTokenRef = useRef("");

  useEffect(() => {
    document.body.classList.add("stream-audio-route");
    obsTokenRef.current = new URLSearchParams(window.location.search).get(
      "token",
    ) || "";

    if (!obsTokenRef.current) {
      setError("Falta el token privado de OBS en la URL.");
      return () => {
        document.body.classList.remove("stream-audio-route");
      };
    }

    stoppedRef.current = false;
    claimNextAudio();

    return () => {
      stoppedRef.current = true;
      window.clearTimeout(pollingRef.current);
      document.body.classList.remove("stream-audio-route");

      const activeClaim = activeClaimRef.current;

      if (activeClaim) {
        releaseAudio(activeClaim, { keepalive: true }).catch(() => {});
      }

      if (activeClaim?.objectUrl) {
        URL.revokeObjectURL(activeClaim.objectUrl);
      }
    };
  }, []);

  useEffect(() => {
    if (!currentAudio?.objectUrl || !audioRef.current) return;

    audioRef.current.play().catch(() => {
      handlePlaybackFailure();
    });
  }, [currentAudio]);

  async function claimNextAudio() {
    if (
      stoppedRef.current ||
      !obsTokenRef.current ||
      activeClaimRef.current
    ) {
      return;
    }

    try {
      setError("");
      const response = await fetch(`${envConfig.API_AUDIO_OBS}/claim`, {
        method: "POST",
        headers: {
          "x-obs-token": obsTokenRef.current,
        },
        cache: "no-store",
      });

      if (response.status === 204) {
        scheduleNextClaim(EMPTY_QUEUE_POLL_MS);
        return;
      }

      if (!response.ok) {
        throw new Error(await getResponseError(response));
      }

      const data = await response.json();
      const claim = data.audio;
      activeClaimRef.current = claim;
      const audioResponse = await fetch(
        `${envConfig.API_AUDIO_OBS}/${encodeURIComponent(claim.id)}/file`,
        {
          headers: {
            "x-obs-token": obsTokenRef.current,
            "x-audio-claim-token": claim.claimToken,
          },
          cache: "no-store",
        },
      );

      if (!audioResponse.ok) {
        throw new Error(await getResponseError(audioResponse));
      }

      const blob = await audioResponse.blob();
      const objectUrl = URL.createObjectURL(blob);
      const activeClaim = {
        ...claim,
        objectUrl,
      };

      activeClaimRef.current = activeClaim;
      setCurrentAudio(activeClaim);
    } catch (claimError) {
      const activeClaim = activeClaimRef.current;

      if (activeClaim) {
        await releaseAudio(activeClaim).catch(() => {});
        activeClaimRef.current = null;
      }

      setError(claimError.message || "No se pudo obtener el siguiente audio.");
      scheduleNextClaim(EMPTY_QUEUE_POLL_MS);
    }
  }

  async function handlePlaybackComplete() {
    const activeClaim = activeClaimRef.current;
    if (!activeClaim) return;

    try {
      const response = await fetch(
        `${envConfig.API_AUDIO_OBS}/${encodeURIComponent(activeClaim.id)}/complete`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-obs-token": obsTokenRef.current,
          },
          body: JSON.stringify({
            claimToken: activeClaim.claimToken,
          }),
          cache: "no-store",
        },
      );

      if (!response.ok) {
        throw new Error(await getResponseError(response));
      }

      finishActiveClaim();
      scheduleNextClaim(NEXT_AUDIO_DELAY_MS);
    } catch (completionError) {
      setError(
        completionError.message ||
          "No se pudo confirmar la reproducción del audio.",
      );
      await releaseAudio(activeClaim).catch(() => {});
      finishActiveClaim();
      scheduleNextClaim(EMPTY_QUEUE_POLL_MS);
    }
  }

  async function handlePlaybackFailure() {
    const activeClaim = activeClaimRef.current;
    if (!activeClaim) return;

    setError("La reproducción falló. El audio volverá a la cola.");
    await releaseAudio(activeClaim).catch(() => {});
    finishActiveClaim();
    scheduleNextClaim(EMPTY_QUEUE_POLL_MS);
  }

  async function releaseAudio(claim, { keepalive = false } = {}) {
    return fetch(
      `${envConfig.API_AUDIO_OBS}/${encodeURIComponent(claim.id)}/release`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-obs-token": obsTokenRef.current,
        },
        body: JSON.stringify({
          claimToken: claim.claimToken,
        }),
        cache: "no-store",
        keepalive,
      },
    );
  }

  function finishActiveClaim() {
    const activeClaim = activeClaimRef.current;

    if (activeClaim?.objectUrl) {
      URL.revokeObjectURL(activeClaim.objectUrl);
    }

    activeClaimRef.current = null;
    setCurrentAudio(null);
  }

  function scheduleNextClaim(delay) {
    window.clearTimeout(pollingRef.current);
    pollingRef.current = window.setTimeout(claimNextAudio, delay);
  }

  return (
    <main className="fixed inset-0 overflow-hidden bg-transparent">
      {currentAudio ? (
        <audio
          ref={audioRef}
          src={currentAudio.objectUrl}
          autoPlay
          preload="auto"
          onEnded={handlePlaybackComplete}
          onError={handlePlaybackFailure}
        />
      ) : null}

      {error ? (
        <p className="sr-only" role="status" aria-live="polite">
          {error}
        </p>
      ) : null}

      <style jsx global>{`
        body.stream-audio-route {
          background: transparent !important;
          overflow: hidden;
        }

        body.stream-audio-route header,
        body.stream-audio-route aside,
        body.stream-audio-route nav {
          display: none !important;
        }

        body.stream-audio-route main {
          margin: 0 !important;
          padding: 0 !important;
        }
      `}</style>
    </main>
  );
}

async function getResponseError(response) {
  try {
    const data = await response.json();
    return data.error || "Error del servidor";
  } catch {
    return "Error del servidor";
  }
}
