"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { IconSparkles } from "@tabler/icons-react";
import { io } from "socket.io-client";
import { envConfig } from "@/config";
import RewardWheel, {
  normalizeRewardWheelSpin,
} from "@/modules/reward-wheel/components/reward-wheel";

const WHEEL_EVENT = "wheel:spin";
const RESULT_DURATION_MS = 4200;
const EXIT_DURATION_MS = 700;
const CONFETTI_COUNT = 72;

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
  return (
    <div
      className={`reward-wheel-overlay fixed inset-0 grid place-items-center p-5 ${
        phase === "exiting" ? "reward-wheel-overlay-exit" : ""
      }`}
    >
      {phase !== "spinning" ? <ConfettiLayer /> : null}

      <div className="relative z-20 grid w-full justify-items-center">
        <RewardWheel
          spin={spin}
          showUsername={phase === "spinning"}
          onSpinComplete={onSpinComplete}
        />
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
      const spin = normalizeRewardWheelSpin(payload);

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

      `}</style>
    </div>
  );
}
