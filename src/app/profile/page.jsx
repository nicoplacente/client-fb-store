"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import {
  IconBrandDiscord,
  IconBrandX,
  IconCalendar,
  IconDeviceFloppy,
  IconId,
  IconInfoCircle,
  IconMapPin,
  IconShoppingBag,
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
import { getSupportTickets } from "@/modules/support/libs/support-api";
import coins from "@/assets/coins.webp";
import Image from "next/image";

const emptyProfile = {
  country: "",
  name: "",
  dni: "",
  city: "",
  province: "",
  direction: "",
  postalCode: "",
  instagram: "",
  discord: "",
};

function toProfile(user) {
  return {
    country: user?.country || "",
    name: user?.name || "",
    dni: user?.dni || "",
    city: user?.city || "",
    province: user?.province || "",
    direction: user?.direction || "",
    postalCode: user?.postalCode || "",
    instagram: user?.instagram || "",
    discord: user?.discord || "",
  };
}

function ProfileField({ label, value, onChange, icon }) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-neutral-200">
      {label}
      <span className="flex items-center gap-2 rounded-md border border-white/10 bg-neutral-950/80 px-3 py-2.5 text-neutral-500 transition focus-within:border-red-400/70">
        {icon}
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full bg-transparent text-sm font-semibold text-white outline-none placeholder:text-neutral-700"
          placeholder="Sin cargar"
        />
      </span>
    </label>
  );
}

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getLocalRedemptions() {
  if (typeof window === "undefined") return [];

  try {
    const data = JSON.parse(
      window.localStorage.getItem("fbStoreLocalRedemptions") || "[]"
    );
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function mergeRedemptions(primary, fallback) {
  const seen = new Set();

  return [...primary, ...fallback].filter((redemption) => {
    const productName = String(
      redemption.product?.name || redemption.product?.title || ""
    )
      .trim()
      .toLowerCase();
    const key = `${redemption.id || ""}-${productName}-${redemption.createdAt || ""}`;

    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function ticketToRedemption(ticket) {
  const productName = String(ticket.subject || "")
    .replace(/^Canje:\s*/i, "")
    .trim();
  const costMatch = String(ticket.message || "").match(/(\d[\d.]*)\s*creditos/i);
  const cost = costMatch ? Number(costMatch[1].replace(/\./g, "")) : 0;

  return {
    id: `ticket-${ticket.id}`,
    status: ticket.status || "open",
    cost,
    createdAt: ticket.createdAt || "",
    product: {
      id: `ticket-product-${ticket.id}`,
      title: productName || ticket.subject || "Canje",
      description: ticket.message || "",
      price: cost,
      stock: 0,
      status: "active",
      category: "Market",
      imageUrl: "",
    },
  };
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

export default function ProfilePage() {
  const { user, refreshUser } = useAppContext(AuthContext);
  const [profile, setProfile] = useState(emptyProfile);
  const [activeTab, setActiveTab] = useState("info");
  const [redemptions, setRedemptions] = useState([]);
  const [loadingRedemptions, setLoadingRedemptions] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setProfile(toProfile(user));
  }, [user]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    async function loadRedemptions() {
      try {
        setLoadingRedemptions(true);
        const [data, localData, ticketData] = await Promise.all([
          getMyProductRedemptions().catch(() => []),
          Promise.resolve(getLocalRedemptions()),
          getDashboardTicketRedemptions(user),
        ]);
        if (!cancelled) {
          setRedemptions(mergeRedemptions(mergeRedemptions(data, ticketData), localData));
        }
      } catch {
        if (!cancelled) setRedemptions(getLocalRedemptions());
      } finally {
        if (!cancelled) setLoadingRedemptions(false);
      }
    }

    loadRedemptions();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const displayName = useMemo(
    () => user?.username || "usuario",
    [user?.username]
  );
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
        <div className="border-b border-white/10 bg-[radial-gradient(circle_at_top,rgba(239,68,68,0.18),transparent_34%),linear-gradient(180deg,rgba(23,23,23,0.92),rgba(10,10,10,0.95))] px-4 pb-7 pt-8 text-center sm:px-6 sm:pb-8 sm:pt-10">
          <div className="mx-auto flex size-24 items-center justify-center rounded-full border border-white/10 bg-neutral-900 text-neutral-600 shadow-xl shadow-black/40 sm:size-28">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={`Avatar de ${displayName}`}
                className="size-full rounded-full object-cover"
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

        <div className="px-5 py-7 sm:px-8">
          <div className="mx-auto mb-7 grid w-full max-w-xs grid-cols-2 gap-2 border-b border-white/10 sm:max-w-sm">
            <ProfileTab
              active={activeTab === "info"}
              icon={<IconInfoCircle size={17} />}
              label="Informacion"
              onClick={() => setActiveTab("info")}
            />
            <ProfileTab
              active={activeTab === "redemptions"}
              icon={<IconShoppingBag size={17} />}
              label="Mis canjes"
              onClick={() => setActiveTab("redemptions")}
            />
          </div>

          {activeTab === "info" ? (
            <form onSubmit={handleSubmit}>
              <div className="grid gap-5 lg:grid-cols-2">
                <ProfileField
                  label="Pais"
                  value={profile.country}
                  onChange={(value) => updateField("country", value)}
                  icon={<IconMapPin size={18} />}
                />
                <ProfileField
                  label="Nombre Completo"
                  value={profile.name}
                  onChange={(value) => updateField("name", value)}
                  icon={<IconUserCircle size={18} />}
                />
                <ProfileField
                  label="DNI (ID)"
                  value={profile.dni}
                  onChange={(value) => updateField("dni", value)}
                  icon={<IconId size={18} />}
                />
                <ProfileField
                  label="Ciudad"
                  value={profile.city}
                  onChange={(value) => updateField("city", value)}
                  icon={<IconMapPin size={18} />}
                />
                <ProfileField
                  label="Provincia"
                  value={profile.province}
                  onChange={(value) => updateField("province", value)}
                  icon={<IconMapPin size={18} />}
                />
                <ProfileField
                  label="Direccion"
                  value={profile.direction}
                  onChange={(value) => updateField("direction", value)}
                  icon={<IconMapPin size={18} />}
                />
                <ProfileField
                  label="Codigo Postal"
                  value={profile.postalCode}
                  onChange={(value) => updateField("postalCode", value)}
                  icon={<IconMapPin size={18} />}
                />
                <ProfileField
                  label="Usuario de Twitter/X"
                  value={profile.instagram}
                  onChange={(value) => updateField("instagram", value)}
                  icon={<IconBrandX size={18} />}
                />
                <div className="lg:col-span-2">
                  <ProfileField
                    label="Usuario de Discord"
                    value={profile.discord}
                    onChange={(value) => updateField("discord", value)}
                    icon={<IconBrandDiscord size={18} />}
                  />
                </div>
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
          ) : (
            <RedemptionsList
              loading={loadingRedemptions}
              redemptions={normalizedRedemptions}
            />
          )}
        </div>
      </div>
    </SectionContainer>
  );
}

function ProfileTab({ active, icon, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Ver seccion ${label}`}
      className={`inline-flex min-w-0 cursor-pointer items-center justify-center gap-2 border-b-2 px-2 py-3 text-sm font-bold transition sm:px-4 ${
        active
          ? "border-red-400 text-white"
          : "border-transparent text-neutral-500 hover:text-neutral-200"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function RedemptionsList({ loading, redemptions }) {
  if (loading) {
    return (
      <div className="rounded-lg border border-white/10 bg-neutral-900/60 p-8 text-center text-neutral-400">
        Cargando canjes...
      </div>
    );
  }

  if (redemptions.length === 0) {
    return (
      <div className="rounded-lg border border-white/10 bg-neutral-900/60 p-8 text-center text-neutral-400">
        Todavia no hiciste canjes.
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {redemptions.map((redemption) => (
        <article
          key={redemption.id}
          className="grid gap-4 rounded-lg border border-white/10 bg-neutral-900/60 p-4 sm:grid-cols-[112px_1fr]"
        >
          <div className="aspect-square overflow-hidden rounded-md bg-neutral-950">
            {redemption.product.imageUrl ? (
              <img
                src={redemption.product.imageUrl}
                alt={`Imagen del producto canjeado ${redemption.product.title}`}
                className="h-full w-full object-cover"
                loading="lazy"
                decoding="async"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-neutral-600">
                <IconShoppingBag size={34} />
              </div>
            )}
          </div>
          <div className="flex flex-col justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-bold text-white">{redemption.product.title}</h2>
                <span className="rounded-md border border-white/10 bg-neutral-950 px-2 py-1 text-xs text-neutral-400">
                  {redemption.status}
                </span>
              </div>
              <p className="mt-2 line-clamp-2 text-sm text-neutral-400">
                {redemption.product.description || "Canje de producto"}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-400">
              <span className="inline-flex items-center gap-2 text-yellow-200">
                <Image src={coins} alt="Creditos" className="size-5" />
                {redemption.cost.toLocaleString()} creditos
              </span>
              <span className="inline-flex items-center gap-2">
                <IconCalendar size={16} />
                {formatDate(redemption.createdAt)}
              </span>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
