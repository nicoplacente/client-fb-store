import {
  IconBroadcast,
  IconFlame,
  IconGift,
  IconPackage,
  IconSparkles,
} from "@tabler/icons-react";
import { Field, TextInput } from "../form-controls";

export function FeaturedToggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      aria-pressed={checked}
      className={`flex w-full cursor-pointer items-center justify-between gap-4 rounded-2xl border p-4 text-left transition focus:outline-none focus:ring-2 focus:ring-red-300/40 ${
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

  return (
    <div className="grid gap-4 rounded-2xl border border-red-300/15 bg-[linear-gradient(135deg,rgba(220,38,38,0.12),rgba(10,10,10,0.78)_44%,rgba(10,10,10,0.92))] p-4 shadow-inner shadow-black/10">
      <div className="flex items-start gap-3 border-b border-white/10 pb-4">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-red-300/30 bg-red-500/15 text-red-100 shadow-lg shadow-red-950/20">
          <IconBroadcast size={19} />
        </span>
        <div>
          <h3 className="text-base font-bold text-white">Evento del stream</h3>
          <p className="mt-1 text-sm text-neutral-500">
            Convierte este producto en un disparador para una hora especial en vivo.
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <RewardTypeCard
          active={!hasRewardEffect}
          icon={<IconPackage size={19} />}
          title="Premio normal"
          description="Se canjea en la tienda y crea el ticket de entrega."
          onClick={() => setForm((current) => ({ ...current, rewardEffectType: "" }))}
        />
        <RewardTypeCard
          active={hasRewardEffect}
          icon={<IconBroadcast size={19} />}
          title="Evento de stream"
          description="Al canjearse activa una hora especial automaticamente."
          onClick={() =>
            setForm((current) => ({
              ...current,
              rewardEffectType: "stream_special_hour",
              rewardEffectValue: current.rewardEffectValue || "happy",
              rewardEffectDurationMinutes: current.rewardEffectDurationMinutes || "60",
            }))
          }
        />
      </div>

      {hasRewardEffect ? <StreamHourOptions form={form} setForm={setForm} /> : null}
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
        className="flex w-full cursor-pointer items-center justify-between gap-4 rounded-2xl border border-white/10 bg-neutral-950/65 p-4 text-left transition hover:border-amber-300/30 focus:outline-none focus:ring-2 focus:ring-amber-200/35"
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

function StreamHourOptions({ form, setForm }) {
  const streamHourOptions = [
    {
      id: "happy",
      title: "Happy Hour",
      detail: "Bonus de watchtime durante el stream.",
      className: "border-yellow-300/30 bg-yellow-400/10 text-yellow-100",
    },
    {
      id: "opening",
      title: "Opening Hour",
      detail: "Empuja la participacion del chat.",
      className: "border-sky-300/30 bg-sky-400/10 text-sky-100",
    },
    {
      id: "bertello_snack",
      title: "Bertello-Snack Hour",
      detail: "Bonus fuerte de watchtime y chat.",
      className: "border-red-300/30 bg-red-500/10 text-red-100",
    },
  ];

  return (
    <div className="grid gap-4 rounded-2xl border border-white/10 bg-neutral-950/65 p-4 shadow-lg shadow-black/10">
      <div>
        <p className="text-sm font-black text-white">Hora especial que se activa</p>
        <p className="mt-1 text-xs font-medium text-neutral-500">
          Elegi el bonus que el usuario va a prender cuando compre este premio.
        </p>
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        {streamHourOptions.map((option) => (
          <OptionCard
            key={option.id}
            active={form.rewardEffectValue === option.id}
            className={option.className}
            icon={<IconSparkles size={17} />}
            title={option.title}
            detail={option.detail}
            onClick={() =>
              setForm((current) => ({
                ...current,
                rewardEffectValue: option.id,
              }))
            }
          />
        ))}
      </div>

      <Field label="Duracion del evento">
        <div className="grid gap-3 rounded-xl border border-white/10 bg-neutral-900/70 p-3 sm:grid-cols-[1fr_auto] sm:items-center">
          <p className="text-sm text-neutral-500">
            Tiempo activo despues del canje. El valor recomendado es 60 minutos.
          </p>
          <div className="flex items-center gap-2">
            <TextInput
              type="number"
              min="1"
              max="1440"
              step="1"
              value={form.rewardEffectDurationMinutes}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  rewardEffectDurationMinutes: event.target.value,
                }))
              }
              className="w-28"
              required
            />
            <span className="text-sm font-bold text-neutral-400">min</span>
          </div>
        </div>
      </Field>
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
      className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:border-red-300/25 focus:outline-none focus:ring-2 focus:ring-red-300/40 ${
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
