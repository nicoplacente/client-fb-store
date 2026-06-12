export default function ProfileField({
  label,
  value,
  onChange,
  icon,
  type = "text",
  autoComplete,
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-neutral-200">
      {label}
      <span className="flex items-center gap-2 rounded-md border border-white/10 bg-neutral-950/80 px-3 py-2.5 text-neutral-500 transition focus-within:border-red-400/70">
        {icon}
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={autoComplete}
          className="w-full bg-transparent text-sm font-semibold text-white outline-none placeholder:text-neutral-700"
          placeholder="Sin cargar"
        />
      </span>
    </label>
  );
}
