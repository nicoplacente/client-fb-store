"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import {
  IconBrandDiscord,
  IconBrandX,
  IconDeviceFloppy,
  IconId,
  IconMapPin,
  IconUserCircle,
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
  getLocalRedemptions,
  mergeRedemptions,
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

        const [data, localData, ticketData, subscriptions] = await Promise.all([
          getMyProductRedemptions().catch(() => []),
          Promise.resolve(getLocalRedemptions()),
          getDashboardTicketRedemptions(user),
          getMySubscriptions().catch(() => ({
            subscription: null,
            timeline: [],
          })),
        ]);

        if (!cancelled) {
          setRedemptions(mergeRedemptions(mergeRedemptions(data, ticketData), localData));
          setSubscriptionsData(subscriptions);
        }
      } catch {
        if (!cancelled) {
          setRedemptions(getLocalRedemptions());
          setSubscriptionsData({
            subscription: null,
            timeline: [],
          });
        }
      } finally {
        if (!cancelled) {
          setLoadingRedemptions(false);
          setLoadingSubscriptions(false);
        }
      }
    }

    loadProfileActivity();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const displayName = useMemo(() => user?.username || "usuario", [user?.username]);
  const normalizedRedemptions = useMemo(
    () =>
      redemptions
        .map(normalizeProductRedemption)
        .filter((redemption) => redemption.id),
    [redemptions]
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
      } catch (err) {
        toast.error(err.message || "No se pudo guardar el perfil");
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
    } catch (err) {
      toast.error(err.message || "No se pudo reclamar el premio de sub");
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
    ["instagram", "Usuario de Twitter/X", <IconBrandX key="instagram" size={18} />],
    ["discord", "Usuario de Discord", <IconBrandDiscord key="discord" size={18} />],
  ];

  return (
    <form onSubmit={onSubmit}>
      <div className="grid gap-5 lg:grid-cols-2">
        {fields.map(([field, label, icon]) => (
          <div key={field} className={field === "discord" ? "lg:col-span-2" : undefined}>
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
          className="inline-flex min-w-32 items-center justify-center gap-2 rounded-md bg-green-600/70 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-green-500 disabled:cursor-not-allowed disabled:opacity-50"
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
          String(ticket.user?.username || ticket.username || "").toLowerCase() ===
            String(user?.username || "").toLowerCase();

        return ticket.category === "market" && sameUser;
      })
      .map(ticketToRedemption);
  } catch {
    return [];
  }
}
