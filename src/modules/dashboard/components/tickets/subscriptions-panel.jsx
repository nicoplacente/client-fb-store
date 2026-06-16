import { useMemo, useState } from "react";
import {
  IconCalendar,
  IconCircleCheck,
  IconClock,
  IconCrown,
  IconGift,
  IconUserCircle,
} from "@tabler/icons-react";
import { formatDateTime } from "../../lib/formatters";
import { TicketEmptyState } from "./ticket-status";
import UserProfileModal, { UserProfileButton } from "./user-profile-modal";
import { getSubscriptionRewardName } from "@/modules/profile/lib/profile-utils";

export default function SubscriptionsPanel({ subscriptions, loading }) {
  const subscriptionAlerts = useMemo(
    () => buildSubscriptionAlerts(subscriptions),
    [subscriptions],
  );
  const metrics = useMemo(
    () => getSubscriptionMetrics(subscriptions, subscriptionAlerts),
    [subscriptions, subscriptionAlerts],
  );

  return (
    <div className="space-y-5 rounded-2xl border border-white/10 bg-neutral-950/75 p-3 shadow-xl shadow-black/20 ring-1 ring-white/[0.03] sm:p-5">
      <SubscriptionsHeader metrics={metrics} />

      {loading ? (
        <TicketEmptyState>Cargando subscripciones...</TicketEmptyState>
      ) : subscriptionAlerts.length === 0 ? (
        <TicketEmptyState>No hay subscripciones registradas.</TicketEmptyState>
      ) : (
        <div className="grid gap-3">
          {subscriptionAlerts.map((alert) => (
            <SubscriptionAlertCard
              key={alert.id}
              alert={alert}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SubscriptionsHeader({ metrics }) {
  return (
    <div className="grid gap-5 border-b border-white/10 pb-5 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
      <div className="flex items-start gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-red-300/20 bg-red-500/10 text-red-200">
          <IconCrown size={22} />
        </span>
        <div>
          <h2 className="text-lg font-black text-white">Subscripciones</h2>
          <p className="mt-1 text-sm text-neutral-500">
            Registro de cada mes de sub, usuarios suscriptos y premios.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <SubscriptionMetric label="Alertas" value={metrics.total} />
        <SubscriptionMetric label="Activas" value={metrics.active} tone="red" />
        <SubscriptionMetric label="Pendientes" value={metrics.availableRewards} tone="emerald" />
        <SubscriptionMetric label="Reclamados" value={metrics.claimedRewards} tone="sky" />
      </div>
    </div>
  );
}

function SubscriptionAlertCard({ alert }) {
  const [profileOpen, setProfileOpen] = useState(false);
  const subscription = alert.subscription;
  const rewards = Array.isArray(subscription.rewards)
    ? subscription.rewards
    : [];
  const rewardSummary = getRewardSummary(rewards);
  const currentReward = getRewardForMonth(rewards, alert.month);
  const CurrentRewardIcon = currentReward.Icon;
  const status = subscription.isActive ? "Activa" : "Inactiva";
  const username =
    subscription.user?.username || subscription.username || "Usuario";

  return (
    <article className="grid gap-4 rounded-2xl border border-white/10 bg-neutral-900/60 p-4 shadow-lg shadow-black/15 transition hover:border-red-300/20 xl:grid-cols-[minmax(0,1fr)_minmax(18rem,24rem)] xl:items-center">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <UserProfileButton
            user={subscription.user}
            username={username}
            onClick={() => setProfileOpen(true)}
          />
          <span
            className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-bold ${
              subscription.isActive
                ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-200"
                : "border-white/10 bg-neutral-950 text-neutral-500"
            }`}
          >
            <IconClock size={14} />
            {status}
          </span>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          <SubscriptionDetail
            label="Mes de sub"
            value={alert.month}
            icon={<IconCrown size={14} />}
          />
          <SubscriptionDetail
            label="Premio"
            value={currentReward.shortLabel}
            icon={<IconGift size={14} />}
          />
          <SubscriptionDetail
            label="Ultimo evento"
            value={formatDateTime(subscription.lastEventAt) || "-"}
            icon={<IconCalendar size={14} />}
          />
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-neutral-500">
          <span className="inline-flex items-center gap-1.5">
            <IconUserCircle size={14} />
            ID usuario: {subscription.user?.id || "-"}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <IconCircleCheck size={14} />
            {rewardSummary.claimed} premio
            {rewardSummary.claimed === 1 ? "" : "s"} reclamado
            {rewardSummary.claimed === 1 ? "" : "s"}
          </span>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-neutral-950/65 p-3">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-xs font-black uppercase text-neutral-500">
            Alerta de sub
          </p>
          <span className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-bold ${currentReward.className}`}>
            <CurrentRewardIcon size={14} />
            {currentReward.statusLabel}
          </span>
        </div>

        <div className="rounded-xl border border-white/10 bg-neutral-900/70 px-4 py-4">
          <p className="text-2xl font-black text-white">
            {currentReward.monthsLabel}
          </p>
          <p className={`mt-2 text-sm font-bold ${currentReward.textClassName}`}>
            {currentReward.description}
          </p>
        </div>
      </div>

      <UserProfileModal
        user={subscription.user}
        fallbackUsername={username}
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
      />
    </article>
  );
}

function buildSubscriptionAlerts(subscriptions) {
  return subscriptions.flatMap((subscription) => {
    const currentMonths = Math.max(0, Number(subscription.currentMonths || 0));

    return Array.from({ length: currentMonths }, (_, index) => {
      const month = currentMonths - index;

      return {
        id: `${subscription.id}-${month}`,
        month,
        subscription,
      };
    });
  });
}

function SubscriptionMetric({ label, value, tone = "neutral" }) {
  const valueClassName = {
    emerald: "text-emerald-200",
    red: "text-red-200",
    sky: "text-sky-200",
    neutral: "text-white",
  }[tone];

  return (
    <div className="min-w-24 rounded-xl border border-white/10 bg-neutral-900/70 px-3 py-2">
      <p className="text-[10px] font-black uppercase tracking-wide text-neutral-600">
        {label}
      </p>
      <p className={`mt-0.5 text-lg font-black tabular-nums ${valueClassName}`}>
        {value}
      </p>
    </div>
  );
}

function SubscriptionDetail({ label, value, icon }) {
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

function getSubscriptionMetrics(subscriptions, alerts) {
  return subscriptions.reduce(
    (metrics, subscription) => {
      const rewards = Array.isArray(subscription.rewards)
        ? subscription.rewards
        : [];
      const currentMonths = Math.max(0, Number(subscription.currentMonths || 0));

      if (subscription.isActive) metrics.active += currentMonths;

      rewards.forEach((reward) => {
        if (reward.status === "available") metrics.availableRewards += 1;
        if (reward.status === "claimed") metrics.claimedRewards += 1;
      });

      return metrics;
    },
    {
      total: alerts.length,
      active: 0,
      availableRewards: 0,
      claimedRewards: 0,
    },
  );
}

function getRewardSummary(rewards) {
  return rewards.reduce(
    (summary, reward) => {
      if (reward.status === "available") summary.available += 1;
      if (reward.status === "claimed") summary.claimed += 1;

      return summary;
    },
    {
      available: 0,
      claimed: 0,
    },
  );
}

function getRewardForMonth(rewards, month) {
  const currentMonths = Number(month || 0);
  const currentReward = rewards.find(
    (reward) => Number(reward.milestoneMonth) === currentMonths,
  );
  const monthsLabel = `${currentMonths || 0} mes${
    currentMonths === 1 ? "" : "es"
  }`;

  if (!currentReward) {
    return {
      Icon: IconClock,
      monthsLabel,
      statusLabel: "Registrada",
      shortLabel: "Sin premio",
      description: "Mes de sub registrado sin premio configurado.",
      className: "border-white/10 bg-neutral-900 text-neutral-400",
      textClassName: "text-neutral-400",
    };
  }

  const rewardName =
    currentReward.rewardName || getSubscriptionRewardName(currentMonths);

  if (currentReward?.status === "claimed") {
    return {
      Icon: IconCircleCheck,
      monthsLabel,
      statusLabel: "Reclamado",
      shortLabel: rewardName,
      description: currentReward.claimedAt
        ? `${rewardName} reclamado el ${formatDateTime(currentReward.claimedAt)}.`
        : `${rewardName} reclamado.`,
      className: "border-sky-400/30 bg-sky-500/10 text-sky-200",
      textClassName: "text-sky-200",
    };
  }

  return {
    Icon: IconGift,
    monthsLabel,
    statusLabel: "No reclamado",
    shortLabel: rewardName,
    description: currentReward.unlockedAt
      ? `${rewardName} desbloqueado el ${formatDateTime(currentReward.unlockedAt)}.`
      : `${rewardName} disponible sin reclamar.`,
    className: "border-emerald-400/30 bg-emerald-500/10 text-emerald-200",
    textClassName: "text-emerald-200",
  };
}
