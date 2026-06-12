import { useId, useState } from "react";
import { IconPackage } from "@tabler/icons-react";
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
  return (
    <div className="space-y-5">
      <PanelTitle
        title="Productos"
        subtitle="Gestiona visibilidad, stock, precios y destacados del market."
        action={<CreateButton onClick={onCreate}>Crear nuevo producto</CreateButton>}
      />

      <ItemGrid
        loading={loading}
        emptyText="Todavia no hay productos."
        items={items}
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
          <input
            id={infiniteStockId}
            type="checkbox"
            checked={form.infiniteStock}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                infiniteStock: event.target.checked,
                stock: event.target.checked ? current.stock || "0" : current.stock,
              }))
            }
            className="sr-only"
          />
          <button
            type="button"
            onClick={() =>
              setForm((current) => ({
                ...current,
                infiniteStock: !current.infiniteStock,
                stock: !current.infiniteStock ? current.stock || "0" : current.stock,
              }))
            }
            className={`relative h-11 w-24 cursor-pointer rounded-xl border shadow-inner shadow-black/10 transition hover:border-red-300/25 focus:outline-none ${
              form.infiniteStock
                ? "border-red-300/45 bg-red-500/15"
                : "border-white/10 bg-neutral-900/90"
            }`}
            aria-pressed={form.infiniteStock}
            aria-label="Alternar stock ilimitado"
          >
            <span
              className={`absolute top-1/2 size-6 -translate-y-1/2 rounded-full shadow-sm transition ${
                form.infiniteStock
                  ? "left-15 bg-red-100"
                  : "left-2 bg-white"
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
