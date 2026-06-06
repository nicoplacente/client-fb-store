import { useState } from "react";
import { IconInfinity, IconPackage } from "@tabler/icons-react";
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
    <ModalForm onSubmit={handleSubmit}>
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
  return (
    <Field label="Stock">
      <div className="grid gap-2">
        <TextInput
          type="number"
          min="0"
          value={form.stock}
          disabled={form.infiniteStock}
          onChange={(event) =>
            setForm((current) => ({ ...current, stock: event.target.value }))
          }
          required
        />
        <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-white/10 bg-neutral-950/70 px-3 py-2 text-sm font-bold text-neutral-300 transition hover:border-red-300/25 hover:bg-white/[0.03]">
          <span className="inline-flex items-center gap-2">
            <IconInfinity size={17} className="text-red-100" />
            Stock infinito
          </span>
          <input
            type="checkbox"
            checked={form.infiniteStock}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                infiniteStock: event.target.checked,
                stock: event.target.checked ? current.stock || "0" : current.stock,
              }))
            }
            className="size-4 accent-red-500"
          />
        </label>
      </div>
    </Field>
  );
}
