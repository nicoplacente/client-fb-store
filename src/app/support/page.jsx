"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import {
  IconChevronDown,
  IconHeadset,
  IconSend,
  IconTicket,
} from "@tabler/icons-react";
import { toast } from "sonner";
import useAppContext from "@/context/use-app-context";
import { AuthContext } from "@/context/auth-context/auth-context";
import SectionContainer from "@/modules/ui/section-container";
import {
  createSupportMessage,
  createSupportTicket,
  getSupportTickets,
  normalizeTicket,
} from "@/modules/support/libs/support-api";

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
      } catch (err) {
        toast.error(err.message || "No se pudo enviar la consulta");
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
            current.map((item) => (item.id === ticket.id ? result.ticket : item))
          );
        }
      } catch (err) {
        toast.error(err.message || "No se pudo responder");
      }
    });
  }

  return (
    <SectionContainer className="space-y-8">
      <div>
        <p className="text-sm font-semibold uppercase text-red-300/80">
          Soporte
        </p>
        <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">Centro de ayuda</h1>
        <p className="mt-3 max-w-2xl text-neutral-400">
          Enviá consultas sobre canjes, créditos, sorteos o problemas de cuenta.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <form
          onSubmit={handleSubmit}
          className="rounded-lg border border-white/10 bg-neutral-950/80 p-4 sm:p-6"
        >
          <div className="mb-6 flex items-center gap-3">
            <span className="rounded-md border border-red-500/30 bg-red-500/10 p-2 text-red-200">
              <IconHeadset size={22} />
            </span>
            <div>
              <h2 className="text-xl font-semibold text-white">Nueva consulta</h2>
              <p className="text-sm text-neutral-500">
                {user
                  ? "Te respondemos desde el backend configurado."
                  : "Inicia sesion para que podamos responderte."}
              </p>
            </div>
          </div>

          {!user ? (
            <div className="mb-5 rounded-md border border-red-500/25 bg-red-500/10 p-4 text-sm font-medium text-red-100">
              Para enviar una consulta necesitas iniciar sesion. Asi soporte puede responderte en tu ticket.
            </div>
          ) : null}

          <div className="grid gap-4">
            <label className="grid gap-2 text-sm font-medium text-neutral-300">
              Asunto
              <input
                value={form.subject}
                onChange={(event) => updateField("subject", event.target.value)}
                className="rounded-md border border-white/10 bg-neutral-900 px-3 py-2 text-white outline-none transition focus:border-red-400"
                disabled={!user || isPending}
                required
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-neutral-300">
              Categoría
              <select
                value={form.category}
                onChange={(event) => updateField("category", event.target.value)}
                className="rounded-md border border-white/10 bg-neutral-900 px-3 py-2 text-white outline-none transition focus:border-red-400"
                disabled={!user || isPending}
              >
                <option value="general">General</option>
                <option value="credits">Créditos</option>
                <option value="giveaways">Sorteos</option>
                <option value="account">Cuenta</option>
                <option value="technical">Técnico</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm font-medium text-neutral-300">
              Mensaje
              <textarea
                value={form.message}
                onChange={(event) => updateField("message", event.target.value)}
                rows={8}
                className="resize-none rounded-md border border-white/10 bg-neutral-900 px-3 py-2 text-white outline-none transition focus:border-red-400"
                disabled={!user || isPending}
                required
              />
            </label>
          </div>

          <button
            disabled={!user || isPending}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md bg-red-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <IconSend size={18} />
            Enviar consulta
          </button>
        </form>

        <aside className="rounded-lg border border-white/10 bg-neutral-950/70 p-4 sm:p-6">
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
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedTicketId((current) =>
                        current === ticket.id ? null : ticket.id
                      )
                    }
                    className="flex w-full items-start justify-between gap-3 text-left"
                  >
                    <span>
                      <span className="font-semibold text-white">
                        {ticket.subject}
                      </span>
                      <span className="mt-2 line-clamp-2 block text-sm text-neutral-500">
                        {ticket.message}
                      </span>
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="rounded bg-white/5 px-2 py-1 text-xs text-neutral-400">
                        {ticket.status}
                      </span>
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
      message.senderRole === "user" && message.message === ticket.message
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
    <div className="mt-4 space-y-3 border-t border-white/10 pt-4">
      <div className="space-y-2">
        {messages.map((message) => {
          const fromAdmin = message.senderRole === "admin";
          return (
            <div
              key={message.id}
                  className={`rounded-md border p-3 ${
                fromAdmin
                  ? "border-red-400/20 bg-red-500/10"
                  : "ml-auto border-white/10 bg-neutral-950/70"
              } max-w-full sm:max-w-[90%]`}
            >
              <p
                className={fromAdmin ? "text-xs text-red-200" : "text-xs text-neutral-500"}
              >
                {fromAdmin ? "Soporte" : "Vos"}
              </p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-neutral-300">
                {message.message}
              </p>
            </div>
          );
        })}
      </div>
      <div className="grid gap-2">
        <textarea
          value={reply}
          rows={3}
          disabled={disabled}
          placeholder="Responder en este ticket"
          onChange={(event) => setReply(event.target.value)}
          className="resize-none rounded-md border border-white/10 bg-neutral-950 px-3 py-2 text-sm text-white outline-none transition focus:border-red-400"
        />
        <button
          type="button"
          disabled={disabled || !reply.trim()}
          onClick={onReply}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:bg-neutral-800 disabled:text-neutral-500"
        >
          <IconSend size={17} />
          Responder
        </button>
      </div>
    </div>
  );
}
