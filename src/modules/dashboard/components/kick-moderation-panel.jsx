import {
  IconBrandKick,
  IconCircleCheck,
  IconPlugConnected,
  IconUnlink,
} from "@tabler/icons-react";

export default function KickModerationPanel({
  moderation,
  isPending,
  onConnect,
  onDisconnect,
}) {
  const connected = Boolean(moderation?.connected);
  const configured = moderation?.configured !== false;

  return (
    <section className="rounded-2xl border border-white/10 bg-neutral-950/75 p-4 shadow-xl shadow-black/20 ring-1 ring-white/[0.03] sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-white/10 bg-neutral-900 text-neutral-200">
            <IconBrandKick size={22} />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-bold text-white">
                Moderación de Kick
              </h2>
              <ModerationStatus connected={connected} />
            </div>
            <p className="mt-1 max-w-2xl text-sm text-neutral-400">
              Autoriza la cuenta del streamer para aplicar automáticamente los
              timeouts obtenidos en la ruleta.
            </p>
            {connected ? (
              <p className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-neutral-300">
                <IconCircleCheck size={16} className="text-green-300" />
                Conectada como {moderation.username}
              </p>
            ) : null}
            {!configured ? (
              <p className="mt-3 text-sm font-semibold text-amber-200">
                Faltan variables de entorno para habilitar esta conexión.
              </p>
            ) : null}
          </div>
        </div>

        {connected ? (
          <button
            type="button"
            disabled={isPending}
            onClick={onDisconnect}
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/10 bg-neutral-900 px-4 py-3 text-sm font-bold text-neutral-300 transition hover:border-red-300/30 hover:text-white focus:outline-none focus:ring-2 focus:ring-red-300/40 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <IconUnlink size={17} />
            Desconectar
          </button>
        ) : (
          <button
            type="button"
            disabled={isPending || !configured}
            onClick={onConnect}
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-green-300/25 bg-green-400/10 px-4 py-3 text-sm font-black text-green-100 transition hover:-translate-y-0.5 hover:bg-green-400/15 focus:outline-none focus:ring-2 focus:ring-green-300/40 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <IconPlugConnected size={18} />
            Habilitar moderación
          </button>
        )}
      </div>
    </section>
  );
}

function ModerationStatus({ connected }) {
  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-xs font-black uppercase tracking-wide ${
        connected
          ? "border-green-300/25 bg-green-400/10 text-green-200"
          : "border-amber-300/25 bg-amber-400/10 text-amber-100"
      }`}
    >
      {connected ? "Operativa" : "Sin conectar"}
    </span>
  );
}
