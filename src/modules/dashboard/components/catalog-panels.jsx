import { useEffect, useRef, useState } from "react";
import {
  IconCoins,
  IconGift,
  IconLink,
  IconPackage,
  IconPhotoUp,
  IconPlus,
  IconSparkles,
  IconX,
} from "@tabler/icons-react";
import AdminCard from "./admin-card";
import { Field, PanelHeader, SelectInput, SubmitButton, TextArea, TextInput } from "./form-controls";
import ItemGrid from "./item-grid";
import { formatProductStatus } from "../lib/formatters";

function CreateButton({ children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-black text-white shadow-lg shadow-red-950/25 transition hover:-translate-y-0.5 hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-300/50 sm:w-fit"
    >
      <IconPlus size={18} />
      {children}
    </button>
  );
}

function PanelTitle({ title, subtitle, action }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-neutral-950/75 p-4 shadow-xl shadow-black/20 ring-1 ring-white/[0.03] sm:flex sm:items-center sm:justify-between sm:gap-4 sm:p-5">
      <div>
        <h2 className="text-xl font-bold text-white">{title}</h2>
        <p className="mt-1 text-sm text-neutral-500">{subtitle}</p>
      </div>
      <div className="mt-4 sm:mt-0">{action}</div>
    </div>
  );
}

function ModalForm({ children, onSubmit }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 p-2 backdrop-blur-md sm:items-center sm:p-4">
      <form
        onSubmit={onSubmit}
        role="dialog"
        aria-modal="true"
        className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-neutral-950 p-4 shadow-2xl shadow-black ring-1 ring-white/[0.03] sm:max-h-[90vh] sm:p-5"
      >
        {children}
      </form>
    </div>
  );
}

function ImageInput({ file, imageUrl, onFileChange, onUrlChange, onClearFile }) {
  const inputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(imageUrl);
  const fileName = file?.name || "";
  const hasPreview = Boolean(previewUrl);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(imageUrl);
      return undefined;
    }

    const objectUrl = URL.createObjectURL(file);

    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [file, imageUrl]);

  function openFileSelector() {
    inputRef.current?.click();
  }

  function handleFileChange(event) {
    onFileChange(event.target.files?.[0] || null);
  }

  function handleDrop(event) {
    event.preventDefault();
    onFileChange(event.dataTransfer.files?.[0] || null);
  }

  function handleDragOver(event) {
    event.preventDefault();
  }

  function clearFile() {
    if (inputRef.current) {
      inputRef.current.value = "";
    }

    onClearFile();
  }

  return (
    <div className="grid gap-4 rounded-2xl border border-white/10 bg-neutral-950/70 p-4 shadow-inner shadow-black/10">
      <div>
        <div>
          <h3 className="text-base font-bold text-white">Agregar imagen</h3>
          <p className="mt-1 text-sm text-neutral-500">
            Sube una imagen limpia. Se usara como thumbnail principal.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={openFileSelector}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="grid min-h-44 cursor-pointer place-items-center rounded-2xl border border-dashed border-white/15 bg-neutral-900/60 px-4 py-8 text-center transition hover:border-red-300/45 hover:bg-red-500/5 focus:outline-none focus:ring-2 focus:ring-red-300/35"
      >
        <span className="grid justify-items-center gap-3">
          <IconPhotoUp size={44} className="text-neutral-600" />
          <span className="text-sm font-black text-white">Arrastra o selecciona una imagen</span>
          <span className="text-xs font-medium text-neutral-500">
            PNG, JPG, WEBP, GIF o AVIF hasta 5MB.
          </span>
        </span>
      </button>

      <input
        ref={inputRef}
        key={fileName || "empty"}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
        className="sr-only"
        onChange={handleFileChange}
      />

      <div className="grid gap-2">
        <Field label="O subir link de imagen">
          <div className="relative">
            <IconLink
              size={17}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
            />
            <TextInput
              value={imageUrl}
              placeholder="https://..."
              onChange={onUrlChange}
              className="w-full pl-9"
            />
          </div>
        </Field>
      </div>

      {hasPreview ? (
        <div className="flex flex-wrap gap-3">
          <div className="group relative h-28 w-28 overflow-hidden rounded-2xl border border-white/10 bg-neutral-900 shadow-lg shadow-black/20">
            <img
              src={previewUrl}
              alt="Preview de imagen"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-3 py-2">
              <span className="block truncate text-xs font-black text-white">
                {file ? "Archivo" : "Link"}
              </span>
            </div>
            {file ? (
              <button
                type="button"
                onClick={clearFile}
                className="absolute right-2 top-2 grid size-8 cursor-pointer place-items-center rounded-full bg-black/70 text-white opacity-100 transition hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300/45 sm:opacity-0 sm:group-hover:opacity-100"
                aria-label="Quitar archivo"
              >
                <IconX size={16} />
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function FeaturedToggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      aria-pressed={checked}
      className={`flex w-full cursor-pointer items-center justify-between gap-4 rounded-2xl border p-4 text-left transition focus:outline-none focus:ring-2 focus:ring-red-300/40 ${
        checked
          ? "border-red-300/40 bg-red-500/12 shadow-lg shadow-red-950/15"
          : "border-white/10 bg-neutral-950/70 hover:border-red-300/25 hover:bg-white/[0.03]"
      }`}
    >
      <span className="flex min-w-0 items-center gap-3">
        <span
          className={`grid size-10 shrink-0 place-items-center rounded-xl border transition ${
            checked
              ? "border-red-300/45 bg-red-500/20 text-red-100"
              : "border-white/10 bg-neutral-900 text-neutral-500"
          }`}
        >
          <IconSparkles size={19} />
        </span>
        <span>
          <span className="block text-sm font-black text-white">Mostrar como destacado</span>
          <span className="mt-0.5 block text-xs font-medium text-neutral-500">
            Se mostrara con prioridad en el market.
          </span>
        </span>
      </span>
      <span
        className={`relative h-7 w-12 shrink-0 rounded-full border transition ${
          checked
            ? "border-red-300/45 bg-red-500"
            : "border-white/10 bg-neutral-800"
        }`}
      >
        <span
          className={`absolute top-1 size-5 rounded-full bg-white shadow-sm transition ${
            checked ? "left-6" : "left-1"
          }`}
        />
      </span>
    </button>
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
        subtitle="Administra packs, costos en puntos y estado de venta."
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
        subtitle="Organiza premios, fechas, costos y resultados."
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
