import { IconPackage } from "@tabler/icons-react";
import AdminCard from "../admin-card";
import { Field, PanelHeader, SelectInput, SubmitButton, TextArea, TextInput } from "../form-controls";
import ItemGrid from "../item-grid";
import { CreateButton, ModalForm, PanelTitle } from "./catalog-layout";
import { getProductCardDetails } from "./catalog-formatters";
import ImageInput from "./image-input";
import { FeaturedToggle, RewardEffectFields } from "./product-form-sections";

export default function ProductsPanel({
  form,
  setForm,
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
            unavailable={product.stock <= 0 || product.status !== "active"}
            icon={<IconPackage size={42} />}
            onEdit={() => onEdit(product)}
            onDelete={() => onDelete(product)}
          />
        )}
      />

      {isFormOpen ? (
        <ModalForm onSubmit={onSubmit}>
          <PanelHeader
            title={selectedId ? "Editar producto" : "Nuevo producto"}
            subtitle="Market y carousel"
            canCancel
            onCancel={onCancel}
          />
          <ProductFormFields form={form} setForm={setForm} />
          <SubmitButton isPending={isPending} selectedId={selectedId} />
        </ModalForm>
      ) : null}
    </div>
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
          <TextInput
            type="number"
            min="0"
            value={form.price}
            onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))}
            required
          />
        </Field>
        <Field label="Stock">
          <TextInput
            type="number"
            min="0"
            value={form.stock}
            onChange={(event) => setForm((current) => ({ ...current, stock: event.target.value }))}
            required
          />
        </Field>
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
