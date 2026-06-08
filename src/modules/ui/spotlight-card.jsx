"use client";

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

export function SpotlightGroup({ children, className = "", ...props }) {
  function handlePointerMove(event) {
    event.currentTarget
      .querySelectorAll("[data-spotlight-card]")
      .forEach((card) => updateSpotlight(card, event));
  }

  function handlePointerLeave(event) {
    event.currentTarget
      .querySelectorAll("[data-spotlight-card]")
      .forEach((card) => card.style.setProperty("--spotlight-opacity", "0"));
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
