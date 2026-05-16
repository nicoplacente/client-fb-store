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

export default function ProfilePage() {
  const { user, refreshUser } = useAppContext(AuthContext);
  const [profile, setProfile] = useState(emptyProfile);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setProfile(toProfile(user));
  }, [user]);

  const displayName = useMemo(
    () => user?.username || "usuario",
    [user?.username]
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
        await refreshUser?.();
        toast.success("Perfil actualizado");
      } catch (err) {
        toast.error(err.message || "No se pudo guardar el perfil");
      }
    });
  }

  if (!user) {
    return (
      <SectionContainer className="space-y-6">
        <div className="mx-auto max-w-2xl rounded-lg border border-white/10 bg-neutral-950/80 p-8 text-center">
          <h1 className="text-3xl font-bold text-white">Perfil</h1>
          <p className="mt-3 text-neutral-400">
            Inicia sesion para ver y editar tu informacion.
          </p>
        </div>
      </SectionContainer>
    );
  }

  return (
    <SectionContainer className="space-y-8">
      <form
        onSubmit={handleSubmit}
        className="mx-auto max-w-5xl overflow-hidden rounded-lg border border-white/10 bg-neutral-950/80 shadow-2xl shadow-black/50"
      >
        <div className="border-b border-white/10 bg-[radial-gradient(circle_at_top,rgba(239,68,68,0.18),transparent_34%),linear-gradient(180deg,rgba(23,23,23,0.92),rgba(10,10,10,0.95))] px-6 pb-8 pt-10 text-center">
          <div className="mx-auto flex size-28 items-center justify-center rounded-full border border-white/10 bg-neutral-900 text-neutral-600 shadow-xl shadow-black/40">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={displayName}
                className="size-full rounded-full object-cover"
              />
            ) : (
              <IconUserCircle size={92} stroke={1.2} />
            )}
          </div>
          <h1 className="mt-7 text-2xl font-bold text-white">
            <span className="text-neutral-400">Bienvenido, </span>
            {displayName}
          </h1>
        </div>

        <div className="px-5 py-7 sm:px-8">
          <div className="mb-7 flex justify-center">
            <span className="rounded-md bg-neutral-800 px-5 py-2 text-sm font-bold text-white">
              Informacion
            </span>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
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
            <div className="md:col-span-2">
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
        </div>
      </form>
    </SectionContainer>
  );
}
