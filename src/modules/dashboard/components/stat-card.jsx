export default function StatCard({ label, value }) {
  return (
    <div className="rounded-lg border border-white/10 bg-neutral-950/70 p-5">
      <p className="text-sm text-neutral-500">{label}</p>
      <strong className="mt-2 block text-3xl text-white">{value}</strong>
    </div>
  );
}
