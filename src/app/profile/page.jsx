"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import {
  IconBrandDiscord,
  IconBrandX,
  IconDeviceFloppy,
  IconFlame,
  IconId,
  IconMessageCircle,
  IconMapPin,
  IconSparkles,
  IconUserCircle,
  IconVideo,
} from "@tabler/icons-react";
import { toast } from "sonner";
import SectionContainer from "@/modules/ui/section-container";
import useAppContext from "@/context/use-app-context";
import { AuthContext } from "@/context/auth-context/auth-context";
import { apiRequest } from "@/modules/api/client";
import { envConfig } from "@/config";
import {
  getMyProductRedemptions,
  normalizeProductRedemption,
} from "@/modules/products/libs/product-api";
import {
  claimSubscriptionReward,
  getMySubscriptions,
} from "@/modules/subscriptions/libs/subscription-api";
import { getSupportTickets } from "@/modules/support/libs/support-api";
import ProfileField from "@/modules/profile/components/profile-field";
import ProfileTabs from "@/modules/profile/components/profile-tabs";
import RedemptionsList from "@/modules/profile/components/redemptions-list";
import SubscriptionsTimeline from "@/modules/profile/components/subscriptions-timeline";
import {
  emptyProfile,
  emptyLevelStats,
  formatCompactNumber,
  getLocalRedemptions,
  mergeRedemptions,
  normalizeLevelStats,
  ticketToRedemption,
  toProfile,
} from "@/modules/profile/lib/profile-utils";

export default function ProfilePage() {
  const { user, refreshUser } = useAppContext(AuthContext);
  const [profile, setProfile] = useState(emptyProfile);
  const [activeTab, setActiveTab] = useState("info");
  const [redemptions, setRedemptions] = useState([]);
  const [subscriptionsData, setSubscriptionsData] = useState({
    subscription: null,
    timeline: [],
  });
  const [levelStats, setLevelStats] = useState(emptyLevelStats);
  const [loadingLevelStats, setLoadingLevelStats] = useState(true);
  const [loadingRedemptions, setLoadingRedemptions] = useState(true);
  const [loadingSubscriptions, setLoadingSubscriptions] = useState(true);
  const [claimingRewardId, setClaimingRewardId] = useState(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setProfile(toProfile(user));
  }, [user]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    async function loadProfileActivity() {
      try {
        setLoadingRedemptions(true);
        setLoadingSubscriptions(true);
        setLoadingLevelStats(true);

        const [data, localData, ticketData, subscriptions, stats] =
          await Promise.all([
            getMyProductRedemptions().catch(() => []),
            Promise.resolve(getLocalRedemptions()),
            getDashboardTicketRedemptions(user),
            getMySubscriptions().catch(() => ({
              subscription: null,
              timeline: [],
            })),
            apiRequest(envConfig.API_STATS_ME).catch(() => ({
              data: emptyLevelStats,
            })),
          ]);

        if (!cancelled) {
          setRedemptions(
            mergeRedemptions(mergeRedemptions(data, ticketData), localData),
          );
          setSubscriptionsData(subscriptions);
          setLevelStats(normalizeLevelStats(stats.data));
        }
      } catch {
        if (!cancelled) {
          setRedemptions(getLocalRedemptions());
          setSubscriptionsData({
            subscription: null,
            timeline: [],
          });
          setLevelStats(emptyLevelStats);
        }
      } finally {
        if (!cancelled) {
          setLoadingRedemptions(false);
          setLoadingSubscriptions(false);
          setLoadingLevelStats(false);
        }
      }
    }

    loadProfileActivity();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const displayName = useMemo(
    () => user?.username || "usuario",
    [user?.username],
  );
  const normalizedRedemptions = useMemo(
    () =>
      redemptions
        .map(normalizeProductRedemption)
        .filter((redemption) => redemption.id),
    [redemptions],
  );

  function updateField(field, value) {
    setProfile((current) => ({ ...current, [field]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    startTransition(async () => {
      try {
        await apiRequest(envConfig.API_USER, {
          method: "PATCH",
          body: profile,
        });
        toast.success("Perfil actualizado");
        await Promise.resolve(refreshUser?.()).catch(() => {});
      } catch {
        toast.error("No se pudo guardar el perfil");
      }
    });
  }

  async function handleClaimSubscriptionReward(rewardId) {
    if (!rewardId) return;

    try {
      setClaimingRewardId(rewardId);
      await claimSubscriptionReward(rewardId);
      toast.success("Premio de sub reclamado");
      const subscriptions = await getMySubscriptions();
      setSubscriptionsData(subscriptions);
    } catch {
      toast.error("No se pudo reclamar el premio de sub");
    } finally {
      setClaimingRewardId(null);
    }
  }

  if (!user) {
    return (
      <SectionContainer className="space-y-6">
        <div className="mx-auto max-w-2xl rounded-lg border border-white/10 bg-neutral-950/80 p-5 text-center sm:p-8">
          <h1 className="text-2xl font-bold text-white sm:text-3xl">Perfil</h1>
          <p className="mt-3 text-neutral-400">
            Inicia sesion para ver y editar tu informacion.
          </p>
        </div>
      </SectionContainer>
    );
  }

  return (
    <SectionContainer className="space-y-8">
      <div className="mx-auto max-w-5xl overflow-hidden rounded-lg border border-white/10 bg-neutral-950/80 shadow-2xl shadow-black/50">
        <ProfileHero user={user} displayName={displayName} />

        <div className="px-5 py-7 sm:px-8">
          <ProfileXpCard stats={levelStats} loading={loadingLevelStats} />
          <ProfileTabs activeTab={activeTab} onChange={setActiveTab} />

          {activeTab === "info" ? (
            <ProfileInfoForm
              profile={profile}
              isPending={isPending}
              onSubmit={handleSubmit}
              onFieldChange={updateField}
            />
          ) : activeTab === "redemptions" ? (
            <RedemptionsList
              loading={loadingRedemptions}
              redemptions={normalizedRedemptions}
            />
          ) : (
            <SubscriptionsTimeline
              claimingRewardId={claimingRewardId}
              data={subscriptionsData}
              loading={loadingSubscriptions}
              onClaim={handleClaimSubscriptionReward}
            />
          )}
        </div>
      </div>
    </SectionContainer>
  );
}

function ProfileXpCard({ stats, loading }) {
  const progress = Math.max(0, Math.min(100, Number(stats.levelProgress || 0)));
  const sources = [
    {
      label: "Watchtime",
      value: `${formatCompactNumber(stats.watchtime)} min`,
      icon: IconVideo,
    },
    {
      label: "Mensajes",
      value: formatCompactNumber(stats.messages),
      icon: IconMessageCircle,
    },
    {
      label: "Puntos",
      value: formatCompactNumber(stats.points),
      icon: IconSparkles,
    },
    {
      label: "Racha",
      value: `${formatCompactNumber(stats.streak)} streams`,
      icon: IconFlame,
    },
  ];

  return (
    <section className="mb-8 rounded-lg border border-white/10 bg-neutral-900/70 p-4 shadow-xl shadow-black/30 sm:p-5">
      <div className="grid gap-5 lg:grid-cols-[auto_1fr] lg:items-center">
        <div className="flex items-center gap-4">
          <div className="grid size-20 place-items-center rounded-full border border-violet-300/35 bg-[radial-gradient(circle_at_35%_25%,rgba(196,181,253,0.95),rgba(124,58,237,0.72)_48%,rgba(24,24,27,0.96)_100%)] text-center shadow-lg shadow-violet-950/40">
            <span className="text-3xl font-black leading-none text-white">
              {loading ? "..." : stats.level}
            </span>
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-neutral-500">
              Mi nivel
            </p>
            <h2 className="mt-1 text-2xl font-black text-white">
              {stats.levelTier}
            </h2>
            <p className="mt-1 text-sm font-bold text-violet-200">
              {formatCompactNumber(stats.xp)} XP acumulado
            </p>
          </div>
        </div>

        <div className="min-w-0">
          <div
            className="grid grid-cols-[repeat(20,minmax(0,1fr))] gap-1"
            aria-label={`Progreso de nivel ${progress}%`}
            role="meter"
            aria-valuemin="0"
            aria-valuemax="100"
            aria-valuenow={progress}
          >
            {Array.from({ length: 20 }, (_, index) => (
              <span
                key={index}
                className={`h-3 rounded-full border border-white/10 transition ${
                  index < Math.round(progress / 5)
                    ? "bg-gradient-to-r from-sky-400 to-violet-400"
                    : "bg-neutral-950"
                }`}
              />
            ))}
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-neutral-400">
            <span>{progress}% completado</span>
            <span>
              {formatCompactNumber(stats.levelRemainingXp)} XP para el nivel{" "}
              {stats.level + 1}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {sources.map((source) => {
          const Icon = source.icon;

          return (
            <div
              key={source.label}
              className="flex items-center gap-3 rounded-md border border-white/10 bg-neutral-950/70 px-3 py-2.5"
            >
              <span className="grid size-8 place-items-center rounded-md bg-white/5 text-violet-200">
                <Icon size={17} />
              </span>
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase text-neutral-500">
                  {source.label}
                </p>
                <p className="truncate text-sm font-black text-white">
                  {source.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function ProfileHero({ user, displayName }) {
  return (
    <div className="border-b border-white/10 bg-[radial-gradient(circle_at_top,rgba(239,68,68,0.18),transparent_34%),linear-gradient(180deg,rgba(23,23,23,0.92),rgba(10,10,10,0.95))] px-4 pb-7 pt-8 text-center sm:px-6 sm:pb-8 sm:pt-10">
      <div className="mx-auto flex size-24 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-neutral-900 text-neutral-600 shadow-xl shadow-black/40 sm:size-28">
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={`Avatar de ${displayName}`}
            className="size-full object-cover"
          />
        ) : (
          <IconUserCircle size={92} stroke={1.2} />
        )}
      </div>
      <h1 className="mt-6 break-words text-xl font-bold text-white sm:mt-7 sm:text-2xl">
        <span className="text-neutral-400">Bienvenido, </span>
        {displayName}
      </h1>
    </div>
  );
}

function ProfileInfoForm({ profile, isPending, onSubmit, onFieldChange }) {
  const fields = [
    ["country", "Pais", <IconMapPin key="country" size={18} />],
    ["name", "Nombre Completo", <IconUserCircle key="name" size={18} />],
    ["dni", "DNI (ID)", <IconId key="dni" size={18} />],
    ["city", "Ciudad", <IconMapPin key="city" size={18} />],
    ["province", "Provincia", <IconMapPin key="province" size={18} />],
    ["direction", "Direccion", <IconMapPin key="direction" size={18} />],
    ["postalCode", "Codigo Postal", <IconMapPin key="postalCode" size={18} />],
    [
      "instagram",
      "Usuario de Twitter/X",
      <IconBrandX key="instagram" size={18} />,
    ],
    [
      "discord",
      "Usuario de Discord",
      <IconBrandDiscord key="discord" size={18} />,
    ],
  ];

  return (
    <form onSubmit={onSubmit}>
      <div className="grid gap-5 lg:grid-cols-2">
        {fields.map(([field, label, icon]) => (
          <div
            key={field}
            className={field === "discord" ? "lg:col-span-2" : undefined}
          >
            <ProfileField
              label={label}
              value={profile[field]}
              onChange={(value) => onFieldChange(field, value)}
              icon={icon}
            />
          </div>
        ))}
      </div>

      <div className="mt-10 flex justify-center">
        <button
          disabled={isPending}
          className="inline-flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-red-300/20 bg-gradient-to-r from-red-700 to-red-500 px-5 py-3 text-sm font-black text-white shadow-[0_16px_34px_rgba(255,45,45,0.22)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_42px_rgba(255,45,45,0.30)] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        >
          <IconDeviceFloppy size={18} />
          Guardar
        </button>
      </div>
    </form>
  );
}

async function getDashboardTicketRedemptions(user) {
  try {
    const tickets = await getSupportTickets({ includeAll: true });

    return tickets
      .filter((ticket) => {
        const sameUser =
          Number(ticket.user?.id) === Number(user?.id) ||
          String(
            ticket.user?.username || ticket.username || "",
          ).toLowerCase() === String(user?.username || "").toLowerCase();

        return ticket.category === "market" && sameUser;
      })
      .map(ticketToRedemption);
  } catch {
    return [];
  }
}
