import { IconCoins, IconGift, IconPackage, IconPlus } from "@tabler/icons-react";
import AdminCard from "./admin-card";
import { Field, PanelHeader, SelectInput, SubmitButton, TextArea, TextInput } from "./form-controls";
import ItemGrid from "./item-grid";
import { formatProductStatus } from "../lib/formatters";

function CreateButton({ children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-500"
    >
      <IconPlus size={18} />
      {children}
    </button>
  );
}

function PanelTitle({ title, subtitle, action }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <h2 className="text-xl font-semibold text-white">{title}</h2>
        <p className="text-sm text-neutral-500">{subtitle}</p>
      </div>
      {action}
    </div>
  );
}

function ModalForm({ children, onSubmit }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <form
        onSubmit={onSubmit}
        role="dialog"
        aria-modal="true"
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-white/10 bg-neutral-950 p-5 shadow-2xl shadow-black"
      >
        {children}
      </form>
    </div>
  );
}

export function ProductsPanel({
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
        subtitle="Gestiona visibilidad, stock y destacados del market."
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
            detail={`${
              product.stock > 0 ? `${product.stock} disponibles` : "Sin stock"
            } - ${formatProductStatus(product.status)}`}
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
                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
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
                  onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
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
            <Field label="Imagen">
              <TextInput
                value={form.imageUrl}
                placeholder="https://..."
                onChange={(event) => setForm((current) => ({ ...current, imageUrl: event.target.value }))}
              />
            </Field>
            <label className="flex items-center gap-3 text-sm font-medium text-neutral-300">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(event) => setForm((current) => ({ ...current, featured: event.target.checked }))}
                className="size-4 accent-red-500"
              />
              Mostrar como destacado
            </label>
          </div>
          <SubmitButton isPending={isPending} selectedId={selectedId} />
        </ModalForm>
      ) : null}
    </div>
  );
}

export function CreditPackagesPanel({
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
}) {
  return (
    <div className="space-y-5">
      <PanelTitle
        title="Creditos"
        subtitle="Gestiona packs de creditos comprados con puntos."
        action={<CreateButton onClick={onCreate}>Crear nuevo pack</CreateButton>}
      />

      <ItemGrid
        loading={loading}
        emptyText="Todavia no hay packs de creditos."
        items={items}
        renderItem={(creditPackage) => (
          <AdminCard
            key={creditPackage.id}
            title={creditPackage.name}
            meta={`${creditPackage.credits.toLocaleString()} creditos`}
            detail={`${creditPackage.pointsCost.toLocaleString()} puntos - ${creditPackage.status}`}
            icon={<IconCoins size={42} />}
            onEdit={() => onEdit(creditPackage)}
          />
        )}
      />

      {isFormOpen ? (
        <ModalForm onSubmit={onSubmit}>
          <PanelHeader
            title={selectedId ? "Editar pack" : "Nuevo pack"}
            subtitle="Creditos comprados con puntos"
            canCancel
            onCancel={onCancel}
          />
          <div className="grid gap-4">
            <Field label="Nombre">
              <TextInput
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                required
              />
            </Field>
            <Field label="Descripcion">
              <TextArea
                value={form.description}
                rows={4}
                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Creditos que recibe">
                <TextInput
                  type="number"
                  min="1"
                  value={form.credits}
                  onChange={(event) => setForm((current) => ({ ...current, credits: event.target.value }))}
                  required
                />
              </Field>
              <Field label="Costo en puntos">
                <TextInput
                  type="number"
                  min="1"
                  step="0.01"
                  value={form.pointsCost}
                  onChange={(event) => setForm((current) => ({ ...current, pointsCost: event.target.value }))}
                  required
                />
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Orden">
                <TextInput
                  type="number"
                  value={form.sortOrder}
                  onChange={(event) => setForm((current) => ({ ...current, sortOrder: event.target.value }))}
                />
              </Field>
              <Field label="Estado">
                <SelectInput
                  value={form.status}
                  onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}
                >
                  <option value="active">Activo</option>
                  <option value="draft">Borrador</option>
                  <option value="archived">Archivado</option>
                </SelectInput>
              </Field>
            </div>
          </div>
          <SubmitButton isPending={isPending} selectedId={selectedId} />
        </ModalForm>
      ) : null}
    </div>
  );
}

export function GiveawaysPanel({
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
        title="Sorteos"
        subtitle="Gestiona premios, fechas y participacion."
        action={<CreateButton onClick={onCreate}>Crear nuevo sorteo</CreateButton>}
      />

      <ItemGrid
        loading={loading}
        emptyText="Todavia no hay sorteos."
        items={items}
        renderItem={(giveaway) => (
          <AdminCard
            key={giveaway.id}
            title={giveaway.title}
            meta={`${giveaway.prize} - ${
              giveaway.entryCost > 0
                ? `${giveaway.entryCost.toLocaleString()} creditos`
                : "Gratis"
            }`}
            detail={`${giveaway.participants} participantes - ${giveaway.status}`}
            imageUrl={giveaway.imageUrl}
            icon={<IconGift size={42} />}
            onEdit={() => onEdit(giveaway)}
            onDelete={() => onDelete(giveaway)}
          />
        )}
      />

      {isFormOpen ? (
        <ModalForm onSubmit={onSubmit}>
          <PanelHeader
            title={selectedId ? "Editar sorteo" : "Nuevo sorteo"}
            subtitle="Premios y participacion"
            canCancel
            onCancel={onCancel}
          />
          <div className="grid gap-4">
            <Field label="Titulo">
              <TextInput
                value={form.title}
                onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                required
              />
            </Field>
            <Field label="Premio">
              <TextInput
                value={form.prize}
                onChange={(event) => setForm((current) => ({ ...current, prize: event.target.value }))}
                required
              />
            </Field>
            <Field label="Costo para participar (creditos)">
              <TextInput
                type="number"
                min="0"
                step="1"
                value={form.entryCost}
                placeholder="0"
                onChange={(event) => setForm((current) => ({ ...current, entryCost: event.target.value }))}
              />
            </Field>
            <Field label="Descripcion">
              <TextArea
                value={form.description}
                rows={4}
                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              />
            </Field>
            <Field label="Imagen">
              <TextInput
                value={form.imageUrl}
                placeholder="https://..."
                onChange={(event) => setForm((current) => ({ ...current, imageUrl: event.target.value }))}
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Estado">
                <SelectInput
                  value={form.status}
                  onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}
                >
                  <option value="active">Activo</option>
                  <option value="draft">Borrador</option>
                  <option value="closed">Cerrado</option>
                  <option value="archived">Archivado</option>
                </SelectInput>
              </Field>
              <Field label="Inicio">
                <TextInput
                  type="datetime-local"
                  value={form.startsAt}
                  onChange={(event) => setForm((current) => ({ ...current, startsAt: event.target.value }))}
                />
              </Field>
            </div>
            <Field label="Fin">
              <TextInput
                type="datetime-local"
                value={form.endsAt}
                onChange={(event) => setForm((current) => ({ ...current, endsAt: event.target.value }))}
              />
            </Field>
          </div>
          <SubmitButton isPending={isPending} selectedId={selectedId} />
        </ModalForm>
      ) : null}
    </div>
  );
}
