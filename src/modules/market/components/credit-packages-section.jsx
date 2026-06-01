import { IconCoins } from "@tabler/icons-react";
import CreditPackageCard from "./credit-package-card";

export default function CreditPackagesSection({
  creditPackages,
  pendingAction,
  isPending,
  onPurchase,
}) {
  if (creditPackages.length === 0) return null;

  return (
    <section className="relative overflow-hidden rounded-3xl border border-amber-300/15 bg-neutral-950/65 p-4 shadow-2xl shadow-black/25 ring-1 ring-white/[0.03] sm:p-6">
      <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-amber-200/45 to-transparent" />
      <div className="relative space-y-5">
        <div className="flex flex-col gap-3 text-left lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-amber-200/80">
              Packs de creditos
            </p>
            <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
              Prepara saldo para canjear al instante
            </h2>
            <p className="mt-3 max-w-2xl text-neutral-400">
              Usa tus puntos del canal para cargar creditos y desbloquear recompensas sin esperar.
            </p>
          </div>
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1.5 text-xs font-bold text-amber-100">
            <IconCoins size={16} />
            Acreditacion inmediata
          </span>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
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
