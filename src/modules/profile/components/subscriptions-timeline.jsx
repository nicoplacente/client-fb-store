import { useState } from "react";
import { IconCircleCheck, IconCrown, IconGift, IconLock } from "@tabler/icons-react";
import {
  INITIAL_VISIBLE_SUB_MILESTONES,
  buildMilestoneRail,
  formatShortDate,
  getSubscriptionStatusCopy,
  getVisibleSubscriptionTimeline,
} from "../lib/profile-utils";

export default function SubscriptionsTimeline({
  claimingRewardId,
  data,
  loading,
  onClaim,
}) {
  const [showAllMilestones, setShowAllMilestones] = useState(false);

  if (loading) {
    return (
      <div className="rounded-lg border border-white/10 bg-neutral-900/60 p-8 text-center text-neutral-400">
        Cargando subs...
      </div>
    );
  }

  const subscription = data.subscription;
  const timeline = Array.isArray(data.timeline) ? data.timeline : [];
  const currentMonths = Number(subscription?.currentMonths || 0);
  const hasHiddenMilestones = timeline.length > INITIAL_VISIBLE_SUB_MILESTONES;
  const visibleTimeline = getVisibleSubscriptionTimeline(timeline, showAllMilestones);

  if (!subscription && timeline.length === 0) {
    return (
      <div className="rounded-lg border border-white/10 bg-neutral-900/60 p-8 text-center text-neutral-400">
        Todavia no hay subs registradas en tu cuenta.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <SubStat label="Mes actual" value={currentMonths || "-"} />
        <SubStat label="Estado" value={subscription?.isActive ? "Activa" : "Inactiva"} />
        <SubStat label="Ultimo evento" value={formatShortDate(subscription?.lastEventAt) || "-"} />
      </div>

      <div className="min-w-0 rounded-lg border border-white/10 bg-neutral-950/60 p-3 sm:p-4">
        <div className="mb-4 flex items-start gap-2 text-sm font-bold text-neutral-300 sm:items-center">
          <IconCrown size={18} className="mt-0.5 shrink-0 text-red-200 sm:mt-0" />
          <span>Línea de tiempo de premios por sub</span>
        </div>

        <div className="grid gap-3">
          {visibleTimeline.map((item) => (
            <SubTimelineItem
              key={item.milestoneMonth}
              claimingRewardId={claimingRewardId}
              item={item}
              onClaim={onClaim}
            />
          ))}
        </div>

        {hasHiddenMilestones ? (
          <div className="mt-4 flex justify-center">
            <button
              type="button"
              onClick={() => setShowAllMilestones((current) => !current)}
              className="inline-flex min-h-10 items-center justify-center rounded-md border border-white/10 bg-neutral-900 px-4 py-2 text-sm font-black text-neutral-200 transition hover:border-red-300/40 hover:bg-red-500/10 hover:text-white"
            >
              {showAllMilestones ? "Ver menos" : `Ver todos (${timeline.length})`}
            </button>
          </div>
        ) : null}

        <div className="mt-4">
          <SubscriptionMilestoneRail currentMonths={currentMonths} timeline={timeline} />
        </div>
      </div>
    </div>
  );
}

function SubTimelineItem({ item, claimingRewardId, onClaim }) {
  const status = getSubscriptionStatusCopy(item.status);
  const isClaiming = Number(claimingRewardId) === Number(item.rewardId);
  const StatusIcon = getStatusIcon(item.status);

  return (
    <article className="relative grid min-w-0 grid-cols-[auto_minmax(0,1fr)] gap-3 rounded-lg border border-white/10 bg-neutral-900/60 p-3 transition hover:border-white/20 sm:grid-cols-[72px_minmax(0,1fr)_auto] sm:items-center sm:p-4">
      <div className="flex size-12 items-center justify-center rounded-md border border-red-400/25 bg-red-500/10 text-red-100 sm:size-14">
        <span className="text-lg font-black">M{item.milestoneMonth}</span>
      </div>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="break-words font-bold text-white">
            Mes {item.milestoneMonth} de suscripción
          </h3>
          <span className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-bold ${status.className}`}>
            <StatusIcon size={16} />
            {status.label}
          </span>
        </div>
        <p className="mt-1 text-sm text-neutral-400">
          {item.unlockedAt
            ? `Desbloqueado el ${formatShortDate(item.unlockedAt)}`
            : "Se desbloquea automaticamente cuando Kick confirme este mes."}
        </p>
        {item.claimedAt ? (
          <p className="mt-1 text-xs font-semibold text-sky-200">
            Reclamado el {formatShortDate(item.claimedAt)}
          </p>
        ) : null}
      </div>

      {item.isClaimable ? (
        <button
          type="button"
          disabled={isClaiming}
          onClick={() => onClaim(item.rewardId)}
          className="col-span-2 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-md bg-red-500 px-4 py-2 text-sm font-black text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-50 sm:col-span-1 sm:w-auto"
        >
          <IconGift size={17} />
          {isClaiming ? "Reclamando..." : "Reclamar"}
        </button>
      ) : null}
    </article>
  );
}

function SubscriptionMilestoneRail({ currentMonths, timeline }) {
  const milestones = buildMilestoneRail(timeline, currentMonths);

  return (
    <div className="max-w-full overflow-x-auto overscroll-x-contain rounded-lg border border-white/10 bg-[radial-gradient(circle_at_center,rgba(248,113,113,0.08),transparent_42%),rgba(10,10,10,0.82)] px-3 py-5 sm:px-4 sm:py-6">
      <div className="flex w-max min-w-full items-start justify-start px-1 sm:justify-center sm:px-2">
        {milestones.map((item, index) => {
          const isLast = index === milestones.length - 1;
          const locked = item.status === "locked";
          const nextStatus = milestones[index + 1]?.status || item.status;

          return (
            <div
              key={item.milestoneMonth}
              className="flex shrink-0 items-start"
              aria-label={`Mes ${item.displayMonth}`}
            >
              <div className="grid w-16 shrink-0 justify-items-center gap-2">
                <span
                  className={`relative flex size-12 items-center justify-center rounded-full border text-sm font-black shadow-lg transition ${getRailPointClass(item.status)}`}
                >
                  {locked ? <IconLock size={16} aria-hidden="true" /> : item.displayMonth}
                </span>
                <span className={`whitespace-nowrap text-xs font-black ${locked ? "text-neutral-500" : "text-neutral-200"}`}>
                  {item.displayMonth} mes{item.displayMonth === 1 ? "" : "es"}
                </span>
                <span className="h-1.5 w-1.5 rounded-full bg-red-300/50 shadow-sm shadow-red-300/20" />
              </div>

              {!isLast ? (
                <div className="relative mt-6 h-px w-8 shrink-0 sm:w-12">
                  <div className="absolute inset-x-0 top-0 h-px bg-white/10" />
                  <div className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r ${getRailSegmentClass(nextStatus)}`} />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SubStat({ label, value }) {
  return (
    <div className="min-w-0 rounded-md border border-white/10 bg-neutral-950/70 p-3">
      <p className="text-xs font-semibold uppercase text-neutral-500">{label}</p>
      <p className="mt-1 break-words text-lg font-black text-white">{value}</p>
    </div>
  );
}

function getStatusIcon(status) {
  if (status === "available") return IconGift;
  if (status === "claimed") return IconCircleCheck;
  return IconLock;
}

function getRailPointClass(status) {
  if (status === "available") {
    return "border-emerald-300 bg-emerald-400 text-emerald-950 shadow-emerald-500/25 ring-4 ring-emerald-400/10";
  }

  if (status === "claimed") {
    return "border-sky-300 bg-sky-400 text-sky-950 shadow-sky-500/25 ring-4 ring-sky-400/10";
  }

  if (status === "missed") {
    return "border-amber-300 bg-amber-400 text-amber-950 shadow-amber-500/25 ring-4 ring-amber-400/10";
  }

  return "border-white/15 bg-neutral-950 text-neutral-500 shadow-black/20";
}

function getRailSegmentClass(status) {
  if (status === "available") {
    return "from-red-400/70 via-emerald-300/60 to-emerald-300/20";
  }

  if (status === "claimed") {
    return "from-red-400/70 via-sky-300/60 to-sky-300/20";
  }

  if (status === "missed") {
    return "from-red-400/60 via-amber-300/50 to-amber-300/20";
  }

  return "from-red-400/35 via-white/15 to-white/5";
}
