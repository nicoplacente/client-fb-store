"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { IconGift, IconTicket, IconUsers } from "@tabler/icons-react";
import { toast } from "sonner";
import SectionContainer from "@/modules/ui/section-container";
import {
  getGiveaways,
  joinGiveaway,
  normalizeGiveaway,
} from "@/modules/giveaways/libs/giveaway-api";

function formatDate(value) {
  if (!value) return "Fecha abierta";
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function GiftsPage() {
  const [giveaways, setGiveaways] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const normalizedGiveaways = useMemo(
    () => giveaways.map(normalizeGiveaway).filter((giveaway) => giveaway.id),
    [giveaways]
  );

  useEffect(() => {
    let cancelled = false;

    async function loadGiveaways() {
      try {
        setLoading(true);
        setError("");
        const data = await getGiveaways();
        if (!cancelled) setGiveaways(data);
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "No se pudieron cargar los sorteos");
          setGiveaways([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadGiveaways();
    return () => {
      cancelled = true;
    };
  }, []);

  function handleJoin(giveaway) {
    startTransition(async () => {
      try {
        await joinGiveaway(giveaway.id);
        toast.success("Participacion registrada");
      } catch (err) {
        toast.error(err.message || "No se pudo participar");
      }
    });
  }

  return (
    <SectionContainer className="space-y-8">
      <div>
        <p className="text-sm font-semibold uppercase text-red-300/80">Sorteos</p>
        <h1 className="mt-2 text-4xl font-bold text-white">Premios activos</h1>
        <p className="mt-3 max-w-2xl text-neutral-400">
          Participá en sorteos activos y seguí el estado de los proximos premios.
        </p>
      </div>

      {loading ? (
        <div className="rounded-lg border border-white/10 bg-neutral-950/70 p-10 text-center text-neutral-400">
          Cargando sorteos...
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-10 text-center text-red-200">
          {error}
        </div>
      ) : normalizedGiveaways.length === 0 ? (
        <div className="rounded-lg border border-white/10 bg-neutral-950/70 p-10 text-center text-neutral-400">
          No hay sorteos publicados.
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {normalizedGiveaways.map((giveaway) => (
            <article
              key={giveaway.id}
              className="grid overflow-hidden rounded-lg border border-white/10 bg-neutral-950/75 md:grid-cols-[220px_1fr]"
            >
              <div className="aspect-[4/3] bg-neutral-900 md:aspect-auto">
                {giveaway.imageUrl ? (
                  <img
                    src={giveaway.imageUrl}
                    alt={giveaway.title}
                    className="h-full w-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <div className="flex h-full min-h-48 items-center justify-center text-red-300/70">
                    <IconGift size={56} />
                  </div>
                )}
              </div>
              <div className="flex flex-col justify-between gap-5 p-5">
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="text-xl font-bold text-white">
                      {giveaway.title}
                    </h2>
                    <span className="rounded-md border border-white/10 px-2 py-1 text-xs text-neutral-400">
                      {giveaway.status}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-neutral-400">
                    {giveaway.description || giveaway.prize}
                  </p>
                </div>

                <div className="grid gap-3 text-sm text-neutral-400 sm:grid-cols-3">
                  <span className="flex items-center gap-2">
                    <IconTicket size={17} /> {giveaway.prize}
                  </span>
                  <span className="flex items-center gap-2">
                    <IconUsers size={17} /> {giveaway.participants}
                  </span>
                  <span>{formatDate(giveaway.endsAt)}</span>
                </div>

                <button
                  disabled={isPending || giveaway.status !== "active"}
                  onClick={() => handleJoin(giveaway)}
                  className="inline-flex w-fit items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:bg-neutral-800 disabled:text-neutral-500"
                >
                  <IconGift size={18} />
                  Participar
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </SectionContainer>
  );
}
