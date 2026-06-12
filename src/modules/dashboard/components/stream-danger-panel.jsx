import { useState } from "react";
import {
  IconAlertTriangle,
  IconBroadcast,
  IconRefreshAlert,
  IconShieldExclamation,
} from "@tabler/icons-react";
import ConfirmationDialog from "@/modules/ui/confirmation-dialog";

function formatLiveStatus(liveStatus) {
  if (!liveStatus) return "Sin datos";
  if (liveStatus.isConfirmedLive) return "En vivo";
  if (liveStatus.isLive) return "Sin confirmar";
  if (liveStatus.status === "unknown") return "Desconocido";
  return "Offline";
}

function formatLiveMode(liveStatus) {
  if (!liveStatus) return "Esperando lectura";
  if (liveStatus.manualOverride === true) return "Override manual online";
  if (liveStatus.manualOverride === false) return "Override manual offline";

  const source = formatLiveSource(liveStatus.details?.source);
  const hasOnlineSignal = Boolean(liveStatus.details?.lastOnlineSignalAt);

  if (liveStatus.isConfirmedLive && hasOnlineSignal) {
    return `${source} · online confirmado`;
  }

  if (hasOnlineSignal) return `${source} · esperando confirmacion`;

  return `${source}: ${liveStatus.status || "auto"}`;
}

function formatLiveSource(source) {
  if (source === "chrome_extension" || source === "chrome_extension_page") {
    return "Extension (diagnostico)";
  }

  if (source === "kick_api") return "Kick API";
  if (source === "kick_public_api") return "Kick API oficial";
  if (source === "kick_webhook") return "Kick webhook";
  if (source === "playwright_dom") return "Detector DOM";
  if (source === "server_detector") return "Detector";
  if (source === "manual") return "Manual";

  return "Detector";
}

export default function StreamDangerPanel({
  isPending,
  liveStatus,
  streamHour,
  onResetRankingPoints,
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const live = Boolean(liveStatus?.isConfirmedLive);
  const isManual = streamHour?.hasManualOverride || streamHour?.mode === "manual";

  function confirmResetRankingPoints() {
    setConfirmOpen(false);
    onResetRankingPoints();
  }

  return (
    <>
      <section className="overflow-hidden rounded-2xl border border-red-300/20 bg-[linear-gradient(135deg,rgba(127,29,29,0.28),rgba(10,10,10,0.86)_46%,rgba(10,10,10,0.95))] p-4 shadow-2xl shadow-black/25 ring-1 ring-red-300/[0.04] sm:p-5">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <span className="grid size-12 shrink-0 place-items-center rounded-xl border border-red-300/25 bg-red-500/10 text-red-100">
                <IconShieldExclamation size={23} />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-red-300/80">
                  Zona de peligro
                </p>
                <h2 className="mt-1 text-xl font-black text-white">
                  Controles sensibles
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-400">
                  Revisa el estado actual del stream antes de ejecutar acciones que afectan el ranking de toda la comunidad.
                </p>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <StatusCard
                icon={IconBroadcast}
                label="Kick"
                title={formatLiveStatus(liveStatus)}
                detail={formatLiveMode(liveStatus)}
                active={live}
              />
              <StatusCard
                icon={IconAlertTriangle}
                label="Bonus activo"
                title={streamHour?.activeLabel || "Sin hora especial"}
                detail={isManual ? "Control manual" : "Control automatico"}
                active={isManual}
              />
            </div>
          </div>

          <div className="flex h-full flex-col justify-between rounded-2xl border border-red-300/20 bg-red-950/20 p-4">
            <div>
              <h3 className="inline-flex items-center gap-2 text-base font-black text-white">
                <IconRefreshAlert size={19} />
                Reiniciar ranking
              </h3>
              <p className="mt-2 text-sm leading-6 text-neutral-400">
                Esta accion deja en 0 los creditos y todos los valores del ranking de la comunidad, conservando los usuarios existentes.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setConfirmOpen(true)}
              disabled={isPending}
              className="mt-5 inline-flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-red-300/35 bg-red-500/15 px-4 py-3 text-sm font-black text-red-100 transition hover:-translate-y-0.5 hover:border-red-200/50 hover:bg-red-500/25 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
            >
              <IconRefreshAlert size={18} />
              Reiniciar puntos y creditos
            </button>
          </div>
        </div>
      </section>

      <ConfirmationDialog
        open={confirmOpen}
        variant="danger"
        title="Reiniciar puntos y creditos"
        description="Esta accion impacta a todos los usuarios. Los usuarios se conservan, pero sus creditos y valores del ranking vuelven a 0."
        confirmLabel={isPending ? "Reiniciando..." : "Si, reiniciar todo"}
        cancelLabel="Mantener saldos"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={confirmResetRankingPoints}
      >
        <div className="space-y-3 text-sm leading-6 text-neutral-300">
          <p className="font-semibold text-red-100">
            Antes de confirmar, revisa el alcance:
          </p>
          <ul className="list-disc space-y-2 pl-5 text-neutral-400">
            <li>Todos los puntos del ranking quedaran en 0.</li>
            <li>Todos los creditos de usuario quedaran en 0.</li>
            <li>Watchtime, cofres, rachas, mensajes y recompensas de chat quedaran en 0.</li>
            <li>Los usuarios existentes no se eliminan.</li>
            <li>La accion no se puede deshacer desde el dashboard.</li>
          </ul>
        </div>
      </ConfirmationDialog>
    </>
  );
}

function StatusCard({ icon: Icon, label, title, detail, active }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-neutral-950/70 p-4 shadow-lg shadow-black/10">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
            {label}
          </p>
          <h3 className="mt-2 text-lg font-black text-white">{title}</h3>
        </div>
        <span
          className={`grid size-10 shrink-0 place-items-center rounded-xl border ${
            active
              ? "border-green-300/25 bg-green-400/10 text-green-100"
              : "border-red-300/25 bg-red-500/10 text-red-100"
          }`}
        >
          <Icon size={19} />
        </span>
      </div>
      <p className="mt-3 text-sm font-medium text-neutral-500">{detail}</p>
    </div>
  );
}
