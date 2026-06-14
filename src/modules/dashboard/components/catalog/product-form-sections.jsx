import {
  IconBroadcast,
  IconFlame,
  IconGift,
  IconLockOpen,
  IconMicrophone,
  IconRestore,
  IconSparkles,
  IconUserMinus,
  IconWheel,
} from "@tabler/icons-react";
import { Field, TextInput } from "../form-controls";

export function FeaturedToggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      aria-pressed={checked}
      className={`flex w-full cursor-pointer items-center justify-between gap-4 rounded-2xl border p-4 text-left transition focus:outline-none ${
        checked
          ? "border-red-300/40 bg-red-500/12 shadow-lg shadow-red-950/15"
          : "border-white/10 bg-neutral-950/70 hover:border-red-300/25 hover:bg-white/[0.03]"
      }`}
    >
      <span className="flex min-w-0 items-center gap-3">
        <span
          className={`grid size-10 shrink-0 place-items-center rounded-xl border transition ${
            checked
              ? "border-red-300/45 bg-red-500/20 text-red-100"
              : "border-white/10 bg-neutral-900 text-neutral-500"
          }`}
        >
          <IconSparkles size={19} />
        </span>
        <span>
          <span className="block text-sm font-black text-white">Mostrar como destacado</span>
          <span className="mt-0.5 block text-xs font-medium text-neutral-500">
            Se mostrara con prioridad en el market.
          </span>
        </span>
      </span>
      <ToggleKnob checked={checked} color="red" />
    </button>
  );
}

export function RewardEffectFields({ form, setForm }) {
  const hasRewardEffect = form.rewardEffectType === "stream_special_hour";
  const restoresStreamStreak = form.rewardEffectType === "restore_stream_streak";
  const isRewardWheel = form.rewardEffectType === "reward_wheel";
  const isKickTimeout = form.rewardEffectType === "kick_timeout_user";
  const isKickUnban = form.rewardEffectType === "kick_unban_self";
  const isAudioSubmission = form.rewardEffectType === "audio_submission";
  const hasStreamEvent =
    hasRewardEffect ||
    restoresStreamStreak ||
    isRewardWheel ||
    isKickTimeout ||
    isKickUnban ||
    isAudioSubmission;

  return (
    <div className="grid gap-4 rounded-2xl border border-red-300/15 bg-[linear-gradient(135deg,rgba(220,38,38,0.12),rgba(10,10,10,0.78)_44%,rgba(10,10,10,0.92))] p-4 shadow-inner shadow-black/10">
      <div className="flex items-start gap-3 border-b border-white/10 pb-4">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-red-300/30 bg-red-500/15 text-red-100 shadow-lg shadow-red-950/20">
          <IconBroadcast size={19} />
        </span>
        <div>
          <h3 className="text-base font-bold text-white">Eventos del stream</h3>
          <p className="mt-1 text-sm text-neutral-500">
            Opcionalmente convierte este producto en un disparador de efectos del stream.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={() =>
          setForm((current) =>
            hasStreamEvent
              ? {
                  ...current,
                  rewardEffectType: "",
                  rewardEffectValue: "happy",
                  rewardEffectDurationMinutes: "60",
                }
              : {
                  ...current,
                  rewardEffectType: "stream_special_hour",
                  rewardEffectValue: "happy",
                  rewardEffectDurationMinutes: "60",
                  infiniteStock: true,
                }
          )
        }
        aria-pressed={hasStreamEvent}
        className="flex w-full cursor-pointer items-center justify-between gap-4 rounded-2xl border border-white/10 bg-neutral-950/70 p-4 text-left transition hover:border-red-300/25 hover:bg-white/[0.03] focus:outline-none"
      >
        <span className="flex min-w-0 items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-red-300/25 bg-red-500/10 text-red-100">
            <IconBroadcast size={18} />
          </span>
          <span>
            <span className="block text-sm font-black text-white">
              Añadir evento al canje
            </span>
            <span className="mt-0.5 block text-xs font-medium text-neutral-500">
              Si esta apagado, el producto se canjea como premio normal.
            </span>
          </span>
        </span>
        <ToggleKnob checked={hasStreamEvent} color="red" />
      </button>

      {hasStreamEvent ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <RewardTypeCard
            active={hasRewardEffect}
            icon={<IconBroadcast size={19} />}
            title="Hora especial"
            description="Al canjearse activa una hora especial automaticamente."
            onClick={() =>
              setForm((current) => ({
                ...current,
                rewardEffectType: "stream_special_hour",
                rewardEffectValue: "happy",
                rewardEffectDurationMinutes: "60",
                infiniteStock: true,
              }))
            }
          />
          <RewardTypeCard
            active={restoresStreamStreak}
            icon={<IconRestore size={19} />}
            title="Recuperar racha"
            description="Al canjearse restaura la racha perdida del usuario."
            onClick={() =>
              setForm((current) => ({
                ...current,
                rewardEffectType: "restore_stream_streak",
                rewardEffectValue: "",
                rewardEffectDurationMinutes: "",
                infiniteStock: true,
              }))
            }
          />
          <RewardTypeCard
            active={isRewardWheel}
            icon={<IconWheel size={19} />}
            title="Ruleta de recompensas"
            description="Usa una ruleta propia con premios configurables desde Stream."
            onClick={() =>
              setForm((current) => ({
                ...current,
                rewardEffectType: "reward_wheel",
                rewardEffectValue: "",
                rewardEffectDurationMinutes: "",
              }))
            }
          />
          <RewardTypeCard
            active={isKickTimeout}
            icon={<IconUserMinus size={19} />}
            title="Timeout dirigido"
            description="Permite elegir un usuario o seleccionar uno aleatorio."
            onClick={() =>
              setForm((current) => ({
                ...current,
                rewardEffectType: "kick_timeout_user",
                rewardEffectValue: "",
                rewardEffectDurationMinutes: "10",
                infiniteStock: true,
              }))
            }
          />
          <RewardTypeCard
            active={isKickUnban}
            icon={<IconLockOpen size={19} />}
            title="Desbanearse"
            description="Desbanea de Kick a la persona que realiza el canje."
            onClick={() =>
              setForm((current) => ({
                ...current,
                rewardEffectType: "kick_unban_self",
                rewardEffectValue: "",
                rewardEffectDurationMinutes: "",
                infiniteStock: true,
              }))
            }
          />
          <RewardTypeCard
            active={isAudioSubmission}
            icon={<IconMicrophone size={19} />}
            title="Audio para el stream"
            description="Habilita una grabación moderada que se reproduce en OBS."
            onClick={() =>
              setForm((current) => ({
                ...current,
                rewardEffectType: "audio_submission",
                rewardEffectValue: "",
                rewardEffectDurationMinutes: "",
                audioMaxDurationSeconds:
                  current.audioMaxDurationSeconds || "15",
                infiniteStock: true,
              }))
            }
          />
        </div>
      ) : null}

      {hasRewardEffect ? (
        <div className="rounded-2xl border border-yellow-300/25 bg-yellow-400/10 p-4 text-sm font-medium leading-6 text-yellow-100">
          Este premio activa Happy Hour durante 60 minutos al canjearse.
        </div>
      ) : null}

      {restoresStreamStreak ? (
        <div className="rounded-2xl border border-sky-300/20 bg-sky-400/10 p-4 text-sm font-medium leading-6 text-sky-100">
          Este premio solo puede canjearse si el usuario tiene una racha perdida
          para recuperar. Si no tiene racha perdida, el canje se rechaza antes de
          descontar creditos o stock.
        </div>
      ) : null}

      {isRewardWheel ? (
        <div className="rounded-2xl border border-fuchsia-300/20 bg-fuchsia-400/10 p-4 text-sm font-medium leading-6 text-fuchsia-100">
          Este producto tendrá una ruleta propia. Sus premios y probabilidades
          se configuran en Dashboard, Stream, Ruleta. Cada canje admite una sola
          unidad.
        </div>
      ) : null}

      {isKickTimeout ? (
        <div className="grid gap-4 rounded-2xl border border-red-300/20 bg-red-500/[0.08] p-4">
          <Field label="Duración del timeout">
            <div className="flex items-center gap-3">
              <TextInput
                type="number"
                min="1"
                max="10080"
                step="1"
                value={form.rewardEffectDurationMinutes}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    rewardEffectDurationMinutes: event.target.value,
                  }))
                }
                className="w-32"
                required
              />
              <span className="text-sm font-bold text-neutral-400">
                minutos
              </span>
            </div>
          </Field>
          <p className="text-sm font-medium leading-6 text-red-100">
            Al canjear, el comprador deberá elegir un usuario de la audiencia o
            marcar la opción aleatoria. El streamer y el comprador quedan
            excluidos.
          </p>
        </div>
      ) : null}

      {isKickUnban ? (
        <div className="rounded-2xl border border-green-300/20 bg-green-400/10 p-4 text-sm font-medium leading-6 text-green-100">
          Este producto utiliza la cuenta de Kick vinculada al comprador y
          solicita su desbaneo automáticamente.
        </div>
      ) : null}

      {isAudioSubmission ? (
        <div className="grid gap-4 rounded-2xl border border-sky-300/20 bg-sky-400/[0.08] p-4">
          <Field label="Duración máxima de la grabación">
            <div className="flex items-center gap-3">
              <TextInput
                type="number"
                min="5"
                max="60"
                step="1"
                value={form.audioMaxDurationSeconds}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    audioMaxDurationSeconds: event.target.value,
                  }))
                }
                className="w-32"
                required
              />
              <span className="text-sm font-bold text-neutral-400">
                segundos
              </span>
            </div>
          </Field>
          <p className="text-sm font-medium leading-6 text-sky-100">
            Cada canje habilita una sola grabación y admite hasta dos intentos
            si el moderador rechaza el primero. Los audios aprobados ingresan a
            la cola de OBS.
          </p>
        </div>
      ) : null}
    </div>
  );
}

export function StreamAlertFields({ form, setForm }) {
  return (
    <div className="grid gap-4 rounded-2xl border border-amber-300/15 bg-[linear-gradient(135deg,rgba(251,191,36,0.12),rgba(10,10,10,0.78)_42%,rgba(10,10,10,0.94))] p-4 shadow-inner shadow-black/10">
      <button
        type="button"
        onClick={() =>
          setForm((current) => ({
            ...current,
            alertEnabled: !current.alertEnabled,
          }))
        }
        aria-pressed={form.alertEnabled}
        className="flex w-full cursor-pointer items-center justify-between gap-4 rounded-2xl border border-white/10 bg-neutral-950/65 p-4 text-left transition hover:border-amber-300/30 focus:outline-none"
      >
        <span className="flex min-w-0 items-center gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-amber-300/30 bg-amber-400/15 text-amber-100">
            <IconBroadcast size={19} />
          </span>
          <span>
            <span className="block text-sm font-black text-white">
              Alerta OBS al canjear
            </span>
            <span className="mt-0.5 block text-xs font-medium text-neutral-500">
              Dispara una animacion en /stream/alerts para premios grandes.
            </span>
          </span>
        </span>
        <ToggleKnob checked={form.alertEnabled} color="amber" />
      </button>

      {form.alertEnabled ? <StreamAlertOptions form={form} setForm={setForm} /> : null}
    </div>
  );
}

function StreamAlertOptions({ form, setForm }) {
  const alertOptions = [
    {
      id: "confetti",
      title: "Confetti",
      detail: "Celebracion limpia para premios grandes.",
      icon: <IconSparkles size={18} />,
      className: "border-sky-300/30 bg-sky-400/10 text-sky-100",
    },
    {
      id: "fire",
      title: "Fuego",
      detail: "Impacto fuerte para canjes importantes.",
      icon: <IconFlame size={18} />,
      className: "border-orange-300/30 bg-orange-500/10 text-orange-100",
    },
    {
      id: "legendary",
      title: "Legendaria",
      detail: "Full pantalla para premios estrella.",
      icon: <IconGift size={18} />,
      className: "border-amber-300/30 bg-amber-400/10 text-amber-100",
    },
  ];

  return (
    <div className="grid gap-4 rounded-2xl border border-white/10 bg-neutral-950/65 p-4">
      <div className="grid gap-3 lg:grid-cols-3">
        {alertOptions.map((option) => (
          <OptionCard
            key={option.id}
            active={form.alertType === option.id}
            className={option.className}
            icon={option.icon}
            title={option.title}
            detail={option.detail}
            onClick={() =>
              setForm((current) => ({
                ...current,
                alertType: option.id,
              }))
            }
          />
        ))}
      </div>

      <Field label="Texto de la alerta">
        <TextInput
          value={form.alertMessage}
          placeholder="{username} ha canjeado {product}"
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              alertMessage: event.target.value,
            }))
          }
        />
      </Field>

      <Field label="Duracion de la alerta">
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-neutral-900/70 p-3">
          <TextInput
            type="number"
            min="3"
            max="30"
            step="1"
            value={form.alertDurationSeconds}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                alertDurationSeconds: event.target.value,
              }))
            }
            className="w-28"
            required
          />
          <span className="text-sm font-bold text-neutral-400">seg</span>
        </div>
      </Field>
    </div>
  );
}

function RewardTypeCard({ active, icon, title, description, onClick }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:border-red-300/25 focus:outline-none ${
        active
          ? "border-red-300/40 bg-red-500/12 shadow-lg shadow-red-950/15"
          : "border-white/10 bg-neutral-950/70 hover:bg-white/[0.03]"
      }`}
    >
      <span
        className={`grid size-10 shrink-0 place-items-center rounded-xl border transition ${
          active
            ? "border-red-300/45 bg-red-500/20 text-red-100"
            : "border-white/10 bg-neutral-900 text-neutral-500"
        }`}
      >
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-black text-white">{title}</span>
        <span className="mt-1 block text-xs font-medium text-neutral-500">
          {description}
        </span>
      </span>
    </button>
  );
}

function OptionCard({ active, className, icon, title, detail, onClick }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`grid cursor-pointer gap-3 rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:border-white/25 focus:outline-none ${
        active
          ? `${className} shadow-lg shadow-black/15`
          : "border-white/10 bg-neutral-900/80 text-neutral-300"
      }`}
    >
      <span className="flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-2 font-black">
          {icon}
          {title}
        </span>
        {active ? (
          <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-black">
            Elegido
          </span>
        ) : null}
      </span>
      <span className="text-xs font-medium text-neutral-400">{detail}</span>
    </button>
  );
}

function ToggleKnob({ checked, color }) {
  const activeClass =
    color === "amber"
      ? "border-amber-200/50 bg-amber-400"
      : "border-red-300/45 bg-red-500";

  return (
    <span
      className={`relative h-7 w-12 shrink-0 rounded-full border transition ${
        checked ? activeClass : "border-white/10 bg-neutral-800"
      }`}
    >
      <span
        className={`absolute top-1 size-5 rounded-full bg-white shadow-sm transition ${
          checked ? "left-6" : "left-1"
        }`}
      />
    </span>
  );
}
