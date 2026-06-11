import {
  IconDeviceFloppy,
  IconPlus,
  IconTrash,
  IconWheel,
} from "@tabler/icons-react";
import {
  FormattedNumberInput,
  SelectInput,
  TextInput,
} from "./form-controls";

const PROBABILITY_TOLERANCE = 0.001;
const EFFECT_OPTIONS = [
  {
    value: "none",
    label: "Sin efecto",
  },
  {
    value: "credits_multiply",
    label: "X2 del precio de la ruleta",
  },
  {
    value: "credits_add",
    label: "Suma de puntos",
  },
  {
    value: "credits_subtract",
    label: "Reducir créditos",
  },
  {
    value: "kick_timeout",
    label: "Timeout en Kick",
  },
];

export default function RewardWheelPanel({
  rewardWheels,
  selectedWheelId,
  prizes,
  hasUnsavedChanges,
  isPending,
  onSelectWheel,
  onAddPrize,
  onChangePrize,
  onRemovePrize,
  onSave,
}) {
  const totalProbability = prizes.reduce(
    (sum, prize) => sum + Number(prize.probability || 0),
    0,
  );
  const hasValidTotal =
    prizes.length > 0 &&
    Math.abs(totalProbability - 100) < PROBABILITY_TOLERANCE;

  return (
    <section className="space-y-5 rounded-2xl border border-white/10 bg-neutral-950/75 p-4 shadow-xl shadow-black/20 ring-1 ring-white/[0.03] sm:p-5">
      <div className="flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="inline-flex items-center gap-2 text-lg font-bold text-white">
            <IconWheel size={20} />
            Ruleta
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-neutral-400">
            Configura los premios ilimitados que se mostrarán en la fuente OBS
            <span className="font-semibold text-neutral-200"> /stream/wheel</span>.
          </p>
        </div>
        <div
          className={`rounded-xl border px-4 py-3 text-sm font-black tabular-nums ${
            hasValidTotal
              ? "border-green-300/30 bg-green-400/10 text-green-200"
              : "border-red-300/30 bg-red-500/10 text-red-200"
          }`}
        >
          Total: {formatProbability(totalProbability)}%
        </div>
      </div>

      <label className="grid gap-2 text-sm font-semibold text-neutral-300">
        Ruleta a editar
        <SelectInput
          value={selectedWheelId || ""}
          disabled={isPending || rewardWheels.length === 0}
          onChange={(event) => onSelectWheel(event.target.value)}
        >
          {rewardWheels.length === 0 ? (
            <option value="">No hay productos de tipo ruleta</option>
          ) : null}
          {rewardWheels.map((wheel) => (
            <option key={wheel.id} value={wheel.id}>
              {wheel.product?.name || `Ruleta ${wheel.id}`}
            </option>
          ))}
        </SelectInput>
      </label>

      {rewardWheels.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 bg-neutral-900/40 p-8 text-center">
          <p className="font-bold text-neutral-300">
            Todavía no hay ruletas para configurar.
          </p>
          <p className="mt-2 text-sm text-neutral-500">
            Crea o edita un producto y selecciona “Ruleta de recompensas” en
            Eventos del stream.
          </p>
        </div>
      ) : null}

      {hasUnsavedChanges ? (
        <p className="rounded-xl border border-amber-300/20 bg-amber-400/10 px-3 py-2 text-sm font-semibold text-amber-100">
          Hay cambios sin guardar. La actualización automática no reemplazará
          este borrador.
        </p>
      ) : null}

      {rewardWheels.length > 0 ? (
        <div className="grid gap-3">
          {prizes.length ? (
            prizes.map((prize, index) => (
              <div
                key={prize.id}
                className="grid gap-3 rounded-2xl border border-white/10 bg-neutral-900/65 p-3 lg:grid-cols-[minmax(0,1fr)_10rem_minmax(12rem,0.8fr)_auto] lg:items-end"
              >
                <label className="grid gap-2 text-sm font-semibold text-neutral-300">
                  Premio {index + 1}
                  <TextInput
                    value={prize.name}
                    maxLength={80}
                    placeholder="Nombre del premio"
                    disabled={isPending}
                    onChange={(event) =>
                      onChangePrize(prize.id, "name", event.target.value)
                    }
                  />
                </label>
                <label className="grid gap-2 text-sm font-semibold text-neutral-300">
                  Probabilidad
                  <div className="relative">
                    <FormattedNumberInput
                      value={prize.probability}
                      allowDecimals
                      decimalScale={2}
                      min="0.01"
                      max="100"
                      disabled={isPending}
                      onValueChange={(value) =>
                        onChangePrize(prize.id, "probability", value)
                      }
                      className="w-full pr-9"
                      aria-label={`Probabilidad del premio ${index + 1}`}
                    />
                    <span className="pointer-events-none absolute inset-y-0 right-3 grid place-items-center text-sm font-bold text-neutral-500">
                      %
                    </span>
                  </div>
                </label>
                <label className="grid gap-2 text-sm font-semibold text-neutral-300">
                  Efecto
                  <SelectInput
                    value={prize.effectType || "none"}
                    disabled={isPending}
                    onChange={(event) =>
                      onChangePrize(
                        prize.id,
                        "effectType",
                        event.target.value,
                      )
                    }
                  >
                    {EFFECT_OPTIONS.map((effect) => (
                      <option key={effect.value} value={effect.value}>
                        {effect.label}
                      </option>
                    ))}
                  </SelectInput>
                </label>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => onRemovePrize(prize.id)}
                  className="inline-flex size-11 cursor-pointer items-center justify-center rounded-xl border border-red-500/30 bg-red-500/10 text-red-200 transition hover:bg-red-500/20 focus:outline-none focus:ring-2 focus:ring-red-300/40 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label={`Eliminar premio ${prize.name || index + 1}`}
                >
                  <IconTrash size={17} />
                </button>
                {requiresEffectValue(prize.effectType) ? (
                  <label className="grid gap-2 text-sm font-semibold text-neutral-300 lg:col-start-3">
                    {getEffectValueLabel(prize.effectType)}
                    <div className="relative">
                      <FormattedNumberInput
                        value={prize.effectValue}
                        min="1"
                        max={
                          prize.effectType === "kick_timeout"
                            ? "10080"
                            : "1000000000"
                        }
                        disabled={isPending}
                        onValueChange={(value) =>
                          onChangePrize(prize.id, "effectValue", value)
                        }
                        className="w-full pr-20"
                        aria-label={`${getEffectValueLabel(prize.effectType)} del premio ${index + 1}`}
                      />
                      <span className="pointer-events-none absolute inset-y-0 right-3 grid place-items-center text-sm font-bold text-neutral-500">
                        {prize.effectType === "kick_timeout"
                          ? "minutos"
                          : "créditos"}
                      </span>
                    </div>
                  </label>
                ) : null}
                <p className="text-xs leading-relaxed text-neutral-500 lg:col-span-2">
                  {getEffectDescription(prize)}
                </p>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-white/10 bg-neutral-900/40 p-8 text-center text-sm text-neutral-500">
              Agrega al menos un premio para configurar la ruleta.
            </div>
          )}
        </div>
      ) : null}

      {rewardWheels.length > 0 ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
          <button
            type="button"
            disabled={isPending}
            onClick={onAddPrize}
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/10 bg-neutral-900 px-4 py-3 text-sm font-bold text-neutral-200 transition hover:border-red-300/30 hover:text-white focus:outline-none focus:ring-2 focus:ring-red-300/40 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <IconPlus size={17} />
            Agregar premio
          </button>
          <button
            type="button"
            disabled={isPending || !hasValidTotal}
            onClick={onSave}
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-red-300/20 bg-gradient-to-r from-red-700 to-red-500 px-5 py-3 text-sm font-black text-white shadow-[0_16px_34px_rgba(255,45,45,0.18)] transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-red-300/50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <IconDeviceFloppy size={18} />
            Guardar ruleta
          </button>
        </div>
      ) : null}

      {rewardWheels.length > 0 && !hasValidTotal ? (
        <p className="text-sm font-semibold text-red-200">
          La suma de todas las probabilidades debe ser exactamente 100%.
        </p>
      ) : null}
    </section>
  );
}

function formatProbability(value) {
  return Number(value || 0).toLocaleString("es-AR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

function getEffectDescription(prize) {
  if (prize.effectType === "credits_multiply") {
    return "Acredita dos veces el precio pagado por la ruleta. Si cuesta 500, suma 1.000 créditos.";
  }

  if (prize.effectType === "credits_add") {
    return "Suma al usuario la cantidad exacta de créditos configurada.";
  }

  if (prize.effectType === "credits_subtract") {
    return "Resta la cantidad configurada sin permitir que el saldo quede por debajo de cero.";
  }

  if (prize.effectType === "kick_timeout") {
    return "El canje se completa aunque Kick rechace el timeout; el fallo queda registrado.";
  }

  return "Este premio se muestra en la ruleta sin modificar la cuenta del usuario.";
}

function requiresEffectValue(effectType) {
  return [
    "credits_add",
    "credits_subtract",
    "kick_timeout",
  ].includes(effectType);
}

function getEffectValueLabel(effectType) {
  if (effectType === "kick_timeout") {
    return "Duración del timeout";
  }

  if (effectType === "credits_subtract") {
    return "Créditos a restar";
  }

  return "Créditos a sumar";
}
