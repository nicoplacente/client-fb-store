"use client";

import { useEffect, useMemo, useRef } from "react";

export const REWARD_WHEEL_SPIN_DURATION_MS = 7000;

const CANVAS_SIZE = 1000;
const WHEEL_PALETTE = [
  { light: "#fff47a", base: "#ffd62e", dark: "#e88a00" },
  { light: "#ff91ef", base: "#ec46d8", dark: "#9e1bb4" },
  { light: "#d88cff", base: "#a642ef", dark: "#6721b5" },
  { light: "#8eeeff", base: "#43aaf5", dark: "#2465c7" },
  { light: "#92ffd8", base: "#43dca7", dark: "#159572" },
  { light: "#fffdf5", base: "#ffeade", dark: "#e7bfc6" },
];

export function normalizeRewardWheelSpin(payload = {}) {
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
    redemptionId: payload.redemptionId,
    username: payload.username || "Alguien",
    prizes,
    winner: {
      id: payload.winner?.id,
      name: String(payload.winner?.name || "Premio").trim(),
    },
  };
}

export default function RewardWheel({
  spin,
  onSpinComplete,
  size = "stream",
  showUsername = false,
}) {
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
        duration: REWARD_WHEEL_SPIN_DURATION_MS,
        easing: "cubic-bezier(0.08, 0.72, 0.12, 1)",
        fill: "forwards",
      },
    );
    let cancelled = false;

    animation.finished
      .then(() => {
        if (!cancelled) onSpinComplete?.();
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      animation.cancel();
    };
  }, [onSpinComplete, spin.id, winnerRotation]);

  return (
    <>
      <div className="relative grid place-items-center">
        <div className="reward-wheel-glow absolute inset-[4%] rounded-full" />
        <div className="reward-wheel-pointer absolute -top-8 z-30">
          <span />
        </div>
        <div
          ref={wheelRef}
          className={`reward-wheel-canvas-wrap ${
            size === "modal" ? "reward-wheel-canvas-wrap-modal" : ""
          }`}
        >
          <canvas
            ref={canvasRef}
            width={CANVAS_SIZE}
            height={CANVAS_SIZE}
            className="reward-wheel-canvas"
            aria-label="Ruleta de recompensas"
          />
        </div>
      </div>

      {showUsername ? (
        <p className="reward-wheel-username">
          {spin.username} gira la ruleta
        </p>
      ) : null}

      <style jsx global>{`
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

        .reward-wheel-canvas-wrap.reward-wheel-canvas-wrap-modal {
          width: min(100%, 22rem);
          height: auto;
          aspect-ratio: 1;
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

        @media (max-aspect-ratio: 4 / 3) {
          .reward-wheel-canvas-wrap:not(.reward-wheel-canvas-wrap-modal) {
            width: min(76vw, 37rem);
            height: min(76vw, 37rem);
          }
        }
      `}</style>
    </>
  );
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
  const context = canvas?.getContext("2d");

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
