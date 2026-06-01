import { useState } from "react";
import {
  IconCalendar,
  IconCircleCheck,
  IconClock,
  IconCoins,
  IconFilter,
  IconPackage,
  IconShoppingBag,
  IconTrash,
  IconUserCircle,
  IconX,
} from "@tabler/icons-react";
import { formatDateTime } from "../../lib/formatters";
import { SelectInput } from "../form-controls";
import {
  buildProductMap,
  filterTicketsByDate,
  normalizeProductKey,
} from "./redemption-filters";
import { StatusBadge, TicketEmptyState } from "./ticket-status";
import UserProfileModal, { UserProfileButton } from "./user-profile-modal";

export default function RedemptionsPanel({
  tickets,
  products = [],
  loading,
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
      <RedemptionsHeader
        calendarDate={calendarDate}
        dateFilter={dateFilter}
        hasFilter={hasFilter}
        total={filteredTickets.length}
        open={openTickets}
        closed={closedTickets}
        onCalendarDateChange={setCalendarDate}
        onDateFilterChange={setDateFilter}
        onClearFilters={clearFilters}
      />

      {loading ? (
        <TicketEmptyState>Cargando canjes...</TicketEmptyState>
      ) : tickets.length === 0 ? (
        <TicketEmptyState>No hay canjes para mostrar.</TicketEmptyState>
      ) : filteredTickets.length === 0 ? (
        <TicketEmptyState>No hay canjes para esa fecha.</TicketEmptyState>
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

function RedemptionsHeader({
  calendarDate,
  dateFilter,
  hasFilter,
  total,
  open,
  closed,
  onCalendarDateChange,
  onDateFilterChange,
  onClearFilters,
}) {
  return (
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
                onChange={(event) => onCalendarDateChange(event.target.value)}
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
                onChange={(event) => onDateFilterChange(event.target.value)}
                placeholder="31 de mayo, 31-may o 31-05"
                className="w-full bg-transparent text-sm font-bold text-white outline-none placeholder:text-neutral-600"
                aria-label="Filtrar canjes por dia"
              />
            </span>
          </label>
          <button
            type="button"
            onClick={onClearFilters}
            disabled={!hasFilter}
            className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/10 bg-neutral-950 px-3 text-sm font-bold text-neutral-300 transition hover:border-red-300/35 hover:text-white focus:outline-none focus:ring-2 focus:ring-red-300/40 disabled:cursor-not-allowed disabled:text-neutral-700"
          >
            <IconX size={16} />
            Limpiar
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2 sm:flex sm:justify-end">
          <RedemptionStat label="Total" value={total} icon={<IconShoppingBag size={14} />} />
          <RedemptionStat label="Abiertos" value={open} icon={<IconClock size={14} />} />
          <RedemptionStat label="Cerrados" value={closed} icon={<IconCircleCheck size={14} />} />
        </div>
      </div>
    </div>
  );
}

function RedemptionCard({ ticket, product, isPending, onStatusChange, onDelete }) {
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
            <OrderMetric label="Usuario" value={ticket.username} icon={<IconUserCircle size={14} />} />
          </div>
        </div>
      </div>

      <TicketActions
        ticket={ticket}
        isPending={isPending}
        onStatusChange={onStatusChange}
        onDelete={onDelete}
      />
      <UserProfileModal
        user={ticket.user}
        fallbackUsername={ticket.username}
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
      />
    </article>
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

function RedemptionStat({ label, value, icon }) {
  return (
    <span className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-neutral-900 px-3 py-2 text-xs font-bold text-neutral-400">
      {icon}
      <span>{label}</span>
      <strong className="text-white">{value}</strong>
    </span>
  );
}

function OrderMetric({ label, value, icon }) {
  return (
    <div className="rounded-xl border border-white/10 bg-neutral-950/65 p-3">
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase text-neutral-500">
        {icon}
        {label}
      </span>
      <p className="mt-1 truncate text-sm font-black text-white">{value}</p>
    </div>
  );
}

function getRedemptionProductName(ticket) {
  return String(ticket.subject || "Canje").replace(/^Canje:\s*/i, "").trim();
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
