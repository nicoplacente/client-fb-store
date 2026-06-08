import { IconDeviceFloppy, IconPlus, IconX } from "@tabler/icons-react";

export function Field({ label, children }) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-neutral-300">
      {label}
      {children}
    </label>
  );
}

export function TextInput({ className = "", ...props }) {
  return (
    <input
      {...props}
      className={`rounded-xl border border-white/10 bg-neutral-900/90 px-3 py-2.5 text-white shadow-inner shadow-black/10 outline-none transition placeholder:text-neutral-600 hover:border-red-300/25 focus:border-red-300/60 focus:ring-2 focus:ring-red-300/15 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    />
  );
}

export function FormattedNumberInput({
  value,
  onValueChange,
  allowDecimals = false,
  decimalScale = 2,
  className = "",
  ...props
}) {
  const formattedValue = formatNumberForInput(value, {
    allowDecimals,
  });

  return (
    <TextInput
      {...props}
      type="text"
      inputMode={allowDecimals ? "decimal" : "numeric"}
      value={formattedValue}
      onChange={(event) =>
        onValueChange(
          normalizeNumberInput(event.target.value, {
            allowDecimals,
            decimalScale,
          }),
        )
      }
      className={`font-mono tabular-nums ${className}`}
    />
  );
}

export function TextArea(props) {
  return (
    <textarea
      {...props}
      className="resize-none rounded-xl border border-white/10 bg-neutral-900/90 px-3 py-2.5 text-white shadow-inner shadow-black/10 outline-none transition placeholder:text-neutral-600 hover:border-red-300/25 focus:border-red-300/60 focus:ring-2 focus:ring-red-300/15 disabled:cursor-not-allowed disabled:opacity-60"
    />
  );
}

function formatNumberForInput(value, { allowDecimals }) {
  const rawValue = String(value ?? "");

  if (!rawValue) return "";

  const [integerValue, decimalValue] = rawValue.split(".");
  const integerDigits = integerValue.replace(/\D/g, "");
  const formattedInteger = integerDigits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  if (!allowDecimals || decimalValue === undefined) {
    return formattedInteger;
  }

  return `${formattedInteger || "0"},${decimalValue}`;
}

function normalizeNumberInput(value, { allowDecimals, decimalScale }) {
  const cleanValue = String(value || "").replace(/[^\d.,]/g, "");

  if (!cleanValue) return "";

  if (!allowDecimals) {
    return normalizeInteger(cleanValue);
  }

  const decimalSeparatorIndex = getDecimalSeparatorIndex(
    cleanValue,
    decimalScale,
  );

  if (decimalSeparatorIndex === -1) {
    return normalizeInteger(cleanValue);
  }

  const integerValue = normalizeInteger(
    cleanValue.slice(0, decimalSeparatorIndex),
  );
  const decimalValue = cleanValue
    .slice(decimalSeparatorIndex + 1)
    .replace(/\D/g, "")
    .slice(0, decimalScale);

  return `${integerValue || "0"}.${decimalValue}`;
}

function normalizeInteger(value) {
  const digits = String(value || "").replace(/\D/g, "");

  return digits.replace(/^0+(?=\d)/, "");
}

function getDecimalSeparatorIndex(value, decimalScale) {
  const lastCommaIndex = value.lastIndexOf(",");
  const lastDotIndex = value.lastIndexOf(".");
  const separatorIndex = Math.max(lastCommaIndex, lastDotIndex);

  if (separatorIndex === -1) return -1;

  const separator = value[separatorIndex];
  const decimalsLength = value
    .slice(separatorIndex + 1)
    .replace(/\D/g, "").length;

  if (separator === ",") return separatorIndex;
  if (decimalsLength > 0 && decimalsLength <= decimalScale)
    return separatorIndex;

  return -1;
}

export function SelectInput(props) {
  return (
    <select
      {...props}
      className="cursor-pointer rounded-xl border border-white/10 bg-neutral-900/90 px-3 py-2.5 text-white shadow-inner shadow-black/10 outline-none transition hover:border-red-300/25 focus:border-red-300/60 focus:ring-2 focus:ring-red-300/15 disabled:cursor-not-allowed disabled:opacity-60"
    />
  );
}

export function PanelHeader({ title, subtitle, canCancel, onCancel }) {
  return (
    <div className="mb-5 flex items-start justify-between gap-3 border-b border-white/10 pb-5">
      <div>
        <h2 className="text-xl font-bold text-white">{title}</h2>
        <p className="mt-1 text-sm text-neutral-500">{subtitle}</p>
      </div>
      {canCancel ? (
        <button
          type="button"
          onClick={onCancel}
          className="cursor-pointer rounded-md border border-white/10 bg-neutral-900 p-2 text-neutral-400 transition hover:border-red-300/35 hover:text-white focus:outline-none focus:ring-2 focus:ring-red-300/40"
          aria-label="Cancelar edicion"
        >
          <IconX size={18} />
        </button>
      ) : null}
    </div>
  );
}

export function SubmitButton({ isPending, selectedId }) {
  return (
    <button
      type="submit"
      disabled={isPending}
      className="inline-flex min-h-12 mt-6 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-red-300/20 bg-gradient-to-r from-red-700 to-red-500 px-5 py-3 text-sm font-black text-white shadow-[0_16px_34px_rgba(255,45,45,0.22)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_42px_rgba(255,45,45,0.30)] focus:outline-none focus:ring-2 focus:ring-red-300/50 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {selectedId ? <IconDeviceFloppy size={18} /> : <IconPlus size={18} />}
      {selectedId ? "Guardar cambios" : "Crear"}
    </button>
  );
}
