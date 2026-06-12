import { useState } from "react";
import {
  IconBell,
  IconClock,
  IconHeadset,
  IconMessageCircle,
  IconSend,
  IconTrash,
} from "@tabler/icons-react";
import { formatDateTime } from "../../lib/formatters";
import { SelectInput, TextArea } from "../form-controls";
import { StatusBadge, TicketEmptyState } from "./ticket-status";
import UserProfileModal, { UserProfileButton } from "./user-profile-modal";

export default function SupportPanel({
  tickets,
  replies,
  setReplies,
  loading,
  isPending,
  onStatusChange,
  onReply,
  onDelete,
}) {
  const activeTickets = tickets.filter(
    (ticket) => ticket.status !== "closed",
  ).length;

  return (
    <div className="space-y-5 rounded-2xl border border-white/10 bg-neutral-950/75 p-3 shadow-xl shadow-black/20 ring-1 ring-white/[0.03] sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div className="flex items-start gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-red-300/20 bg-red-500/10 text-red-200">
            <IconHeadset size={22} />
          </span>
          <div>
            <h2 className="text-lg font-black text-white">Bandeja de soporte</h2>
            <p className="mt-1 text-sm text-neutral-500">
              Revisá conversaciones, respondé y actualizá su estado.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <InboxMetric label="Total" value={tickets.length} />
          <InboxMetric label="Activos" value={activeTickets} tone="red" />
        </div>
      </div>

      {loading ? (
        <TicketEmptyState>Cargando tickets...</TicketEmptyState>
      ) : tickets.length === 0 ? (
        <TicketEmptyState>No hay consultas abiertas.</TicketEmptyState>
      ) : (
        <TicketGroup
          tickets={tickets}
          replies={replies}
          setReplies={setReplies}
          isPending={isPending}
          onStatusChange={onStatusChange}
          onReply={onReply}
          onDelete={onDelete}
        />
      )}
    </div>
  );
}

function TicketGroup({
  tickets,
  replies,
  setReplies,
  isPending,
  onStatusChange,
  onReply,
  onDelete,
}) {
  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-wide text-neutral-400">
          <IconMessageCircle size={19} />
          Conversaciones
        </h3>
        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-neutral-900 px-3 py-1 text-xs font-bold text-neutral-400">
          <IconBell size={14} />
          {tickets.filter((ticket) => ticket.status !== "closed").length}
        </span>
      </div>
      <div className="grid gap-3">
        {tickets.map((ticket) => (
          <TicketCard
            key={ticket.id}
            ticket={ticket}
            reply={replies[ticket.id] || ""}
            setReply={(value) =>
              setReplies((current) => ({ ...current, [ticket.id]: value }))
            }
            isPending={isPending}
            onStatusChange={onStatusChange}
            onReply={onReply}
            onDelete={onDelete}
          />
        ))}
      </div>
    </section>
  );
}

function TicketCard({
  ticket,
  reply,
  setReply,
  isPending,
  onStatusChange,
  onReply,
  onDelete,
}) {
  const [profileOpen, setProfileOpen] = useState(false);
  const messages = getTicketMessages(ticket);

  return (
    <article className="overflow-hidden rounded-2xl border border-white/10 bg-neutral-900/55 shadow-lg shadow-black/15 transition hover:border-white/20">
      <div className="flex flex-col gap-4 border-b border-white/10 bg-white/[0.02] p-4 lg:flex-row lg:items-start lg:justify-between sm:p-5">
        <TicketCardHeader
          ticket={ticket}
          onOpenProfile={() => setProfileOpen(true)}
        />
        <TicketActions
          ticket={ticket}
          isPending={isPending}
          onStatusChange={onStatusChange}
          onDelete={onDelete}
        />
      </div>

      <div className="bg-black/20 p-3 sm:p-4">
        <TicketMessages
          messages={messages}
          ticket={ticket}
          onOpenProfile={() => setProfileOpen(true)}
        />
      </div>

      <div className="grid gap-3 border-t border-white/10 bg-neutral-950/65 p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
        <TextArea
          value={reply}
          rows={2}
          placeholder="Escribí una respuesta para este ticket"
          disabled={isPending}
          onChange={(event) => setReply(event.target.value)}
        />
        <button
          type="button"
          onClick={() => onReply(ticket)}
          disabled={isPending || !reply.trim()}
          className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-red-950/25 transition hover:-translate-y-0.5 hover:bg-red-500 focus:outline-none disabled:cursor-not-allowed disabled:bg-neutral-800 disabled:text-neutral-500 disabled:shadow-none"
        >
          <IconSend size={17} />
          Responder
        </button>
      </div>
      <UserProfileModal
        user={ticket.user}
        fallbackUsername={ticket.username}
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
      />
    </article>
  );
}

function TicketCardHeader({ ticket, onOpenProfile }) {
  return (
    <div className="min-w-0">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs font-black uppercase text-neutral-400">
          {ticket.category}
        </span>
        <StatusBadge status={ticket.status} />
        <UserProfileButton
          user={ticket.user}
          username={ticket.username}
          onClick={onOpenProfile}
        />
      </div>
      <h3 className="mt-3 text-lg font-black text-white">{ticket.subject}</h3>
      {ticket.createdAt ? (
        <span className="mt-2 flex items-center gap-1.5 text-xs text-neutral-600">
          <IconClock size={14} />
          {formatDateTime(ticket.createdAt)}
        </span>
      ) : null}
    </div>
  );
}

function TicketActions({ ticket, isPending, onStatusChange, onDelete }) {
  return (
    <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
      <SelectInput
        value={ticket.status}
        disabled={isPending}
        onChange={(event) => onStatusChange(ticket, event.target.value)}
      >
        <option value="open">Abierto</option>
        <option value="in_progress">En proceso</option>
        <option value="closed">Cerrado</option>
      </SelectInput>
      <button
        onClick={() => onDelete(ticket)}
        disabled={isPending}
        className="inline-flex size-11 cursor-pointer items-center justify-center rounded-xl border border-red-500/30 bg-red-500/10 text-red-200 transition hover:-translate-y-0.5 hover:bg-red-500/20 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        aria-label={`Eliminar ticket ${ticket.subject}`}
      >
        <IconTrash size={17} />
      </button>
    </div>
  );
}

function TicketMessages({ messages, ticket, onOpenProfile }) {
  return (
    <div className="max-h-[32rem] space-y-3 overflow-y-auto rounded-xl border border-white/10 bg-neutral-950/55 p-3 shadow-inner shadow-black/10 sm:p-4">
      {messages.map((message) => {
        const fromAdmin = message.senderRole === "admin";

        return (
          <div
            key={message.id}
            className={`max-w-full sm:max-w-[82%] ${
              fromAdmin ? "ml-auto" : ""
            }`}
          >
            <div className={`mb-1.5 flex flex-wrap items-center gap-2 px-1 text-xs text-neutral-500 ${fromAdmin ? "justify-end" : ""}`}>
              <span className={fromAdmin ? "text-red-200" : "text-neutral-300"}>
                {fromAdmin ? (
                  "Dashboard"
                ) : (
                  <UserProfileButton
                    user={ticket.user}
                    username={message.username}
                    onClick={onOpenProfile}
                  />
                )}
              </span>
              {message.createdAt ? <span>{formatDateTime(message.createdAt)}</span> : null}
            </div>
            <div
              className={`rounded-2xl border px-4 py-3 ${
                fromAdmin
                  ? "rounded-tr-md border-red-400/20 bg-red-500/10"
                  : "rounded-tl-md border-white/10 bg-neutral-900/80"
              }`}
            >
              <p className="whitespace-pre-wrap text-sm leading-6 text-neutral-200">
                {message.message}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function InboxMetric({ label, value, tone = "neutral" }) {
  const valueClassName = tone === "red" ? "text-red-200" : "text-white";

  return (
    <div className="min-w-20 rounded-xl border border-white/10 bg-neutral-900/70 px-3 py-2">
      <p className="text-[10px] font-black uppercase tracking-wide text-neutral-600">
        {label}
      </p>
      <p className={`mt-0.5 text-lg font-black tabular-nums ${valueClassName}`}>
        {value}
      </p>
    </div>
  );
}

function getTicketMessages(ticket) {
  const hasInitialMessage = ticket.messages.some(
    (message) => message.senderRole === "user" && message.message === ticket.message
  );

  if (hasInitialMessage) return ticket.messages;

  return [
    {
      id: `${ticket.id}-initial`,
      senderRole: "user",
      message: ticket.message,
      username: ticket.username,
      createdAt: ticket.createdAt,
    },
    ...ticket.messages,
  ];
}
