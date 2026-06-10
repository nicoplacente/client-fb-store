"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { IconSparkles } from "@tabler/icons-react";
import { io } from "socket.io-client";
import { envConfig } from "@/config";

const WHEEL_EVENT = "wheel:spin";
const SPIN_DURATION_MS = 7000;
const RESULT_DURATION_MS = 4200;
const EXIT_DURATION_MS = 700;
const CANVAS_SIZE = 1000;
const WHEEL_PALETTE = [
  { light: "#fff47a", base: "#ffd62e", dark: "#e88a00" },
  { light: "#ff91ef", base: "#ec46d8", dark: "#9e1bb4" },
  { light: "#d88cff", base: "#a642ef", dark: "#6721b5" },
  { light: "#8eeeff", base: "#43aaf5", dark: "#2465c7" },
  { light: "#92ffd8", base: "#43dca7", dark: "#159572" },
  { light: "#fffdf5", base: "#ffeade", dark: "#e7bfc6" },
];
const CONFETTI_COUNT = 72;

function normalizeSpin(payload = {}) {
  const prizes = Array.isArray(payload.prizes)
    ? payload.prizes
        .map((prize) => ({
          id: prize.id,
          name: String(prize.name || "").trim(),
          probability: Number(prize.probability || 0),
        }))
        .filter((prize) => prize.name && prize.probability > 0)
    : [];

  return {
    id: payload.id || `wheel-spin-${Date.now()}`,
    username: payload.username || "Alguien",
    prizes,
    winner: {
      id: payload.winner?.id,
      name: String(payload.winner?.name || "Premio").trim(),
    },
  };
}

function getSegments(prizes) {
  const total = prizes.reduce(
    (sum, prize) => sum + Number(prize.probability || 0),
    0,
  );
  let accumulatedDegrees = 0;

  return prizes.map((prize, index) => {
    const sizeDegrees = total
      ? (Number(prize.probability || 0) / total) * 360
      : 0;
    const startDegrees = accumulatedDegrees;
    const endDegrees = startDegrees + sizeDegrees;

    accumulatedDegrees = endDegrees;

    return {
      ...prize,
      index,
      startDegrees,
      endDegrees,
      centerDegrees: startDegrees + sizeDegrees / 2,
      palette: WHEEL_PALETTE[index % WHEEL_PALETTE.length],
    };
  });
}

function getWinnerRotation(segments, winner) {
  const winnerSegment =
    segments.find(
      (segment) =>
        winner?.id !== undefined && String(segment.id) === String(winner.id),
    ) ||
    segments.find(
      (segment) =>
        segment.name.toLocaleLowerCase("es") ===
        winner?.name?.toLocaleLowerCase("es"),
    ) ||
    segments[0];

  return 360 * 8 - Number(winnerSegment?.centerDegrees || 0);
}

function getLabelLayout(context, segment, radius) {
  const segmentDegrees = Math.max(1, segment.endDegrees - segment.startDegrees);
  const segmentRadians = segmentDegrees * (Math.PI / 180);
  const innerRadius = radius * 0.29;
  const outerRadius = radius * 0.92;
  const radialPosition = (innerRadius + outerRadius) / 2;
  const maxWidth = outerRadius - innerRadius;
  const arcWidth = 2 * radialPosition * Math.sin(segmentRadians / 2);
  const label = String(segment.name || "")
    .trim()
    .toUpperCase();
  let fontSize = Math.max(
    16,
    Math.min(
      34,
      18 + segmentDegrees * 0.42,
      38 - Math.max(0, segment.name.length - 12) * 0.45,
    ),
  );

  while (fontSize > 12) {
    context.font = `900 ${fontSize}px Montserrat, Arial, sans-serif`;
    const labelWidth = context.measureText(label).width;
    const maxHeight = Math.max(14, arcWidth * 0.68);

    if (labelWidth <= maxWidth && fontSize <= maxHeight) break;
    fontSize -= 1;
  }

  return {
    label,
    fontSize,
    maxWidth,
    radialPosition,
  };
}

function drawWheel(canvas, segments) {
  const context = canvas.getContext("2d");

  if (!context || !segments.length) return;

  const center = CANVAS_SIZE / 2;
  const radius = 404;

  context.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  context.save();
  context.translate(center, center);

  const purpleGlow = context.createRadialGradient(-120, -150, 70, 0, 0, 492);
  purpleGlow.addColorStop(0, "#ff78ff");
  purpleGlow.addColorStop(0.62, "#c32cff");
  purpleGlow.addColorStop(1, "#5b168c");
  context.beginPath();
  context.arc(0, 0, 484, 0, Math.PI * 2);
  context.fillStyle = purpleGlow;
  context.shadowColor = "rgba(221, 62, 255, 0.9)";
  context.shadowBlur = 34;
  context.fill();
  context.shadowBlur = 0;

  const goldRing = context.createRadialGradient(-130, -170, 45, 0, 0, 472);
  goldRing.addColorStop(0, "#fff9a8");
  goldRing.addColorStop(0.48, "#ffd530");
  goldRing.addColorStop(0.78, "#f39a08");
  goldRing.addColorStop(1, "#9c4b06");
  context.beginPath();
  context.arc(0, 0, 468, 0, Math.PI * 2);
  context.fillStyle = goldRing;
  context.fill();
  context.strokeStyle = "#64235f";
  context.lineWidth = 12;
  context.stroke();

  context.beginPath();
  context.arc(0, 0, 429, 0, Math.PI * 2);
  context.fillStyle = "#5c2859";
  context.fill();
  context.strokeStyle = "#7a2c83";
  context.lineWidth = 8;
  context.stroke();

  segments.forEach((segment) => {
    const startRadians = (segment.startDegrees - 90) * (Math.PI / 180);
    const endRadians = (segment.endDegrees - 90) * (Math.PI / 180);
    const centerRadians = (segment.centerDegrees - 90) * (Math.PI / 180);
    const segmentGradient = context.createRadialGradient(
      -115,
      -145,
      35,
      0,
      0,
      radius,
    );
    segmentGradient.addColorStop(0, segment.palette.light);
    segmentGradient.addColorStop(0.55, segment.palette.base);
    segmentGradient.addColorStop(1, segment.palette.dark);

    context.beginPath();
    context.moveTo(0, 0);
    context.arc(0, 0, radius, startRadians, endRadians);
    context.closePath();
    context.fillStyle = segmentGradient;
    context.fill();

    context.strokeStyle = "rgba(83, 24, 91, 0.88)";
    context.lineWidth = 7;
    context.stroke();

    context.save();
    context.clip();
    const highlight = context.createLinearGradient(
      -radius,
      -radius,
      radius,
      radius,
    );
    highlight.addColorStop(0, "rgba(255, 255, 255, 0.62)");
    highlight.addColorStop(0.28, "rgba(255, 255, 255, 0.1)");
    highlight.addColorStop(0.72, "rgba(255, 255, 255, 0)");
    highlight.addColorStop(1, "rgba(76, 19, 95, 0.2)");
    context.fillStyle = highlight;
    context.fillRect(-radius, -radius, radius * 2, radius * 2);
    context.restore();

    const labelLayout = getLabelLayout(context, segment, radius);

    context.save();

    context.rotate(centerRadians);
    context.translate(labelLayout.radialPosition, 0);

    // Texto radial, como en la imagen de referencia
    if (segment.centerDegrees > 90 && segment.centerDegrees < 270) {
      context.rotate(Math.PI);
    }

    context.fillStyle = "#ffffff";
    context.font = `900 ${labelLayout.fontSize}px Montserrat, Arial, sans-serif`;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.shadowColor = "rgba(0, 0, 0, 0.95)";
    context.shadowBlur = 9;
    context.lineWidth = Math.max(4, labelLayout.fontSize * 0.2);
    context.strokeStyle = "rgba(58, 12, 69, 0.86)";

    context.strokeText(labelLayout.label, 0, 0, labelLayout.maxWidth);
    context.fillText(labelLayout.label, 0, 0, labelLayout.maxWidth);

    context.restore();
    context.save();

    context.rotate(centerRadians);
    context.translate(labelLayout.radialPosition, 0);

    // Texto radial, como en la imagen de referencia
    if (segment.centerDegrees > 90 && segment.centerDegrees < 270) {
      context.rotate(Math.PI);
    }

    context.fillStyle = "#ffffff";
    context.font = `900 ${labelLayout.fontSize}px Montserrat, Arial, sans-serif`;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.shadowColor = "rgba(0, 0, 0, 0.95)";
    context.shadowBlur = 9;
    context.lineWidth = Math.max(4, labelLayout.fontSize * 0.2);
    context.strokeStyle = "rgba(58, 12, 69, 0.86)";

    context.strokeText(labelLayout.label, 0, 0, labelLayout.maxWidth);
    context.fillText(labelLayout.label, 0, 0, labelLayout.maxWidth);

    context.restore();
  });

  context.beginPath();
  context.arc(0, 0, radius + 4, 0, Math.PI * 2);
  context.strokeStyle = "#5d236a";
  context.lineWidth = 11;
  context.stroke();

  for (let index = 0; index < 20; index += 1) {
    const angle = (index / 20) * Math.PI * 2 - Math.PI / 2;
    const bulbX = Math.cos(angle) * 447;
    const bulbY = Math.sin(angle) * 447;
    const bulbGradient = context.createRadialGradient(
      bulbX - 4,
      bulbY - 5,
      2,
      bulbX,
      bulbY,
      16,
    );
    bulbGradient.addColorStop(0, "#fffbd2");
    bulbGradient.addColorStop(0.34, "#ffe44d");
    bulbGradient.addColorStop(0.72, "#f5a208");
    bulbGradient.addColorStop(1, "#9b4d04");

    context.beginPath();
    context.arc(bulbX, bulbY, 14, 0, Math.PI * 2);
    context.fillStyle = bulbGradient;
    context.shadowColor = "rgba(255, 226, 60, 0.95)";
    context.shadowBlur = 12;
    context.fill();
    context.shadowBlur = 0;
    context.strokeStyle = "#8b4104";
    context.lineWidth = 3;
    context.stroke();
  }

  context.beginPath();
  context.arc(0, 0, 86, 0, Math.PI * 2);
  const centerGradient = context.createRadialGradient(-24, -28, 8, 0, 0, 86);
  centerGradient.addColorStop(0, "#fffbd0");
  centerGradient.addColorStop(0.28, "#ffe954");
  centerGradient.addColorStop(0.7, "#ffc51a");
  centerGradient.addColorStop(1, "#e77d05");
  context.fillStyle = centerGradient;
  context.shadowColor = "rgba(255, 207, 31, 0.72)";
  context.shadowBlur = 20;
  context.fill();
  context.shadowBlur = 0;
  context.strokeStyle = "#8d3d08";
  context.lineWidth = 10;
  context.stroke();

  context.beginPath();
  context.arc(-22, -25, 20, 0, Math.PI * 2);
  context.fillStyle = "rgba(255, 255, 255, 0.62)";
  context.fill();
  context.restore();
}

function ConfettiLayer() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) return undefined;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const animations = Array.from(container.children).map((piece, index) => {
      const startX = ((index * 41) % 100) * (viewportWidth / 100);
      const drift = (index % 2 === 0 ? 1 : -1) * (35 + (index % 9) * 15);
      const spin = 360 + (index % 8) * 140;

      return piece.animate(
        [
          {
            opacity: 0,
            transform: `translate3d(${startX}px, -70px, 0) rotate(0deg)`,
            offset: 0,
          },
          {
            opacity: 1,
            offset: 0.12,
          },
          {
            opacity: 1,
            offset: 0.72,
          },
          {
            opacity: 0,
            transform: `translate3d(${startX + drift}px, ${viewportHeight + 100}px, 0) rotate(${spin}deg)`,
            offset: 1,
          },
        ],
        {
          duration: 1900 + (index % 8) * 130,
          delay: (index % 18) * 60,
          easing: "cubic-bezier(0.2, 0.7, 0.25, 1)",
          fill: "both",
        },
      );
    });

    return () => animations.forEach((animation) => animation.cancel());
  }, []);

  return (
    <div
      ref={containerRef}
      className="pointer-events-none fixed inset-0 z-40 overflow-hidden"
    >
      {Array.from({ length: CONFETTI_COUNT }, (_, index) => (
        <span
          key={index}
          className={`reward-confetti-piece reward-confetti-color-${index % 6}`}
        />
      ))}
    </div>
  );
}

function WheelOverlay({ spin, phase, onSpinComplete }) {
  const canvasRef = useRef(null);
  const wheelRef = useRef(null);
  const segments = useMemo(() => getSegments(spin.prizes), [spin.prizes]);
  const winnerRotation = useMemo(
    () => getWinnerRotation(segments, spin.winner),
    [segments, spin.winner],
  );

  useEffect(() => {
    drawWheel(canvasRef.current, segments);
  }, [segments]);

  useEffect(() => {
    const wheel = wheelRef.current;

    if (!wheel) return undefined;

    const animation = wheel.animate(
      [
        {
          transform: "scale(0.72) rotate(0deg)",
          opacity: 0,
          offset: 0,
        },
        {
          transform: "scale(1.03) rotate(70deg)",
          opacity: 1,
          offset: 0.09,
        },
        {
          transform: `scale(1) rotate(${winnerRotation}deg)`,
          opacity: 1,
          offset: 1,
        },
      ],
      {
        duration: SPIN_DURATION_MS,
        easing: "cubic-bezier(0.08, 0.72, 0.12, 1)",
        fill: "forwards",
      },
    );
    let cancelled = false;

    animation.finished
      .then(() => {
        if (!cancelled) onSpinComplete();
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      animation.cancel();
    };
  }, [onSpinComplete, spin.id, winnerRotation]);

  return (
    <div
      className={`reward-wheel-overlay fixed inset-0 grid place-items-center p-5 ${
        phase === "exiting" ? "reward-wheel-overlay-exit" : ""
      }`}
    >
      {phase !== "spinning" ? <ConfettiLayer /> : null}

      <div className="relative z-20 grid w-full justify-items-center">
        <div className="relative grid place-items-center">
          <div className="reward-wheel-glow absolute inset-[4%] rounded-full" />
          <div className="reward-wheel-pointer absolute -top-8 z-30">
            <span />
          </div>
          <div ref={wheelRef} className="reward-wheel-canvas-wrap">
            <canvas
              ref={canvasRef}
              width={CANVAS_SIZE}
              height={CANVAS_SIZE}
              className="reward-wheel-canvas"
              aria-label="Ruleta de recompensas"
            />
          </div>
        </div>

        {phase === "spinning" ? (
          <p className="reward-wheel-username">
            {spin.username} gira la ruleta
          </p>
        ) : null}
      </div>

      {phase !== "spinning" ? (
        <div className="reward-wheel-result fixed inset-0 z-50 grid place-items-center px-6 text-center">
          <div className="grid max-w-6xl justify-items-center gap-3">
            <span className="inline-flex items-center gap-2 text-xl font-black uppercase tracking-[0.32em] text-red-200">
              <IconSparkles size={26} />
              Premio ganador
            </span>
            <h1 className="reward-wheel-winner text-balance text-6xl font-black uppercase leading-none text-white sm:text-8xl lg:text-9xl">
              {spin.winner.name}
            </h1>
            <p className="reward-wheel-user-result text-3xl font-black uppercase text-white sm:text-5xl">
              {spin.username}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function StreamWheelPage() {
  const [activeSpin, setActiveSpin] = useState(null);
  const [phase, setPhase] = useState("spinning");
  const queueRef = useRef([]);
  const runningRef = useRef(false);
  const timersRef = useRef([]);

  useEffect(() => {
    document.documentElement.classList.add("reward-wheel-route");
    document.body.classList.add("reward-wheel-route");

    return () => {
      document.documentElement.classList.remove("reward-wheel-route");
      document.body.classList.remove("reward-wheel-route");
    };
  }, []);

  const runNextSpin = useCallback(() => {
    if (runningRef.current) return;

    const nextSpin = queueRef.current.shift();
    if (!nextSpin) return;

    runningRef.current = true;
    setPhase("spinning");
    setActiveSpin(nextSpin);
  }, []);

  const handleSpinComplete = useCallback(() => {
    setPhase("result");

    const exitTimer = window.setTimeout(() => {
      setPhase("exiting");
    }, RESULT_DURATION_MS);
    const finishTimer = window.setTimeout(() => {
      setActiveSpin(null);
      runningRef.current = false;
      runNextSpin();
    }, RESULT_DURATION_MS + EXIT_DURATION_MS);

    timersRef.current.push(exitTimer, finishTimer);
  }, [runNextSpin]);

  useEffect(() => {
    const socket = io(envConfig.SOCKET_URL, {
      transports: ["websocket", "polling"],
    });

    socket.on(WHEEL_EVENT, (payload) => {
      const spin = normalizeSpin(payload);

      if (!spin.prizes.length) return;

      queueRef.current.push(spin);
      runNextSpin();
    });

    return () => {
      socket.off(WHEEL_EVENT);
      socket.disconnect();
      timersRef.current.forEach((timer) => window.clearTimeout(timer));
      timersRef.current = [];
    };
  }, [runNextSpin]);

  return (
    <div className="reward-wheel-source" aria-live="polite">
      {activeSpin ? (
        <WheelOverlay
          spin={activeSpin}
          phase={phase}
          onSpinComplete={handleSpinComplete}
        />
      ) : null}

      <style jsx global>{`
        .reward-wheel-overlay {
          background: transparent;
          transition:
            opacity ${EXIT_DURATION_MS}ms ease,
            transform ${EXIT_DURATION_MS}ms ease;
        }

        .reward-wheel-overlay-exit {
          opacity: 0;
          transform: scale(0.9);
        }

        .reward-wheel-glow {
          background: radial-gradient(
            circle,
            rgba(255, 222, 65, 0.35),
            rgba(236, 72, 255, 0.34) 52%,
            transparent 72%
          );
          filter: blur(55px);
        }

        .reward-wheel-pointer {
          width: 86px;
          height: 112px;
          padding: 8px;
          clip-path: polygon(50% 100%, 0 24%, 12% 0, 88% 0, 100% 24%);
          background: linear-gradient(
            145deg,
            #ff9aff 0%,
            #a62fe4 44%,
            #5d178b 100%
          );
          filter: drop-shadow(0 8px 6px rgba(56, 13, 72, 0.72))
            drop-shadow(0 0 18px rgba(231, 72, 255, 0.95));
        }

        .reward-wheel-pointer span {
          position: relative;
          display: block;
          width: 100%;
          height: 100%;
          clip-path: inherit;
          background: linear-gradient(
            145deg,
            #fff9a7 0%,
            #ffd62f 35%,
            #f5a00a 72%,
            #b95b06 100%
          );
        }

        .reward-wheel-pointer span::after {
          position: absolute;
          top: 18px;
          left: 50%;
          width: 28px;
          height: 28px;
          content: "";
          border: 4px solid #a94f05;
          border-radius: 999px;
          background: radial-gradient(
            circle at 35% 30%,
            #fffbd7,
            #ffd532 45%,
            #e47d04 100%
          );
          box-shadow: 0 0 12px rgba(255, 224, 58, 0.88);
          transform: translateX(-50%);
        }

        .reward-wheel-canvas-wrap {
          width: min(70vh, 44rem);
          height: min(70vh, 44rem);
          will-change: transform, opacity;
        }

        .reward-wheel-canvas {
          display: block;
          width: 100%;
          height: 100%;
          filter: drop-shadow(0 28px 28px rgba(63, 12, 82, 0.62))
            drop-shadow(0 0 20px rgba(222, 65, 255, 0.48));
        }

        .reward-wheel-username {
          margin-top: -1.25rem;
          color: #fff;
          font-size: clamp(1.25rem, 2.4vw, 2.2rem);
          font-weight: 900;
          text-align: center;
          text-transform: uppercase;
          text-shadow:
            0 3px 0 #000,
            0 0 18px rgba(0, 0, 0, 0.95);
        }

        .reward-wheel-result {
          animation: reward-wheel-result-in 560ms cubic-bezier(0.16, 1, 0.3, 1)
            both;
          background: transparent;
        }

        .reward-wheel-winner {
          -webkit-text-stroke: 2px rgba(0, 0, 0, 0.78);
          text-shadow:
            0 8px 0 rgba(127, 29, 29, 0.94),
            0 18px 45px rgba(0, 0, 0, 0.98),
            0 0 42px rgba(239, 68, 68, 0.82);
        }

        .reward-wheel-user-result {
          -webkit-text-stroke: 1px rgba(0, 0, 0, 0.84);
          text-shadow:
            0 5px 0 rgba(0, 0, 0, 0.9),
            0 10px 26px rgba(0, 0, 0, 0.96);
        }

        .reward-confetti-piece {
          position: absolute;
          top: 0;
          left: 0;
          width: 13px;
          height: 24px;
          border-radius: 3px;
          opacity: 0;
        }

        .reward-confetti-color-0 {
          background: #ef4444;
        }

        .reward-confetti-color-1 {
          background: #f97316;
        }

        .reward-confetti-color-2 {
          background: #facc15;
        }

        .reward-confetti-color-3 {
          background: #ffffff;
        }

        .reward-confetti-color-4 {
          background: #fb7185;
        }

        .reward-confetti-color-5 {
          background: #60a5fa;
        }

        @keyframes reward-wheel-result-in {
          from {
            opacity: 0;
            transform: scale(0.68);
            filter: blur(14px);
          }

          to {
            opacity: 1;
            transform: scale(1);
            filter: blur(0);
          }
        }

        @media (max-aspect-ratio: 4 / 3) {
          .reward-wheel-canvas-wrap {
            width: min(76vw, 37rem);
            height: min(76vw, 37rem);
          }
        }
      `}</style>
    </div>
  );
}
