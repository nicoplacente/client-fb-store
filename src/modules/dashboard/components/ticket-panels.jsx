import { useState } from "react";
import {
  IconBell,
  IconBrandDiscord,
  IconBrandX,
  IconId,
  IconMail,
  IconMapPin,
  IconMessageCircle,
  IconPhone,
  IconSend,
  IconShoppingBag,
  IconTrash,
  IconUserCircle,
  IconX,
} from "@tabler/icons-react";
import { formatDateTime } from "../lib/formatters";
import { SelectInput, TextArea } from "./form-controls";

export function SupportPanel({
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
    <TicketPanel
      loading={loading}
      loadingText="Cargando tickets..."
      emptyText="No hay consultas abiertas."
      title="Consultas abiertas"
      icon={<IconMessageCircle size={19} />}
      tickets={tickets}
      replies={replies}
      setReplies={setReplies}
      isPending={isPending}
      onStatusChange={onStatusChange}
      onReply={onReply}
      onDelete={onDelete}
    />
  );
}

export function RedemptionsPanel({
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
    <TicketPanel
      loading={loading}
      loadingText="Cargando canjes..."
      emptyText="No hay canjes para mostrar."
      title="Canjes de productos"
      icon={<IconShoppingBag size={19} />}
      tickets={tickets}
      replies={replies}
      setReplies={setReplies}
      isPending={isPending}
      onStatusChange={onStatusChange}
      onReply={onReply}
      onDelete={onDelete}
    />
  );
}

function TicketPanel({
  loading,
  loadingText,
  emptyText,
  title,
  icon,
  tickets,
  replies,
  setReplies,
  isPending,
  onStatusChange,
  onReply,
  onDelete,
}) {
  return (
    <div className="space-y-5 rounded-lg border border-white/10 bg-neutral-950/70 p-5">
      {loading ? (
        <p className="rounded-lg border border-white/10 bg-neutral-900/60 p-8 text-center text-neutral-400">
          {loadingText}
        </p>
      ) : tickets.length === 0 ? (
        <p className="rounded-lg border border-white/10 bg-neutral-900/60 p-8 text-center text-neutral-400">
          {emptyText}
        </p>
      ) : (
        <TicketGroup
          title={title}
          icon={icon}
          emptyText={emptyText}
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
  title,
  icon,
  emptyText,
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
      <div className="flex items-center justify-between gap-3">
        <h2 className="inline-flex items-center gap-2 text-lg font-semibold text-white">
          {icon}
          {title}
        </h2>
        <span className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-neutral-900 px-2 py-1 text-xs text-neutral-400">
          <IconBell size={14} />
          {tickets.filter((ticket) => ticket.status !== "closed").length}
        </span>
      </div>
      {tickets.length === 0 ? (
        <p className="rounded-lg border border-white/10 bg-neutral-900/60 p-5 text-sm text-neutral-400">
          {emptyText}
        </p>
      ) : (
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
      )}
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
  const hasInitialMessage = ticket.messages.some(
    (message) => message.senderRole === "user" && message.message === ticket.message
  );
  const messages = hasInitialMessage
    ? ticket.messages
    : [
        {
          id: `${ticket.id}-initial`,
          senderRole: "user",
          message: ticket.message,
          username: ticket.username,
          createdAt: ticket.createdAt,
        },
        ...ticket.messages,
      ];

  return (
    <article className="grid gap-4 rounded-lg border border-white/10 bg-neutral-900/60 p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-white">{ticket.subject}</h3>
            <span className="rounded-md bg-white/5 px-2 py-1 text-xs text-neutral-400">
              {ticket.category}
            </span>
            <UserProfileButton
              user={ticket.user}
              username={ticket.username}
              onClick={() => setProfileOpen(true)}
            />
            {ticket.createdAt ? (
              <span className="text-xs text-neutral-600">
                {formatDateTime(ticket.createdAt)}
              </span>
            ) : null}
          </div>
          <p className="mt-2 text-sm text-neutral-500">
            Estado actual: {ticket.status}
          </p>
        </div>
        <div className="flex items-center gap-2">
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
            className="inline-flex size-10 items-center justify-center rounded-md border border-red-500/30 bg-red-500/10 text-red-200 transition hover:bg-red-500/20 disabled:opacity-50"
            aria-label={`Eliminar ticket ${ticket.subject}`}
          >
            <IconTrash size={17} />
          </button>
        </div>
      </div>

      <div className="space-y-2 rounded-md border border-white/10 bg-neutral-950/60 p-3">
        {messages.map((message) => {
          const fromAdmin = message.senderRole === "admin";
          return (
            <div
              key={message.id}
              className={`rounded-md border p-3 ${
                fromAdmin
                  ? "ml-auto border-red-400/20 bg-red-500/10"
                  : "border-white/10 bg-neutral-900/80"
              } max-w-[86%]`}
            >
              <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500">
                <span className={fromAdmin ? "text-red-200" : "text-neutral-300"}>
                  {fromAdmin ? (
                    "Dashboard"
                  ) : (
                    <UserProfileButton
                      user={ticket.user}
                      username={message.username}
                      onClick={() => setProfileOpen(true)}
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
          className="inline-flex items-center justify-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:bg-neutral-800 disabled:text-neutral-500"
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

function UserProfileButton({ user, username, onClick }) {
  const canOpen = Boolean(user);

  if (!canOpen) {
    return <span className="text-xs text-neutral-500">{username}</span>;
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 rounded-sm text-xs font-semibold text-neutral-300 underline-offset-4 transition hover:text-white hover:underline focus:outline-none focus:ring-2 focus:ring-red-400/60"
      aria-label={`Ver perfil de ${username}`}
    >
      <IconUserCircle size={14} />
      {username}
    </button>
  );
}

function ProfileValue({ label, value, icon }) {
  return (
    <div className="rounded-md border border-white/10 bg-neutral-950/70 p-3">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase text-neutral-500">
        {icon}
        {label}
      </div>
      <p className="mt-1 break-words text-sm font-semibold text-neutral-200">
        {value || "Sin cargar"}
      </p>
    </div>
  );
}

function UserProfileModal({ user, fallbackUsername, open, onClose }) {
  if (!open || !user) return null;

  const username = user.username || fallbackUsername || "Usuario";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-2xl rounded-lg border border-white/10 bg-neutral-950 shadow-2xl shadow-black/60">
        <div className="flex items-start justify-between gap-4 border-b border-white/10 p-5">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-neutral-900 text-neutral-500">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={`Avatar de ${username}`}
                  className="size-full object-cover"
                />
              ) : (
                <IconUserCircle size={34} stroke={1.3} />
              )}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{username}</h3>
              <p className="text-sm text-neutral-500">Informacion para envio y contacto</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex size-9 items-center justify-center rounded-md border border-white/10 bg-neutral-900 text-neutral-400 transition hover:text-white"
            aria-label="Cerrar perfil"
          >
            <IconX size={18} />
          </button>
        </div>

        <div className="grid gap-3 p-5 sm:grid-cols-2">
          <ProfileValue label="Nombre" value={user.name} icon={<IconUserCircle size={15} />} />
          <ProfileValue label="DNI" value={user.dni} icon={<IconId size={15} />} />
          <ProfileValue label="Pais" value={user.country} icon={<IconMapPin size={15} />} />
          <ProfileValue label="Provincia" value={user.province} icon={<IconMapPin size={15} />} />
          <ProfileValue label="Ciudad" value={user.city} icon={<IconMapPin size={15} />} />
          <ProfileValue label="Direccion" value={user.direction} icon={<IconMapPin size={15} />} />
          <ProfileValue label="Codigo postal" value={user.postalCode} icon={<IconMapPin size={15} />} />
          <ProfileValue label="Telefono" value={user.phone} icon={<IconPhone size={15} />} />
          <ProfileValue label="Email" value={user.email} icon={<IconMail size={15} />} />
          <ProfileValue label="Twitter/X" value={user.instagram} icon={<IconBrandX size={15} />} />
          <div className="sm:col-span-2">
            <ProfileValue label="Discord" value={user.discord} icon={<IconBrandDiscord size={15} />} />
          </div>
        </div>
      </div>
    </div>
  );
}
