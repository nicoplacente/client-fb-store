import { useState } from "react";
import {
  IconAlertTriangle,
  IconBroadcast,
  IconRefreshAlert,
  IconShieldExclamation,
  IconTrash,
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

  if (hasOnlineSignal) return `${source} · esperando confirmación`;

  return `${source}: ${liveStatus.status || "auto"}`;
}

function formatLiveSource(source) {
  if (source === "chrome_extension" || source === "chrome_extension_page") {
    return "Extensión (diagnóstico)";
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
  onRemovePredictionsHistory,
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

          <div className="grid gap-3">
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
                detail={isManual ? "Control manual" : "Control automático"}
                active={isManual}
              />
              <ActionCard
                icon={IconRefreshAlert}
                title="Reiniciar ranking"
                text="Esta acción deja en 0 los créditos y todos los valores del ranking de la comunidad, conservando los usuarios existentes."
                actionLabel="Reiniciar puntos y créditos"
                variant="danger"
                disabled={isPending}
                onClick={() => setConfirmOpen(true)}
              />
              <ActionCard
                icon={IconTrash}
                title="Borrar historial de predicciones"
                text="Elimina las predicciones cerradas o resueltas del historial global. Las predicciones activas se conservan."
                actionLabel="Borrar historial"
                disabled={isPending}
                onClick={onRemovePredictionsHistory}
              />
            </div>
          </div>
        </div>
      </section>

      <ConfirmationDialog
        open={confirmOpen}
        variant="danger"
        title="Reiniciar puntos y créditos"
        description="Esta acción impacta a todos los usuarios. Los usuarios se conservan, pero sus créditos y valores del ranking vuelven a 0."
        confirmLabel={isPending ? "Reiniciando..." : "Sí, reiniciar todo"}
        cancelLabel="Mantener saldos"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={confirmResetRankingPoints}
      >
        <div className="space-y-3 text-sm leading-6 text-neutral-300">
          <p className="font-semibold text-red-100">
            Antes de confirmar, revisa el alcance:
          </p>
          <ul className="list-disc space-y-2 pl-5 text-neutral-400">
            <li>Todos los puntos del ranking quedarán en 0.</li>
            <li>Todos los créditos de usuario quedarán en 0.</li>
            <li>Watchtime, cofres, rachas, mensajes y recompensas de chat quedarán en 0.</li>
            <li>Los usuarios existentes no se eliminan.</li>
            <li>La acción no se puede deshacer desde el dashboard.</li>
          </ul>
        </div>
      </ConfirmationDialog>
    </>
  );
}

function ActionCard({
  icon: Icon,
  title,
  text,
  actionLabel,
  variant = "default",
  disabled,
  onClick,
}) {
  const isDanger = variant === "danger";

  return (
    <div
      className={`flex min-h-48 flex-col justify-between rounded-2xl border border-red-300/20 p-4 ${
        isDanger ? "bg-red-950/20" : "bg-neutral-950/65"
      }`}
    >
      <div>
        <h3 className="inline-flex items-center gap-2 text-base font-black text-white">
          <Icon size={19} />
          {title}
        </h3>
        <p className="mt-2 text-sm leading-6 text-neutral-400">{text}</p>
      </div>
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={`mt-5 inline-flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-red-300/35 px-4 py-3 text-sm font-black text-red-100 transition hover:-translate-y-0.5 hover:border-red-200/50 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60 ${
          isDanger
            ? "bg-red-500/15 hover:bg-red-500/25"
            : "bg-neutral-950 hover:bg-red-500/15"
        }`}
      >
        <Icon size={18} />
        {actionLabel}
      </button>
    </div>
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
