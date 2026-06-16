"use client";

import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { IconCrown, IconGift, IconSparkles } from "@tabler/icons-react";
import { envConfig } from "@/config";

const ALERT_EVENT = "product:redemption:alert";
const ALERT_SOUNDS = {
  alarm: "/sounds/alarm.mp3",
  magical_reveal: "/sounds/magical-reveal.mp3",
};
const DEFAULT_ALERT = {
  type: "confetti",
  message: "",
  sound: "",
  username: "",
  product: {
    name: "",
    imageUrl: "",
  },
  quantity: 1,
  durationSeconds: 8,
};
const CONFETTI_CSS = Array.from({ length: 44 }, (_, index) => {
  const x = (index * 37) % 100;
  const drift = (index % 2 === 0 ? 1 : -1) * (24 + (index % 7) * 9);
  const spin = 240 + (index % 9) * 80;
  const hue = (index * 47) % 360;

  return `.stream-confetti-${index}{left:${x}%;animation-delay:${(index % 12) * 90}ms;--drift:${drift}px;--spin:${spin}deg;background:hsl(${hue},90%,62%)}`;
}).join("");
const FLAME_CSS = Array.from({ length: 30 }, (_, index) => {
  const x = (index * 29) % 100;
  const scale = 0.7 + (index % 6) * 0.12;

  return `.stream-flame-${index}{left:${x}%;animation-delay:${(index % 10) * 110}ms;--scale:${scale}}`;
}).join("");

function clampDuration(value) {
  const duration = Number(value || DEFAULT_ALERT.durationSeconds);

  if (!Number.isFinite(duration)) return DEFAULT_ALERT.durationSeconds;

  return Math.min(30, Math.max(3, Math.floor(duration)));
}

function normalizeAlert(alert = {}) {
  return {
    ...DEFAULT_ALERT,
    ...alert,
    product: {
      ...DEFAULT_ALERT.product,
      ...(alert.product || {}),
    },
    durationSeconds: clampDuration(alert.durationSeconds),
  };
}

function ConfettiLayer() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: 44 }, (_, index) => (
        <span
          key={index}
          className={`stream-confetti-piece stream-confetti-${index}`}
        />
      ))}
    </div>
  );
}

function FireLayer() {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-72 overflow-hidden">
      {Array.from({ length: 30 }, (_, index) => (
        <span
          key={index}
          className={`stream-flame stream-flame-${index}`}
        />
      ))}
    </div>
  );
}

function AlertEffects({ type }) {
  if (type === "fire") return <FireLayer />;
  if (type === "legendary") {
    return (
      <>
        <ConfettiLayer />
        <FireLayer />
      </>
    );
  }

  return <ConfettiLayer />;
}

function StreamAlert({ alert }) {
  const isLegendary = alert.type === "legendary";
  const isHighlighted = Boolean(alert.highlighted);
  const username = alert.username || "Alguien";
  const productName = alert.product?.name || "premio";

  return (
    <div className="fixed inset-0 z-[9999] grid place-items-center overflow-hidden bg-transparent px-8 py-10">
      <AlertEffects type={alert.type} />
      <div
        className={`stream-alert-card relative grid w-full justify-items-center gap-5 overflow-hidden rounded-2xl border text-center shadow-2xl ${
          isHighlighted
            ? "stream-alert-card-featured max-w-5xl border-yellow-100/70 bg-[linear-gradient(135deg,rgba(146,64,14,0.96),rgba(217,119,6,0.94)_38%,rgba(113,63,18,0.96))] px-6 py-7 shadow-[0_2rem_7rem_rgba(245,158,11,0.34)] ring-1 ring-yellow-100/35 sm:px-10 sm:py-10"
            : `max-w-4xl px-8 py-8 ${
                isLegendary
                  ? "border-emerald-200/35 bg-[linear-gradient(135deg,rgba(6,78,59,0.88),rgba(20,83,45,0.82))] shadow-emerald-500/20"
                  : "border-emerald-200/25 bg-[linear-gradient(135deg,rgba(5,46,22,0.86),rgba(6,78,59,0.78))] shadow-black/70"
              }`
        }`}
      >
        <div
          className={`absolute inset-0 rounded-2xl ${
            isHighlighted
              ? "bg-[radial-gradient(circle_at_50%_0%,rgba(254,249,195,0.72),transparent_30%),radial-gradient(circle_at_50%_78%,rgba(120,53,15,0.38),transparent_44%),linear-gradient(135deg,rgba(255,255,255,0.2),transparent_32%,rgba(120,53,15,0.18))]"
              : "bg-[radial-gradient(circle_at_top,rgba(110,231,183,0.22),transparent_34%),linear-gradient(135deg,rgba(34,197,94,0.14),transparent_48%)]"
          }`}
        />
        {isHighlighted ? (
          <>
            <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-yellow-50/90 to-transparent" />
            <div className="stream-featured-shine absolute -left-1/3 top-0 h-full w-1/3 rotate-12 bg-gradient-to-r from-transparent via-yellow-50/30 to-transparent" />
          </>
        ) : null}

        <div className={`relative grid justify-items-center ${isHighlighted ? "gap-5" : "gap-4"}`}>
          <span
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-black uppercase ${
              isHighlighted
                ? "border-yellow-50/70 bg-yellow-100/20 text-yellow-50 shadow-[0_0_2rem_rgba(254,240,138,0.36)]"
                : "border-emerald-100/30 bg-emerald-300/12 text-emerald-50"
            }`}
          >
            {isHighlighted ? <IconCrown size={18} /> : <IconSparkles size={18} />}
            {isHighlighted ? "Producto destacado" : "Canje confirmado"}
          </span>

          {alert.product?.imageUrl ? (
            <div
              className={`relative ${
                isHighlighted ? "stream-featured-product" : ""
              }`}
            >
              {isHighlighted ? (
                <span className="absolute inset-[-1.25rem] rounded-[2rem] bg-yellow-200/28 blur-2xl" />
              ) : null}
              <img
                src={alert.product.imageUrl}
                alt={`Imagen de ${productName}`}
                className={`relative object-cover shadow-2xl shadow-black/60 ${
                  isHighlighted
                    ? "size-52 rounded-[1.75rem] border border-yellow-50/65 ring-4 ring-yellow-100/20 sm:size-64"
                    : "h-40 w-40 rounded-2xl border border-emerald-100/20"
                }`}
              />
            </div>
          ) : (
            <span
              className={`grid place-items-center border bg-neutral-950/80 text-amber-100 ${
                isHighlighted
                  ? "size-44 rounded-[1.75rem] border-yellow-50/65 shadow-[0_1.5rem_4rem_rgba(245,158,11,0.3)] sm:size-56"
                  : "size-32 rounded-2xl border-emerald-100/20"
              }`}
            >
              <IconGift size={isHighlighted ? 96 : 72} stroke={1.3} />
            </span>
          )}

          <h1
            className={`max-w-4xl text-balance font-black uppercase leading-tight text-white drop-shadow-[0_5px_24px_rgba(0,0,0,0.9)] ${
              isHighlighted ? "text-5xl sm:text-7xl" : "text-4xl sm:text-6xl"
            }`}
          >
            <span
              className={isHighlighted ? "text-yellow-100" : "text-emerald-200"}
            >
              {username}
            </span>{" "}
            ha canjeado {productName}
          </h1>

          <div
            className={`inline-flex flex-wrap items-center justify-center gap-3 font-black text-amber-100 ${
              isHighlighted ? "text-xl sm:text-2xl" : "text-lg"
            }`}
          >
            <span
              className={`rounded-lg border px-3 py-1 ${
                isHighlighted
                  ? "border-yellow-50/45 bg-yellow-50/18 text-yellow-50"
                  : "border-emerald-100/20 bg-emerald-100/10 text-emerald-50"
              }`}
            >
              {productName}
            </span>
            {Number(alert.quantity || 1) > 1 ? (
              <span
                className={`rounded-lg border px-3 py-1 ${
                  isHighlighted
                    ? "border-yellow-50/45 bg-yellow-50/18 text-yellow-50"
                    : "border-emerald-100/20 bg-emerald-100/10 text-emerald-50"
                }`}
              >
                x{alert.quantity}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StreamAlertsPage() {
  const [activeAlert, setActiveAlert] = useState(null);
  const audioRef = useRef(null);
  const queueRef = useRef([]);
  const timeoutRef = useRef(null);
  const activeRef = useRef(false);

  useEffect(() => {
    document.body.classList.add("stream-alerts-route");

    return () => {
      document.body.classList.remove("stream-alerts-route");
      document.body.style.background = "";
    };
  }, []);

  useEffect(() => {
    if (!activeAlert?.sound) return;

    const soundPath = ALERT_SOUNDS[activeAlert.sound];
    if (!soundPath) return;

    const audio = new Audio(soundPath);
    audio.volume = activeAlert.highlighted ? 0.85 : 0.62;

    if (activeAlert.sound === "magical_reveal") {
      audio.currentTime = 1;
    }

    audioRef.current = audio;
    audio.play().catch(() => {});

    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, [activeAlert]);

  useEffect(() => {
    function showNextAlert() {
      if (activeRef.current) return;

      const nextAlert = queueRef.current.shift();
      if (!nextAlert) return;

      activeRef.current = true;
      setActiveAlert(nextAlert);

      timeoutRef.current = window.setTimeout(() => {
        setActiveAlert(null);
        activeRef.current = false;
        showNextAlert();
      }, nextAlert.durationSeconds * 1000);
    }

    const socket = io(envConfig.SOCKET_URL, {
      transports: ["websocket", "polling"],
    });

    socket.on(ALERT_EVENT, (payload) => {
      queueRef.current.push(normalizeAlert(payload));
      showNextAlert();
    });

    return () => {
      socket.off(ALERT_EVENT);
      socket.disconnect();
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <main className="fixed inset-0 z-[9998] overflow-hidden bg-transparent">
      {activeAlert ? <StreamAlert alert={activeAlert} /> : null}

      <style jsx global>{`
        body.stream-alerts-route {
          background: transparent !important;
          overflow: hidden;
        }

        body.stream-alerts-route header,
        body.stream-alerts-route aside,
        body.stream-alerts-route nav {
          display: none !important;
        }

        body.stream-alerts-route main {
          padding: 0 !important;
          margin: 0 !important;
        }

        .stream-alert-card {
          animation: stream-alert-pop 620ms cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        .stream-alert-card-featured::before {
          position: absolute;
          inset: -2px;
          content: "";
          border-radius: inherit;
          background: conic-gradient(
            from 160deg,
            transparent 0deg,
            rgba(254, 240, 138, 0.68) 44deg,
            rgba(239, 68, 68, 0.34) 92deg,
            transparent 154deg,
            rgba(251, 191, 36, 0.78) 232deg,
            transparent 360deg
          );
          opacity: 0.7;
          pointer-events: none;
          animation: stream-featured-border 4.8s linear infinite;
          -webkit-mask:
            linear-gradient(#000 0 0) content-box,
            linear-gradient(#000 0 0);
          -webkit-mask-composite: xor;
          mask:
            linear-gradient(#000 0 0) content-box,
            linear-gradient(#000 0 0);
          mask-composite: exclude;
          padding: 2px;
        }

        .stream-featured-product {
          animation: stream-featured-float 2400ms ease-in-out infinite;
        }

        .stream-featured-shine {
          animation: stream-featured-shine 2200ms ease-in-out infinite;
        }

        .stream-confetti-piece {
          position: absolute;
          top: -24px;
          width: 10px;
          height: 18px;
          border-radius: 3px;
          animation: stream-confetti-fall 1900ms ease-in infinite;
        }

        .stream-flame {
          position: absolute;
          bottom: -80px;
          width: 46px;
          height: 110px;
          border-radius: 999px 999px 999px 999px;
          background:
            radial-gradient(circle at 50% 35%, rgba(255, 249, 196, 0.96), transparent 22%),
            radial-gradient(circle at 50% 55%, rgba(251, 191, 36, 0.9), transparent 42%),
            radial-gradient(circle at 50% 70%, rgba(239, 68, 68, 0.86), transparent 64%);
          filter: blur(1px);
          opacity: 0.88;
          transform: translateX(-50%) scale(var(--scale));
          animation: stream-flame-rise 1250ms ease-in infinite;
        }

        ${CONFETTI_CSS}
        ${FLAME_CSS}

        @keyframes stream-alert-pop {
          from {
            opacity: 0;
            transform: translateY(42px) scale(0.86);
            filter: blur(12px);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0);
          }
        }

        @keyframes stream-featured-border {
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes stream-featured-float {
          0%,
          100% {
            transform: translateY(0) scale(1);
          }

          50% {
            transform: translateY(-0.35rem) scale(1.015);
          }
        }

        @keyframes stream-featured-shine {
          0% {
            transform: translateX(0) rotate(12deg);
            opacity: 0;
          }

          35% {
            opacity: 1;
          }

          100% {
            transform: translateX(420%) rotate(12deg);
            opacity: 0;
          }
        }

        @keyframes stream-confetti-fall {
          from {
            transform: translate3d(0, -40px, 0) rotate(0deg);
            opacity: 0;
          }

          12% {
            opacity: 1;
          }

          to {
            transform: translate3d(var(--drift), 110vh, 0) rotate(var(--spin));
            opacity: 0;
          }
        }

        @keyframes stream-flame-rise {
          from {
            transform: translateX(-50%) translateY(80px) scale(var(--scale));
            opacity: 0;
          }

          22% {
            opacity: 0.92;
          }

          to {
            transform: translateX(-50%) translateY(-260px) scale(calc(var(--scale) * 1.5));
            opacity: 0;
          }
        }
      `}</style>
    </main>
  );
}
