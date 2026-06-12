"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import {
  IconChevronDown,
  IconClock,
  IconHeadset,
  IconSend,
  IconSparkles,
  IconTicket,
} from "@tabler/icons-react";
import { toast } from "sonner";
import useAppContext from "@/context/use-app-context";
import { AuthContext } from "@/context/auth-context/auth-context";
import SectionContainer from "@/modules/ui/section-container";
import { getErrorMessage } from "@/modules/api/error-message";
import {
  createSupportMessage,
  createSupportTicket,
  getSupportTickets,
  normalizeTicket,
} from "@/modules/support/libs/support-api";
import { formatDateTime } from "@/modules/dashboard/lib/formatters";
import { StatusBadge } from "@/modules/dashboard/components/tickets/ticket-status";

const emptyTicket = {
  subject: "",
  category: "general",
  message: "",
};

export default function SupportPage() {
  const { user } = useAppContext(AuthContext);
  const [form, setForm] = useState(emptyTicket);
  const [tickets, setTickets] = useState([]);
  const [expandedTicketId, setExpandedTicketId] = useState(null);
  const [replyDrafts, setReplyDrafts] = useState({});
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [isPending, startTransition] = useTransition();

  const normalizedTickets = useMemo(
    () =>
      tickets
        .map(normalizeTicket)
        .filter((ticket) => ticket.id && ticket.category !== "market"),
    [tickets],
  );
  const activeTickets = normalizedTickets.filter(
    (ticket) => ticket.status !== "closed",
  ).length;

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

    if (!user) {
      toast.error("Inicia sesion para enviar una consulta");
      return;
    }

    startTransition(async () => {
      try {
        const result = await createSupportTicket({
          subject: form.subject.trim(),
          category: form.category,
          message: form.message.trim(),
        });
        toast.success("Consulta enviada");
        setForm(emptyTicket);
        if (result?.ticket) {
          setTickets((current) => [result.ticket, ...current]);
          setExpandedTicketId(result.ticket.id);
        }
      } catch (error) {
        toast.error(getErrorMessage(error, "No se pudo enviar la consulta"));
      }
    });
  }

  function handleReply(ticket) {
    const message = String(replyDrafts[ticket.id] || "").trim();

    if (!message) {
      toast.error("Escribí una respuesta");
      return;
    }

    startTransition(async () => {
      try {
        const result = await createSupportMessage(ticket.id, message, {
          senderRole: "user",
        });
        setReplyDrafts((current) => ({ ...current, [ticket.id]: "" }));
        if (result?.ticket) {
          setTickets((current) =>
            current.map((item) =>
              item.id === ticket.id ? result.ticket : item,
            ),
          );
        }
      } catch (error) {
        toast.error(getErrorMessage(error, "No se pudo responder"));
      }
    });
  }

  return (
    <SectionContainer className="space-y-8">
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-neutral-950/75 shadow-xl shadow-black/20">
        <div className="grid gap-5 p-5 sm:p-7 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div className="flex items-start gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl border border-red-300/20 bg-red-500/10 text-red-200">
              <IconHeadset size={25} />
            </span>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-red-300/80">
                Soporte
              </p>
              <h1 className="mt-2 text-3xl font-black text-white sm:text-4xl">
                Centro de ayuda
              </h1>
              <p className="mt-3 max-w-2xl leading-6 text-neutral-400">
                Enviá consultas sobre canjes, créditos, sorteos o problemas de
                cuenta y seguí cada respuesta desde tu bandeja.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:flex">
            <SupportMetric label="Tickets" value={normalizedTickets.length} />
            <SupportMetric label="Activos" value={activeTickets} tone="red" />
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(20rem,0.8fr)_minmax(0,1.2fr)] xl:items-start">
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-white/10 bg-neutral-950/80 p-4 shadow-xl shadow-black/20 sm:p-6 xl:sticky xl:top-6"
        >
          <div className="mb-6 flex items-start gap-3 border-b border-white/10 pb-5">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-red-500/25 bg-red-500/10 text-red-200">
              <IconSparkles size={20} />
            </span>
            <div>
              <h2 className="text-xl font-black text-white">
                Nueva consulta
              </h2>
              <p className="mt-1 text-sm leading-5 text-neutral-500">
                {user
                  ? "Contanos qué pasó con el mayor detalle posible."
                  : "Iniciá sesión para que podamos responderte."}
              </p>
            </div>
          </div>

          {!user ? (
            <div role="status" className="mb-5 rounded-xl border border-red-500/25 bg-red-500/10 p-4 text-sm font-medium leading-6 text-red-100">
              Para enviar una consulta necesitás iniciar sesión. Así, soporte
              puede responderte en tu ticket.
            </div>
          ) : null}

          <div className="grid gap-5">
            <label className="grid gap-2 text-sm font-bold text-neutral-300">
              Asunto
              <input
                value={form.subject}
                onChange={(event) => updateField("subject", event.target.value)}
                placeholder="Resumen breve de la consulta"
                className="h-12 rounded-xl border border-white/10 bg-neutral-900/80 px-4 text-white outline-none transition placeholder:text-neutral-600 hover:border-white/20 focus:border-red-400/60"
                disabled={!user || isPending}
                required
              />
            </label>
            <label className="grid gap-2 text-sm font-bold text-neutral-300">
              Categoría
              <select
                value={form.category}
                onChange={(event) =>
                  updateField("category", event.target.value)
                }
                className="h-12 cursor-pointer rounded-xl border border-white/10 bg-neutral-900/80 px-4 text-white outline-none transition hover:border-white/20 focus:border-red-400/60"
                disabled={!user || isPending}
              >
                <option value="general">General</option>
                <option value="credits">Créditos</option>
                <option value="giveaways">Sorteos</option>
                <option value="account">Cuenta</option>
                <option value="technical">Técnico</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm font-bold text-neutral-300">
              Mensaje
              <textarea
                value={form.message}
                onChange={(event) => updateField("message", event.target.value)}
                rows={8}
                placeholder="Describí el problema, qué intentaste y qué resultado esperabas."
                className="resize-none rounded-xl border border-white/10 bg-neutral-900/80 px-4 py-3 text-white outline-none transition placeholder:text-neutral-600 hover:border-white/20 focus:border-red-400/60"
                disabled={!user || isPending}
                required
              />
            </label>
          </div>

          <button
            disabled={!user || isPending}
            className="inline-flex min-h-12 mt-6 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-red-300/20 bg-gradient-to-r from-red-700 to-red-500 px-5 py-3 text-sm font-black text-white shadow-[0_16px_34px_rgba(255,45,45,0.22)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_42px_rgba(255,45,45,0.30)] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            <IconSend size={18} />
            {isPending ? "Enviando..." : "Enviar consulta"}
          </button>
        </form>

        <aside className="overflow-hidden rounded-2xl border border-white/10 bg-neutral-950/75 shadow-xl shadow-black/20">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-white/[0.025] p-4 sm:p-5">
            <div>
              <h2 className="flex items-center gap-2 text-xl font-black text-white">
                <IconTicket size={22} className="text-red-200" />
                Mis tickets
              </h2>
              <p className="mt-1 text-sm text-neutral-500">
                Historial de consultas y respuestas.
              </p>
            </div>
            <span className="rounded-full border border-white/10 bg-neutral-900 px-3 py-1.5 text-xs font-black text-neutral-300">
              {normalizedTickets.length}
            </span>
          </div>
          <div className="grid gap-3 p-3 sm:p-4">
            {loadingTickets ? (
              <p className="rounded-xl border border-white/10 bg-neutral-900/60 p-6 text-center text-sm text-neutral-400">
                Cargando tickets...
              </p>
            ) : normalizedTickets.length === 0 ? (
              <p className="rounded-xl border border-white/10 bg-neutral-900/60 p-6 text-center text-sm text-neutral-400">
                No hay tickets para mostrar.
              </p>
            ) : (
              normalizedTickets.map((ticket) => (
                <article
                  key={ticket.id}
                  className="overflow-hidden rounded-2xl border border-white/10 bg-neutral-900/55 transition hover:border-white/20"
                >
                  <button
                    type="button"
                    aria-expanded={expandedTicketId === ticket.id}
                    aria-controls={`ticket-${ticket.id}-thread`}
                    onClick={() =>
                      setExpandedTicketId((current) =>
                        current === ticket.id ? null : ticket.id,
                      )
                    }
                    className="flex w-full items-start justify-between gap-4 p-4 text-left sm:p-5"
                  >
                    <span className="min-w-0">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-[11px] font-black uppercase text-neutral-400">
                          {ticket.category}
                        </span>
                        <StatusBadge status={ticket.status} />
                      </span>
                      <span className="mt-3 block font-black text-white">
                        {ticket.subject}
                      </span>
                      <span className="mt-1.5 line-clamp-2 block text-sm leading-5 text-neutral-500">
                        {ticket.message}
                      </span>
                      {ticket.createdAt ? (
                        <span className="mt-3 flex items-center gap-1.5 text-xs text-neutral-600">
                          <IconClock size={14} />
                          {formatDateTime(ticket.createdAt)}
                        </span>
                      ) : null}
                    </span>
                    <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-white/10 bg-neutral-950 text-neutral-500">
                      <IconChevronDown
                        size={16}
                        className={`text-neutral-500 transition ${
                          expandedTicketId === ticket.id ? "rotate-180" : ""
                        }`}
                      />
                    </span>
                  </button>
                  {expandedTicketId === ticket.id ? (
                    <TicketThread
                      ticket={ticket}
                      reply={replyDrafts[ticket.id] || ""}
                      disabled={isPending}
                      setReply={(value) =>
                        setReplyDrafts((current) => ({
                          ...current,
                          [ticket.id]: value,
                        }))
                      }
                      onReply={() => handleReply(ticket)}
                    />
                  ) : null}
                </article>
              ))
            )}
          </div>
        </aside>
      </div>
    </SectionContainer>
  );
}

function TicketThread({ ticket, reply, setReply, disabled, onReply }) {
  const hasInitialMessage = ticket.messages.some(
    (message) =>
      message.senderRole === "user" && message.message === ticket.message,
  );
  const messages = hasInitialMessage
    ? ticket.messages
    : [
        {
          id: `${ticket.id}-initial`,
          senderRole: "user",
          message: ticket.message,
          username: ticket.username,
        },
        ...ticket.messages,
      ];

  return (
    <div
      id={`ticket-${ticket.id}-thread`}
      className="border-t border-white/10 bg-black/20"
    >
      <div className="max-h-[28rem] space-y-3 overflow-y-auto p-4 sm:p-5">
        {messages.map((message) => {
          const fromAdmin = message.senderRole === "admin";
          return (
            <MessageBubble
              key={message.id}
              fromAdmin={fromAdmin}
              message={message}
            />
          );
        })}
      </div>
      <div className="grid gap-3 border-t border-white/10 bg-neutral-950/70 p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
        <label htmlFor={`ticket-${ticket.id}-reply`} className="sr-only">
          Responder en este ticket
        </label>
        <textarea
          id={`ticket-${ticket.id}-reply`}
          value={reply}
          rows={3}
          disabled={disabled}
          placeholder="Responder en este ticket"
          onChange={(event) => setReply(event.target.value)}
          className="min-h-24 resize-none rounded-xl border border-white/10 bg-neutral-900/80 px-4 py-3 text-sm text-white outline-none transition placeholder:text-neutral-600 hover:border-white/20 focus:border-red-400/60 sm:min-h-12"
        />
        <button
          type="button"
          disabled={disabled || !reply.trim()}
          onClick={onReply}
          className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl border border-red-300/20 bg-gradient-to-r from-red-700 to-red-500 px-5 py-3 text-sm font-black text-white shadow-[0_12px_28px_rgba(255,45,45,0.18)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(255,45,45,0.26)] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        >
          <IconSend size={17} />
          Responder
        </button>
      </div>
    </div>
  );
}

function MessageBubble({ fromAdmin, message }) {
  return (
    <div
      className={`max-w-full sm:max-w-[86%] ${
        fromAdmin ? "" : "ml-auto"
      }`}
    >
      <div className="mb-1.5 flex items-center gap-2 px-1 text-xs">
        <span className={fromAdmin ? "font-bold text-red-200" : "font-bold text-neutral-400"}>
          {fromAdmin ? "Soporte" : "Vos"}
        </span>
        {message.createdAt ? (
          <span className="text-neutral-600">
            {formatDateTime(message.createdAt)}
          </span>
        ) : null}
      </div>
      <div
        className={`rounded-2xl border px-4 py-3 ${
          fromAdmin
            ? "rounded-tl-md border-red-400/20 bg-red-500/10"
            : "rounded-tr-md border-white/10 bg-neutral-900"
        }`}
      >
        <p className="whitespace-pre-wrap text-sm leading-6 text-neutral-200">
          {message.message}
        </p>
      </div>
    </div>
  );
}

function SupportMetric({ label, value, tone = "neutral" }) {
  const valueClassName = tone === "red" ? "text-red-200" : "text-white";

  return (
    <div className="min-w-28 rounded-xl border border-white/10 bg-neutral-900/70 px-4 py-3">
      <p className="text-[11px] font-black uppercase tracking-wide text-neutral-500">
        {label}
      </p>
      <p className={`mt-1 text-2xl font-black tabular-nums ${valueClassName}`}>
        {value}
      </p>
    </div>
  );
}
