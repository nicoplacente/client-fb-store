"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { IconHeadset, IconSend, IconTicket } from "@tabler/icons-react";
import { toast } from "sonner";
import SectionContainer from "@/modules/ui/section-container";
import {
  createSupportTicket,
  getSupportTickets,
  normalizeTicket,
} from "@/modules/support/libs/support-api";

const emptyTicket = {
  subject: "",
  category: "market",
  message: "",
};

export default function SupportPage() {
  const [form, setForm] = useState(emptyTicket);
  const [tickets, setTickets] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [isPending, startTransition] = useTransition();

  const normalizedTickets = useMemo(
    () => tickets.map(normalizeTicket).filter((ticket) => ticket.id),
    [tickets]
  );

  useEffect(() => {
    let cancelled = false;

    async function loadTickets() {
      try {
        setLoadingTickets(true);
        const data = await getSupportTickets();
        if (!cancelled) setTickets(data);
      } catch {
        if (!cancelled) setTickets([]);
      } finally {
        if (!cancelled) setLoadingTickets(false);
      }
    }

    loadTickets();
    return () => {
      cancelled = true;
    };
  }, []);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    startTransition(async () => {
      try {
        await createSupportTicket({
          subject: form.subject.trim(),
          category: form.category,
          message: form.message.trim(),
        });
        toast.success("Consulta enviada");
        setForm(emptyTicket);
      } catch (err) {
        toast.error(err.message || "No se pudo enviar la consulta");
      }
    });
  }

  return (
    <SectionContainer className="space-y-8">
      <div>
        <p className="text-sm font-semibold uppercase text-red-300/80">Soporte</p>
        <h1 className="mt-2 text-4xl font-bold text-white">Centro de ayuda</h1>
        <p className="mt-3 max-w-2xl text-neutral-400">
          Enviá consultas sobre canjes, creditos, sorteos o problemas de cuenta.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
        <form
          onSubmit={handleSubmit}
          className="rounded-lg border border-white/10 bg-neutral-950/80 p-6"
        >
          <div className="mb-6 flex items-center gap-3">
            <span className="rounded-md border border-red-500/30 bg-red-500/10 p-2 text-red-200">
              <IconHeadset size={22} />
            </span>
            <div>
              <h2 className="text-xl font-semibold text-white">Nueva consulta</h2>
              <p className="text-sm text-neutral-500">Te respondemos desde el backend configurado.</p>
            </div>
          </div>

          <div className="grid gap-4">
            <label className="grid gap-2 text-sm font-medium text-neutral-300">
              Asunto
              <input
                value={form.subject}
                onChange={(event) => updateField("subject", event.target.value)}
                className="rounded-md border border-white/10 bg-neutral-900 px-3 py-2 text-white outline-none transition focus:border-red-400"
                required
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-neutral-300">
              Categoria
              <select
                value={form.category}
                onChange={(event) => updateField("category", event.target.value)}
                className="rounded-md border border-white/10 bg-neutral-900 px-3 py-2 text-white outline-none transition focus:border-red-400"
              >
                <option value="market">Market</option>
                <option value="giveaways">Sorteos</option>
                <option value="account">Cuenta</option>
                <option value="technical">Tecnico</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm font-medium text-neutral-300">
              Mensaje
              <textarea
                value={form.message}
                onChange={(event) => updateField("message", event.target.value)}
                rows={8}
                className="resize-none rounded-md border border-white/10 bg-neutral-900 px-3 py-2 text-white outline-none transition focus:border-red-400"
                required
              />
            </label>
          </div>

          <button
            disabled={isPending}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md bg-red-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <IconSend size={18} />
            Enviar consulta
          </button>
        </form>

        <aside className="rounded-lg border border-white/10 bg-neutral-950/70 p-6">
          <h2 className="flex items-center gap-2 text-xl font-semibold text-white">
            <IconTicket size={22} />
            Mis tickets
          </h2>
          <div className="mt-5 space-y-3">
            {loadingTickets ? (
              <p className="rounded-md border border-white/10 bg-neutral-900/60 p-4 text-sm text-neutral-400">
                Cargando tickets...
              </p>
            ) : normalizedTickets.length === 0 ? (
              <p className="rounded-md border border-white/10 bg-neutral-900/60 p-4 text-sm text-neutral-400">
                No hay tickets para mostrar.
              </p>
            ) : (
              normalizedTickets.map((ticket) => (
                <article
                  key={ticket.id}
                  className="rounded-md border border-white/10 bg-neutral-900/60 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-semibold text-white">{ticket.subject}</h3>
                    <span className="rounded bg-white/5 px-2 py-1 text-xs text-neutral-400">
                      {ticket.status}
                    </span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm text-neutral-500">
                    {ticket.message}
                  </p>
                </article>
              ))
            )}
          </div>
        </aside>
      </div>
    </SectionContainer>
  );
}
