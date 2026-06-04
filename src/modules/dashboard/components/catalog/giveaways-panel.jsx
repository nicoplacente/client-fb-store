import { IconGift } from "@tabler/icons-react";
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
import ImageInput from "./image-input";

export default function GiveawaysPanel({
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
        subtitle="Organiza fechas, costos y resultados."
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
            meta={giveaway.entryCost > 0 ? `${giveaway.entryCost.toLocaleString()} creditos` : "Gratis"}
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
            subtitle="Participacion y fechas"
            canCancel
            onCancel={onCancel}
          />
          <GiveawayFormFields form={form} setForm={setForm} />
          <SubmitButton isPending={isPending} selectedId={selectedId} />
        </ModalForm>
      ) : null}
    </div>
  );
}

function GiveawayFormFields({ form, setForm }) {
  return (
    <div className="grid gap-4">
      <Field label="Titulo">
        <TextInput
          value={form.title}
          onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
          required
        />
      </Field>
      <Field label="Costo para participar (creditos)">
        <FormattedNumberInput
          min="0"
          value={form.entryCost}
          placeholder="0"
          onValueChange={(entryCost) => setForm((current) => ({ ...current, entryCost }))}
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
            onChange={(event) =>
              setForm((current) => ({ ...current, startsAt: event.target.value }))
            }
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
  );
}
