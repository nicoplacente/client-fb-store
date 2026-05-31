import { useState } from "react";
import {
  IconBell,
  IconBrandDiscord,
  IconBrandX,
  IconCalendar,
  IconCircleCheck,
  IconClock,
  IconCoins,
  IconFilter,
  IconId,
  IconMail,
  IconMapPin,
  IconMessageCircle,
  IconPhone,
  IconPackage,
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
  products = [],
  replies,
  setReplies,
  loading,
  isPending,
  onStatusChange,
  onReply,
  onDelete,
}) {
  return (
    <RedemptionTicketPanel
      loading={loading}
      loadingText="Cargando canjes..."
      emptyText="No hay canjes para mostrar."
      tickets={tickets}
      products={products}
      replies={replies}
      setReplies={setReplies}
      isPending={isPending}
      onStatusChange={onStatusChange}
      onReply={onReply}
      onDelete={onDelete}
    />
  );
}

function RedemptionTicketPanel({
  loading,
  loadingText,
  emptyText,
  tickets,
  products,
  isPending,
  onStatusChange,
  onDelete,
}) {
  const [dateFilter, setDateFilter] = useState("");
  const [calendarDate, setCalendarDate] = useState("");
  const productMap = buildProductMap(products);
  const filteredTickets = filterTicketsByDate(tickets, {
    date: calendarDate,
    text: dateFilter,
  });
  const openTickets = filteredTickets.filter((ticket) => ticket.status !== "closed").length;
  const closedTickets = filteredTickets.length - openTickets;
  const hasFilter = Boolean(calendarDate || dateFilter);

  function clearFilters() {
    setCalendarDate("");
    setDateFilter("");
  }

  return (
    <div className="space-y-5 rounded-2xl border border-white/10 bg-neutral-950/75 p-4 shadow-xl shadow-black/20 ring-1 ring-white/[0.03] sm:p-5">
      <div className="grid gap-5 border-b border-white/10 pb-5 xl:grid-cols-[1fr_auto] xl:items-end">
        <div>
          <h2 className="inline-flex items-center gap-2 text-lg font-bold text-white">
            <IconShoppingBag size={19} />
            Canjes de productos
          </h2>
          <p className="mt-2 text-sm text-neutral-500">
            Revisa pedidos de tienda, datos del usuario y el estado de entrega.
          </p>
        </div>
        <div className="grid gap-3">
          <div className="grid gap-2 rounded-2xl border border-white/10 bg-neutral-900/55 p-3 shadow-inner shadow-black/10 md:grid-cols-[minmax(11rem,13rem)_minmax(15rem,22rem)_auto] md:items-end">
            <label className="grid gap-1.5 text-xs font-bold uppercase text-neutral-500">
              Calendario
              <span className="flex items-center gap-2 rounded-xl border border-white/10 bg-neutral-950 px-3 py-2.5 text-neutral-400 transition focus-within:border-red-300/60 focus-within:ring-2 focus-within:ring-red-300/15">
                <IconCalendar size={16} />
                <input
                  type="date"
                  value={calendarDate}
                  onChange={(event) => setCalendarDate(event.target.value)}
                  className="min-w-0 flex-1 bg-transparent text-sm font-bold text-white outline-none [color-scheme:dark]"
                  aria-label="Seleccionar fecha de canjes"
                />
              </span>
            </label>
            <label className="grid gap-1.5 text-xs font-bold uppercase text-neutral-500">
              Buscar fecha
              <span className="flex items-center gap-2 rounded-xl border border-white/10 bg-neutral-950 px-3 py-2.5 text-neutral-400 transition focus-within:border-red-300/60 focus-within:ring-2 focus-within:ring-red-300/15">
                <IconFilter size={16} />
                <input
                  value={dateFilter}
                  onChange={(event) => setDateFilter(event.target.value)}
                  placeholder="31 de mayo, 31-may o 31-05"
                  className="w-full bg-transparent text-sm font-bold text-white outline-none placeholder:text-neutral-600"
                  aria-label="Filtrar canjes por dia"
                />
              </span>
            </label>
            <button
              type="button"
              onClick={clearFilters}
              disabled={!hasFilter}
              className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/10 bg-neutral-950 px-3 text-sm font-bold text-neutral-300 transition hover:border-red-300/35 hover:text-white focus:outline-none focus:ring-2 focus:ring-red-300/40 disabled:cursor-not-allowed disabled:text-neutral-700"
            >
              <IconX size={16} />
              Limpiar
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:flex sm:justify-end">
            <RedemptionStat label="Total" value={filteredTickets.length} icon={<IconShoppingBag size={14} />} />
            <RedemptionStat label="Abiertos" value={openTickets} icon={<IconClock size={14} />} />
            <RedemptionStat label="Cerrados" value={closedTickets} icon={<IconCircleCheck size={14} />} />
          </div>
        </div>
      </div>

      {loading ? (
        <p className="rounded-2xl border border-white/10 bg-neutral-900/60 p-8 text-center text-neutral-400 shadow-inner shadow-black/10">
          {loadingText}
        </p>
      ) : tickets.length === 0 ? (
        <p className="rounded-2xl border border-white/10 bg-neutral-900/60 p-8 text-center text-neutral-400 shadow-inner shadow-black/10">
          {emptyText}
        </p>
      ) : filteredTickets.length === 0 ? (
        <p className="rounded-2xl border border-white/10 bg-neutral-900/60 p-8 text-center text-neutral-400 shadow-inner shadow-black/10">
          No hay canjes para esa fecha.
        </p>
      ) : (
        <div className="grid gap-3">
          {filteredTickets.map((ticket) => (
            <RedemptionCard
              key={ticket.id}
              ticket={ticket}
              product={productMap.get(normalizeProductKey(getRedemptionProductName(ticket)))}
              isPending={isPending}
              onStatusChange={onStatusChange}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

const MONTH_ALIASES = new Map([
  ["1", 1],
  ["01", 1],
  ["ene", 1],
  ["enero", 1],
  ["jan", 1],
  ["january", 1],
  ["2", 2],
  ["02", 2],
  ["feb", 2],
  ["febrero", 2],
  ["february", 2],
  ["3", 3],
  ["03", 3],
  ["mar", 3],
  ["marzo", 3],
  ["march", 3],
  ["4", 4],
  ["04", 4],
  ["abr", 4],
  ["abril", 4],
  ["apr", 4],
  ["april", 4],
  ["5", 5],
  ["05", 5],
  ["may", 5],
  ["mayo", 5],
  ["6", 6],
  ["06", 6],
  ["jun", 6],
  ["junio", 6],
  ["june", 6],
  ["7", 7],
  ["07", 7],
  ["jul", 7],
  ["julio", 7],
  ["july", 7],
  ["8", 8],
  ["08", 8],
  ["ago", 8],
  ["agosto", 8],
  ["aug", 8],
  ["august", 8],
  ["9", 9],
  ["09", 9],
  ["sep", 9],
  ["sept", 9],
  ["septiembre", 9],
  ["september", 9],
  ["10", 10],
  ["oct", 10],
  ["octubre", 10],
  ["october", 10],
  ["11", 11],
  ["nov", 11],
  ["noviembre", 11],
  ["november", 11],
  ["12", 12],
  ["dic", 12],
  ["diciembre", 12],
  ["dec", 12],
  ["december", 12],
]);

function normalizeDateFilter(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+de\s+/g, "-")
    .replace(/[/.]/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function parseDateFilter(value) {
  const normalized = normalizeDateFilter(value);
  if (!normalized) return null;

  const parts = normalized.split("-").filter(Boolean);
  if (parts.length < 2) return null;

  const day = Number(parts[0]);
  const month = MONTH_ALIASES.get(parts[1]);
  const year = parts[2] ? Number(parts[2]) : null;

  if (!Number.isInteger(day) || day < 1 || day > 31 || !month) return null;

  return {
    day,
    month,
    year: Number.isInteger(year) ? year : null,
  };
}

function parseCalendarDate(value) {
  if (!value) return null;

  const [year, month, day] = String(value).split("-").map(Number);

  if (!Number.isInteger(day) || !Number.isInteger(month) || !Number.isInteger(year)) {
    return null;
  }

  return { day, month, year };
}

function filterTicketsByDate(tickets, filter) {
  const parsedFilter = parseCalendarDate(filter.date) || parseDateFilter(filter.text);
  if (!parsedFilter) return tickets;

  return tickets.filter((ticket) => {
    if (!ticket.createdAt) return false;

    const date = new Date(ticket.createdAt);
    if (Number.isNaN(date.getTime())) return false;

    const sameDay = date.getDate() === parsedFilter.day;
    const sameMonth = date.getMonth() + 1 === parsedFilter.month;
    const sameYear = !parsedFilter.year || date.getFullYear() === parsedFilter.year;

    return sameDay && sameMonth && sameYear;
  });
}

function normalizeProductKey(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function buildProductMap(products = []) {
  return new Map(
    products
      .filter((product) => product?.title)
      .map((product) => [normalizeProductKey(product.title), product])
  );
}

function RedemptionStat({ label, value, icon }) {
  return (
    <span className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-neutral-900 px-3 py-2 text-xs font-bold text-neutral-400">
      {icon}
      <span>{label}</span>
      <strong className="text-white">{value}</strong>
    </span>
  );
}

function getRedemptionProductName(ticket) {
  return String(ticket.subject || "Canje")
    .replace(/^Canje:\s*/i, "")
    .trim();
}

function getRedemptionDetails(ticket) {
  const text = `${ticket.message || ""} ${ticket.messages?.[0]?.message || ""}`;
  const costMatch = text.match(/por\s+([\d.,]+)\s+creditos/i);
  const quantityMatch = text.match(/Cantidad:\s+(\d+)/i);

  return {
    productName: getRedemptionProductName(ticket),
    cost: costMatch?.[1] || "",
    quantity: quantityMatch?.[1] || "1",
  };
}

function RedemptionCard({
  ticket,
  product,
  isPending,
  onStatusChange,
  onDelete,
}) {
  const [profileOpen, setProfileOpen] = useState(false);
  const details = getRedemptionDetails(ticket);
  const productImage = product?.imageUrl || "";

  return (
    <article className="grid gap-4 rounded-2xl border border-white/10 bg-neutral-900/60 p-3 shadow-lg shadow-black/15 transition hover:border-red-300/20 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:p-4">
      <div className="grid min-w-0 gap-4 sm:grid-cols-[4.75rem_minmax(0,1fr)] sm:items-center">
        <div className="flex size-20 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-neutral-950 shadow-inner shadow-black/20">
          {productImage ? (
            <img
              src={productImage}
              alt={`Imagen del premio ${details.productName}`}
              className="size-full object-cover"
              loading="lazy"
            />
          ) : (
            <IconPackage size={30} className="text-neutral-600" />
          )}
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-black text-white">
              {details.productName || ticket.subject}
            </h3>
            <StatusBadge status={ticket.status} />
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-neutral-500">
            <UserProfileButton
              user={ticket.user}
              username={ticket.username}
              onClick={() => setProfileOpen(true)}
            />
            <span className="inline-flex items-center gap-1.5">
              <IconCalendar size={13} />
              {formatDateTime(ticket.createdAt)}
            </span>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            <OrderMetric label="Unidades" value={details.quantity} icon={<IconShoppingBag size={14} />} />
            <OrderMetric label="Creditos" value={details.cost || "-"} icon={<IconCoins size={14} />} />
            <div className="rounded-xl border border-white/10 bg-neutral-950/60 p-3">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase text-neutral-500">
                <IconUserCircle size={14} />
                Usuario
              </span>
              <p className="mt-1 truncate text-sm font-black text-white">
                {ticket.username}
              </p>
            </div>
          </div>
        </div>
      </div>

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
      <UserProfileModal
        user={ticket.user}
        fallbackUsername={ticket.username}
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
      />
    </article>
  );
}

function OrderMetric({ label, value, icon }) {
  return (
    <div className="rounded-xl border border-white/10 bg-neutral-950/65 p-3">
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase text-neutral-500">
        {icon}
        {label}
      </span>
      <p className="mt-1 text-sm font-black text-white">{value}</p>
    </div>
  );
}

function StatusBadge({ status }) {
  const closed = status === "closed";
  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-black ${
        closed
          ? "border-green-300/25 bg-green-400/10 text-green-200"
          : "border-amber-300/25 bg-amber-400/10 text-amber-100"
      }`}
    >
      {formatTicketStatus(status)}
    </span>
  );
}

function formatTicketStatus(status) {
  if (status === "closed") return "Cerrado";
  if (status === "in_progress") return "En proceso";
  return "Abierto";
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
    <div className="space-y-5 rounded-2xl border border-white/10 bg-neutral-950/75 p-3 shadow-xl shadow-black/20 ring-1 ring-white/[0.03] sm:p-5">
      {loading ? (
        <p className="rounded-2xl border border-white/10 bg-neutral-900/60 p-8 text-center text-neutral-400 shadow-inner shadow-black/10">
          {loadingText}
        </p>
      ) : tickets.length === 0 ? (
        <p className="rounded-2xl border border-white/10 bg-neutral-900/60 p-8 text-center text-neutral-400 shadow-inner shadow-black/10">
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="inline-flex items-center gap-2 text-lg font-bold text-white">
          {icon}
          {title}
        </h2>
        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-neutral-900 px-3 py-1 text-xs font-bold text-neutral-400">
          <IconBell size={14} />
          {tickets.filter((ticket) => ticket.status !== "closed").length}
        </span>
      </div>
      {tickets.length === 0 ? (
        <p className="rounded-2xl border border-white/10 bg-neutral-900/60 p-5 text-sm text-neutral-400">
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
    <article className="grid gap-4 rounded-2xl border border-white/10 bg-neutral-900/65 p-4 shadow-lg shadow-black/15 transition hover:border-red-300/20">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-white">{ticket.subject}</h3>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-neutral-400">
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
      </div>

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

function UserProfileButton({ user, username, onClick }) {
  const canOpen = Boolean(user);

  if (!canOpen) {
    return <span className="text-xs text-neutral-500">{username}</span>;
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex cursor-pointer items-center gap-1 rounded-md text-xs font-semibold text-neutral-300 underline-offset-4 transition hover:text-white hover:underline focus:outline-none focus:ring-2 focus:ring-red-400/60"
      aria-label={`Ver perfil de ${username}`}
    >
      <IconUserCircle size={14} />
      {username}
    </button>
  );
}

function ProfileValue({ label, value, icon }) {
  return (
    <div className="rounded-xl border border-white/10 bg-neutral-950/70 p-3 shadow-inner shadow-black/10">
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
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 p-2 backdrop-blur-md sm:items-center sm:p-4">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-neutral-950 shadow-2xl shadow-black/70 ring-1 ring-white/[0.03]">
        <div className="flex items-start justify-between gap-4 border-b border-white/10 bg-[linear-gradient(135deg,rgba(220,38,38,0.12),rgba(255,255,255,0.02))] p-5">
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
            className="inline-flex size-9 cursor-pointer items-center justify-center rounded-md border border-white/10 bg-neutral-900 text-neutral-400 transition hover:border-red-300/35 hover:text-white focus:outline-none focus:ring-2 focus:ring-red-300/40"
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
