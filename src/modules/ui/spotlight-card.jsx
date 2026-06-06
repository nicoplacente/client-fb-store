"use client";

import { useRef } from "react";

function updateSpotlight(card, event) {
  const rect = card.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  card.style.setProperty("--spotlight-opacity", "1");
  card.style.setProperty("--x", `${x}px`);
  card.style.setProperty("--y", `${y}px`);

  const cta = card.querySelector("[data-spotlight-cta]");
  if (cta) {
    const ctaRect = cta.getBoundingClientRect();
    card.style.setProperty("--cta-x", `${event.clientX - ctaRect.left}px`);
    card.style.setProperty("--cta-y", `${event.clientY - ctaRect.top}px`);
  }
}

function resetSpotlight(card) {
  card?.style.setProperty("--spotlight-opacity", "0");
}

function getSpotlightCard(target, group) {
  if (!target?.closest) return null;

  const card = target.closest("[data-spotlight-card]");

  if (!card || !group.contains(card)) return null;

  return card;
}

export function SpotlightGroup({ children, className = "", ...props }) {
  const activeCardRef = useRef(null);

  function handlePointerMove(event) {
    const card = getSpotlightCard(event.target, event.currentTarget);

    if (!card) {
      resetSpotlight(activeCardRef.current);
      activeCardRef.current = null;
      return;
    }

    if (activeCardRef.current && activeCardRef.current !== card) {
      resetSpotlight(activeCardRef.current);
    }

    activeCardRef.current = card;
    updateSpotlight(card, event);
  }

  function handlePointerLeave() {
    resetSpotlight(activeCardRef.current);
    activeCardRef.current = null;
  }

  return (
    <div
      {...props}
      data-spotlight-group
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={className}
    >
      {children}
    </div>
  );
}

export default function SpotlightCard({
  children,
  className = "",
  hue = 338.69,
  saturation = "100%",
  lightness = "48.04%",
  ...props
}) {
  function handlePointerMove(event) {
    if (event.currentTarget.closest("[data-spotlight-group]")) return;
    updateSpotlight(event.currentTarget, event);
  }

  function handlePointerLeave(event) {
    if (event.currentTarget.closest("[data-spotlight-group]")) return;
    event.currentTarget.style.setProperty("--spotlight-opacity", "0");
  }

  return (
    <article
      {...props}
      data-spotlight-card
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={`spotlight-card ${className}`}
      style={{
        "--hue": hue,
        "--saturation": saturation,
        "--lightness": lightness,
        ...props.style,
      }}
    >
      {children}
    </article>
  );
}
