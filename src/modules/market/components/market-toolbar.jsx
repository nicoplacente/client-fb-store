"use client";

import { memo, useEffect, useRef, useState } from "react";
import { IconCheck, IconChevronDown, IconSearch } from "@tabler/icons-react";

function MarketToolbar({
  query,
  category,
  categories,
  onQueryChange,
  onCategoryChange,
}) {
  const [categoryOpen, setCategoryOpen] = useState(false);
  const categoryRef = useRef(null);
  const selectedCategory = getCategoryLabel(category);

  useEffect(() => {
    if (!categoryOpen) return undefined;

    function handlePointerDown(event) {
      if (!categoryRef.current?.contains(event.target)) {
        setCategoryOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setCategoryOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [categoryOpen]);

  function handleSelectCategory(nextCategory) {
    onCategoryChange(nextCategory);
    setCategoryOpen(false);
  }

  return (
    <div className="relative overflow-visible rounded-3xl border border-white/10 bg-[linear-gradient(135deg,rgba(220,38,38,0.16),rgba(10,10,10,0.72)_38%,rgba(10,10,10,0.88))] p-4 shadow-2xl shadow-black/25 ring-1 ring-white/[0.03] sm:p-6">
      <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-red-200/45 to-transparent" />
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-red-300/80">
            Tienda
          </p>
          <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">
            Recompensas listas para la comunidad
          </h1>
          <p className="mt-3 max-w-2xl text-neutral-400">
            Explora productos, codigos y beneficios disponibles. Filtra rapido y canjea con tus creditos.
          </p>
        </div>

        <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
          <label className="flex w-full items-center gap-2 rounded-xl border border-white/10 bg-neutral-950/80 px-3 py-2.5 text-neutral-400 shadow-inner shadow-black/20 transition focus-within:border-red-300/50 focus-within:ring-2 focus-within:ring-red-300/10 sm:min-w-72">
            <IconSearch size={18} />
            <input
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="Buscar producto"
              aria-label="Buscar producto"
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-neutral-600"
            />
          </label>
          <div ref={categoryRef} className="relative w-full sm:w-44">
            <button
              type="button"
              aria-label="Filtrar productos por categoria"
              aria-expanded={categoryOpen}
              aria-haspopup="listbox"
              onClick={() => setCategoryOpen((open) => !open)}
              className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl border border-white/10 bg-neutral-950/80 px-3 py-2.5 text-left text-sm font-semibold text-white shadow-inner shadow-black/20 outline-none transition hover:border-red-300/30 focus:border-red-300/50 focus:ring-2 focus:ring-red-300/10"
            >
              <span className="truncate">{selectedCategory}</span>
              <IconChevronDown
                size={16}
                className={`shrink-0 text-neutral-500 transition ${categoryOpen ? "rotate-180" : ""}`}
              />
            </button>

            {categoryOpen ? (
              <div
                role="listbox"
                aria-label="Categorias"
                className="absolute right-0 top-full z-30 mt-2 max-h-64 w-full min-w-44 overflow-y-auto rounded-xl border border-white/10 bg-neutral-950 p-1.5 shadow-2xl shadow-black/60 ring-1 ring-white/[0.04]"
              >
                {categories.map((item) => {
                  const selected = item === category;

                  return (
                    <button
                      key={item}
                      type="button"
                      role="option"
                      aria-selected={selected}
                      onClick={() => handleSelectCategory(item)}
                      className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm font-semibold transition ${
                        selected
                          ? "bg-red-500/15 text-white"
                          : "text-neutral-300 hover:bg-white/[0.06] hover:text-white"
                      }`}
                    >
                      <span className="truncate">{getCategoryLabel(item)}</span>
                      {selected ? (
                        <IconCheck size={16} className="shrink-0 text-red-200" />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function getCategoryLabel(category) {
  return category === "all" ? "Todas" : category;
}

export default memo(MarketToolbar);
