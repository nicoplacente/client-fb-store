import { useState } from "react";
import {
  IconBell,
  IconMessageCircle,
  IconSend,
  IconTrash,
} from "@tabler/icons-react";
import { formatDateTime } from "../../lib/formatters";
import { SelectInput, TextArea } from "../form-controls";
import { TicketEmptyState } from "./ticket-status";
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
  return (
    <div className="space-y-5 rounded-2xl border border-white/10 bg-neutral-950/75 p-3 shadow-xl shadow-black/20 ring-1 ring-white/[0.03] sm:p-5">
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
        <h2 className="inline-flex items-center gap-2 text-lg font-bold text-white">
          <IconMessageCircle size={19} />
          Consultas abiertas
        </h2>
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
    <article className="grid gap-4 rounded-2xl border border-white/10 bg-neutral-900/65 p-4 shadow-lg shadow-black/15 transition hover:border-red-300/20">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <TicketCardHeader ticket={ticket} onOpenProfile={() => setProfileOpen(true)} />
        <TicketActions
          ticket={ticket}
          isPending={isPending}
          onStatusChange={onStatusChange}
          onDelete={onDelete}
        />
      </div>

      <TicketMessages
        messages={messages}
        ticket={ticket}
        onOpenProfile={() => setProfileOpen(true)}
      />

      <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
        <TextArea
          value={reply}
          rows={3}
          placeholder="Responder consulta"
          disabled={isPending}
          onChange={(event) => setReply(event.target.value)}
        />
        <button
          onClick={() => onReply(ticket)}
          disabled={isPending || !reply.trim()}
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-black text-white shadow-lg shadow-red-950/25 transition hover:-translate-y-0.5 hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-300/50 disabled:cursor-not-allowed disabled:bg-neutral-800 disabled:text-neutral-500 disabled:shadow-none"
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
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="font-semibold text-white">{ticket.subject}</h3>
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-neutral-400">
          {ticket.category}
        </span>
        <UserProfileButton
          user={ticket.user}
          username={ticket.username}
          onClick={onOpenProfile}
        />
        {ticket.createdAt ? (
          <span className="text-xs text-neutral-600">
            {formatDateTime(ticket.createdAt)}
          </span>
        ) : null}
      </div>
      <p className="mt-2 text-sm text-neutral-500">Estado actual: {ticket.status}</p>
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
        className="inline-flex size-11 cursor-pointer items-center justify-center rounded-xl border border-red-500/30 bg-red-500/10 text-red-200 transition hover:-translate-y-0.5 hover:bg-red-500/20 focus:outline-none focus:ring-2 focus:ring-red-300/40 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label={`Eliminar ticket ${ticket.subject}`}
      >
        <IconTrash size={17} />
      </button>
    </div>
  );
}

function TicketMessages({ messages, ticket, onOpenProfile }) {
  return (
    <div className="space-y-2 rounded-2xl border border-white/10 bg-neutral-950/65 p-3 shadow-inner shadow-black/10">
      {messages.map((message) => {
        const fromAdmin = message.senderRole === "admin";

        return (
          <div
            key={message.id}
            className={`rounded-md border p-3 ${
              fromAdmin
                ? "ml-auto border-red-400/20 bg-red-500/10"
                : "border-white/10 bg-neutral-900/80"
            } max-w-full sm:max-w-[86%]`}
          >
            <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500">
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
            <p className="mt-1 whitespace-pre-wrap text-sm text-neutral-300">
              {message.message}
            </p>
          </div>
        );
      })}
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
