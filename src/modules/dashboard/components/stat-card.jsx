export default function StatCard({ label, value }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.04),rgba(10,10,10,0.82))] p-4 shadow-xl shadow-black/20 ring-1 ring-white/[0.03] transition duration-300 hover:-translate-y-0.5 hover:border-red-300/25 sm:p-5">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-300/40 to-transparent" />
      <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
        {label}
      </p>
      <strong className="mt-2 block text-3xl font-black text-white sm:text-4xl">
        {value}
      </strong>
    </div>
  );
}
