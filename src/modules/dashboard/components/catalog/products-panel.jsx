import { useDeferredValue, useId, useMemo, useState } from "react";
import {
  IconAdjustmentsHorizontal,
  IconPackage,
  IconSearch,
  IconX,
} from "@tabler/icons-react";
import AdminCard from "../admin-card";
import {
  Field,
  FormattedNumberInput,
  PanelHeader,
  SelectInput,
  SubmitButton,
  TextArea,
  TextInput,
} from "../form-controls";
import ItemGrid from "../item-grid";
import { CreateButton, ModalForm, PanelTitle } from "./catalog-layout";
import { getProductCardDetails } from "./catalog-formatters";
import ImageInput from "./image-input";
import {
  filterProducts,
  getProductCategories,
  hasActiveProductFilters,
  initialProductFilters,
} from "./product-filters";
import { FeaturedToggle, RewardEffectFields } from "./product-form-sections";

export default function ProductsPanel({
  form,
  items,
  loading,
  isPending,
  selectedId,
  isFormOpen,
  onCreate,
  onSubmit,
  onCancel,
  onEdit,
  onDelete,
}) {
  const [filters, setFilters] = useState(initialProductFilters);
  const deferredQuery = useDeferredValue(filters.query);
  const categories = useMemo(() => getProductCategories(items), [items]);
  const { category, status, stock, featured } = filters;
  const visibleProducts = useMemo(
    () =>
      filterProducts(items, {
        query: deferredQuery,
        category,
        status,
        stock,
        featured,
      }),
    [category, deferredQuery, featured, items, status, stock],
  );
  const filtersAreActive = hasActiveProductFilters(filters);

  function updateFilter(name, value) {
    setFilters((current) => ({ ...current, [name]: value }));
  }

  return (
    <div className="space-y-5">
      <PanelTitle
        title="Productos"
        subtitle="Gestiona la visibilidad, el stock, los precios y los destacados del market."
        action={<CreateButton onClick={onCreate}>Crear nuevo producto</CreateButton>}
      />

      <ProductFilters
        filters={filters}
        categories={categories}
        resultCount={visibleProducts.length}
        totalCount={items.length}
        showClearButton={filtersAreActive}
        onFilterChange={updateFilter}
        onClear={() => setFilters(initialProductFilters)}
      />

      <ItemGrid
        loading={loading}
        emptyText={
          filtersAreActive
            ? "No hay productos que coincidan con los filtros."
            : "Todavía no hay productos."
        }
        items={visibleProducts}
        renderItem={(product) => (
          <AdminCard
            key={product.id}
            title={product.title}
            meta={`${product.price.toLocaleString()} creditos`}
            detail={getProductCardDetails(product)}
            imageUrl={product.imageUrl}
            featured={product.featured}
            unavailable={
              (!product.infiniteStock && product.stock <= 0) ||
              product.status !== "active"
            }
            icon={<IconPackage size={42} />}
            onEdit={() => onEdit(product)}
            onDelete={() => onDelete(product)}
          />
        )}
      />

      {isFormOpen ? (
        <ProductFormDialog
          key={selectedId || "new-product"}
          initialForm={form}
          isPending={isPending}
          selectedId={selectedId}
          onSubmit={onSubmit}
          onCancel={onCancel}
        />
      ) : null}
    </div>
  );
}

function ProductFilters({
  filters,
  categories,
  resultCount,
  totalCount,
  showClearButton,
  onFilterChange,
  onClear,
}) {
  return (
    <section
      aria-label="Filtros de productos"
      className="rounded-2xl border border-white/10 bg-neutral-950/75 p-4 shadow-xl shadow-black/20 ring-1 ring-white/[0.03] sm:p-5"
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <IconAdjustmentsHorizontal
            size={19}
            aria-hidden="true"
            className="text-red-300"
          />
          <div>
            <h3 className="text-sm font-bold text-white">Filtrar productos</h3>
            <p className="text-xs text-neutral-500" aria-live="polite">
              {resultCount} de {totalCount} productos
            </p>
          </div>
        </div>

        {showClearButton ? (
          <button
            type="button"
            onClick={onClear}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-white/10 bg-neutral-900/80 px-3 py-2 text-xs font-semibold text-neutral-300 transition hover:border-red-300/30 hover:text-white focus:outline-none focus-visible:border-red-300/60"
          >
            <IconX size={15} aria-hidden="true" />
            Limpiar filtros
          </button>
        ) : null}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(15rem,1.6fr)_repeat(4,minmax(0,1fr))]">
        <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-neutral-900/90 px-3 text-neutral-500 shadow-inner shadow-black/10 transition hover:border-red-300/25 focus-within:border-red-300/60">
          <IconSearch size={18} aria-hidden="true" />
          <span className="sr-only">Buscar productos</span>
          <input
            type="search"
            name="dashboard-product-search"
            autoComplete="off"
            value={filters.query}
            placeholder="Buscar por nombre..."
            onChange={(event) => onFilterChange("query", event.target.value)}
            className="min-w-0 flex-1 bg-transparent py-2.5 text-sm text-white outline-none placeholder:text-neutral-600"
          />
        </label>

        <FilterSelect
          label="Categoría"
          value={filters.category}
          onChange={(event) =>
            onFilterChange("category", event.target.value)
          }
        >
          <option value="all">Todas las categorías</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </FilterSelect>

        <FilterSelect
          label="Estado"
          value={filters.status}
          onChange={(event) => onFilterChange("status", event.target.value)}
        >
          <option value="all">Todos los estados</option>
          <option value="active">Activos</option>
          <option value="disabled">Deshabilitados</option>
          <option value="hidden">Ocultos</option>
        </FilterSelect>

        <FilterSelect
          label="Stock"
          value={filters.stock}
          onChange={(event) => onFilterChange("stock", event.target.value)}
        >
          <option value="all">Cualquier stock</option>
          <option value="available">Disponibles</option>
          <option value="out">Sin stock</option>
          <option value="infinite">Stock ilimitado</option>
        </FilterSelect>

        <FilterSelect
          label="Destacados"
          value={filters.featured}
          onChange={(event) =>
            onFilterChange("featured", event.target.value)
          }
        >
          <option value="all">Todos</option>
          <option value="featured">Destacados</option>
          <option value="regular">No destacados</option>
        </FilterSelect>
      </div>
    </section>
  );
}

function FilterSelect({ label, children, ...props }) {
  return (
    <label className="grid gap-1.5 text-xs font-semibold text-neutral-500">
      <span className="sr-only">{label}</span>
      <SelectInput {...props} aria-label={`Filtrar por ${label.toLowerCase()}`}>
        {children}
      </SelectInput>
    </label>
  );
}

function ProductFormDialog({
  initialForm,
  isPending,
  selectedId,
  onSubmit,
  onCancel,
}) {
  const [draftForm, setDraftForm] = useState(initialForm);

  function handleSubmit(event) {
    onSubmit(event, draftForm);
  }

  return (
    <ModalForm onCancel={onCancel} onSubmit={handleSubmit}>
      <PanelHeader
        title={selectedId ? "Editar producto" : "Nuevo producto"}
        subtitle="Market y carousel"
        canCancel
        onCancel={onCancel}
      />
      <ProductFormFields form={draftForm} setForm={setDraftForm} />
      <SubmitButton isPending={isPending} selectedId={selectedId} />
    </ModalForm>
  );
}

function ProductFormFields({ form, setForm }) {
  return (
    <div className="grid gap-4">
      <Field label="Nombre">
        <TextInput
          value={form.title}
          onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
          required
        />
      </Field>
      <Field label="Descripcion">
        <TextArea
          value={form.description}
          rows={4}
          onChange={(event) =>
            setForm((current) => ({ ...current, description: event.target.value }))
          }
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Precio">
          <FormattedNumberInput
            min="0"
            value={form.price}
            onValueChange={(price) => setForm((current) => ({ ...current, price }))}
            required
          />
        </Field>
        <StockField form={form} setForm={setForm} />
      </div>
      <SingleUnitField form={form} setForm={setForm} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Categoria">
          <TextInput
            value={form.category}
            onChange={(event) =>
              setForm((current) => ({ ...current, category: event.target.value }))
            }
          />
        </Field>
        <Field label="Estado">
          <SelectInput
            value={form.status}
            onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}
          >
            <option value="active">Activo / habilitado</option>
            <option value="disabled">Deshabilitado</option>
            <option value="hidden">Quitar de la tienda</option>
          </SelectInput>
        </Field>
      </div>
      <ImageInput
        file={form.imageFile}
        imageUrl={form.imageUrl}
        onUrlChange={(event) => setForm((current) => ({ ...current, imageUrl: event.target.value }))}
        onFileChange={(file) =>
          setForm((current) => ({
            ...current,
            imageFile: file,
          }))
        }
        onClearFile={() => setForm((current) => ({ ...current, imageFile: null }))}
      />
      <FeaturedToggle
        checked={form.featured}
        onChange={(featured) => setForm((current) => ({ ...current, featured }))}
      />
      <RewardEffectFields form={form} setForm={setForm} />
      {/*
        OBS stream alerts are implemented but intentionally hidden from
        the product form for now. Re-enable this block when the streamer
        wants to configure big redemption alerts from the dashboard.
        <StreamAlertFields form={form} setForm={setForm} />
      */}
    </div>
  );
}

function StockField({ form, setForm }) {
  const stockId = useId();
  const infiniteStockId = useId();

  return (
    <div className="grid gap-2 text-sm font-semibold text-neutral-300">
      <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-6">
        <label htmlFor={stockId}>Stock</label>
        <label
          htmlFor={infiniteStockId}
          className="cursor-pointer whitespace-nowrap"
        >
          Stock ilimitado
        </label>
      </div>
      <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-6">
        <FormattedNumberInput
          id={stockId}
          min="0"
          value={form.stock}
          className="w-full"
          disabled={form.infiniteStock}
          onValueChange={(stock) =>
            setForm((current) => ({ ...current, stock }))
          }
          required
        />
        <div className="flex items-center">
          <WideToggle
            id={infiniteStockId}
            checked={form.infiniteStock}
            onChange={(checked) =>
              setForm((current) => ({
                ...current,
                infiniteStock: checked,
                stock: checked ? current.stock || "0" : current.stock,
              }))
            }
            ariaLabel="Alternar stock ilimitado"
          />
        </div>
      </div>
    </div>
  );
}

function SingleUnitField({ form, setForm }) {
  return (
    <div
      className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-white/10 bg-neutral-950/70 p-4 transition hover:border-red-300/25 hover:bg-white/[0.03]"
    >
      <span>
        <span className="block text-sm font-black text-white">
          Una unidad por canje
        </span>
        <span className="mt-0.5 block text-xs font-medium text-neutral-500">
          Obliga a cerrar y volver a abrir el modal para comprar otra unidad.
        </span>
      </span>
      <WideToggle
        checked={form.singleUnitPerRedemption}
        onChange={(checked) =>
          setForm((current) => ({
            ...current,
            singleUnitPerRedemption: checked,
          }))
        }
        ariaLabel="Alternar una unidad por canje"
      />
    </div>
  );
}

function WideToggle({ id, checked, onChange, ariaLabel }) {
  return (
    <button
      id={id}
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative h-11 w-24 shrink-0 cursor-pointer rounded-xl border shadow-inner shadow-black/10 transition hover:border-red-300/25 focus:outline-none ${
        checked
          ? "border-red-300/45 bg-red-500/15"
          : "border-white/10 bg-neutral-900/90"
      }`}
      aria-pressed={checked}
      aria-label={ariaLabel}
    >
      <span
        className={`absolute top-1/2 size-6 -translate-y-1/2 rounded-full shadow-sm transition ${
          checked ? "left-15 bg-red-100" : "left-2 bg-white"
        }`}
      />
    </button>
  );
}
