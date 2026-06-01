import ProductCard from "./product-card";

export default function ProductsGrid({
  loading,
  error,
  products,
  pendingAction,
  isPending,
  onRedeem,
}) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-neutral-950/75 p-10 text-center text-neutral-400 shadow-xl shadow-black/15">
        Cargando tienda...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-10 text-center text-red-200 shadow-xl shadow-black/15">
        {error}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-neutral-950/75 p-10 text-center text-neutral-400 shadow-xl shadow-black/15">
        No encontramos productos con esos filtros.
      </div>
    );
  }

  return (
    <div className="grid gap-x-5 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onRedeem={onRedeem}
          disabled={isPending || Boolean(pendingAction)}
        />
      ))}
    </div>
  );
}
