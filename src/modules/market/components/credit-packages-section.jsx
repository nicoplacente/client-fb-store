import { IconBolt } from "@tabler/icons-react";
import CreditPackageCard from "./credit-package-card";

export default function CreditPackagesSection({
  creditPackages,
  pendingAction,
  isPending,
  onPurchase,
}) {
  if (creditPackages.length === 0) return null;

  return (
    <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(135deg,rgba(251,191,36,0.08),rgba(10,10,10,0.82)_36%,rgba(10,10,10,0.94))] p-4 shadow-2xl shadow-black/25 ring-1 ring-white/[0.03] sm:p-5">
      <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-amber-200/45 to-transparent" />
      <div className="relative space-y-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-wide text-amber-200/80">
              Packs de creditos
            </p>
            <h2 className="mt-2 max-w-xl text-2xl font-black leading-tight text-white sm:text-3xl">
              Prepara saldo para canjear al instante
            </h2>
            <p className="mt-3 max-w-xl text-sm font-medium leading-6 text-neutral-400">
              Usa tus puntos del canal para cargar creditos y desbloquear recompensas sin esperar.
            </p>
          </div>
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-amber-300/20 bg-black/25 px-3 py-1.5 text-xs font-black text-amber-100">
            <IconBolt size={15} />
            Acreditacion inmediata
          </span>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {creditPackages.map((creditPackage) => (
            <CreditPackageCard
              key={creditPackage.id}
              creditPackage={creditPackage}
              onPurchase={onPurchase}
              disabled={isPending || Boolean(pendingAction)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
