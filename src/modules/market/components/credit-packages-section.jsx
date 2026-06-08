import { memo } from "react";
import { IconBolt } from "@tabler/icons-react";
import CreditPackageCard from "./credit-package-card";

function CreditPackagesSection({ creditPackages, disabled, onPurchase }) {
  if (creditPackages.length === 0) return null;

  const hasHorizontalScroll = creditPackages.length > 3;
  const layoutClassName = hasHorizontalScroll
    ? "credit-packages-scroll flex flex-col gap-4 md:-mx-1 md:flex-row md:overflow-x-auto md:px-1 md:pb-3"
    : `grid w-full gap-4 ${getCenteredGridClassName(creditPackages.length)}`;
  const itemClassName = hasHorizontalScroll
    ? "w-full md:flex-[0_0_min(25rem,calc((100%_-_1.5rem)_/_3.25))]"
    : "w-full";

  return (
    <section className="relative overflow-hidden rounded-2xl p-4 sm:p-0">
      {/* <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(135deg,rgba(251,191,36,0.08),rgba(10,10,10,0.82)_36%,rgba(10,10,10,0.94))] p-4 shadow-2xl shadow-black/25 ring-1 ring-white/[0.03] sm:p-5"> */}
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
              Usa tus puntos del canal para cargar creditos y desbloquear
              recompensas sin esperar.
            </p>
          </div>
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-amber-300/20 bg-black/25 px-3 py-1.5 text-xs font-black text-amber-100">
            <IconBolt size={15} />
            Acreditacion inmediata
          </span>
        </div>

        <div>
          <div className={layoutClassName}>
            {creditPackages.map((creditPackage) => (
              <div key={creditPackage.id} className={itemClassName}>
                <CreditPackageCard
                  creditPackage={creditPackage}
                  onPurchase={onPurchase}
                  disabled={disabled}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default memo(CreditPackagesSection);

function getCenteredGridClassName(itemsCount) {
  if (itemsCount === 1) return "md:grid-cols-1";
  if (itemsCount === 2) return "md:grid-cols-2";
  return "md:grid-cols-3";
}
