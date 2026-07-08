import {
  IconBrandDiscord,
  IconBrandInstagram,
  IconBrandX,
  IconId,
  IconMail,
  IconMapPin,
  IconPhone,
  IconUserCircle,
  IconX,
} from "@tabler/icons-react";

export function UserProfileButton({ user, username, onClick }) {
  if (!user) {
    return <span className="text-xs text-neutral-500">{username}</span>;
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex cursor-pointer items-center gap-1 rounded-md text-xs font-semibold text-neutral-300 underline-offset-4 transition hover:text-white hover:underline focus:outline-none"
      aria-label={`Ver perfil de ${username}`}
    >
      <IconUserCircle size={14} />
      {username}
    </button>
  );
}

export default function UserProfileModal({ user, fallbackUsername, open, onClose }) {
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
            className="inline-flex size-9 cursor-pointer items-center justify-center rounded-md border border-white/10 bg-neutral-900 text-neutral-400 transition hover:border-red-300/35 hover:text-white focus:outline-none"
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
          <ProfileValue label="Instagram" value={user.instagram} icon={<IconBrandInstagram size={15} />} />
          <ProfileValue label="Twitter/X" value={user.twitter} icon={<IconBrandX size={15} />} />
            <ProfileValue label="Discord" value={user.discord} icon={<IconBrandDiscord size={15} />} />
        </div>
      </div>
    </div>
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
