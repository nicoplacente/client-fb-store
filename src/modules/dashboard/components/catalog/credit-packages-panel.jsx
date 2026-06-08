import { IconCoins } from "@tabler/icons-react";
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

export default function CreditPackagesPanel({
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
            onDelete={() => onDelete(creditPackage)}
          />
        )}
      />

      {isFormOpen ? (
        <ModalForm onCancel={onCancel} onSubmit={onSubmit}>
          <PanelHeader
            title={selectedId ? "Editar pack" : "Nuevo pack"}
            subtitle="Creditos comprados con puntos"
            canCancel
            onCancel={onCancel}
          />
          <CreditPackageFormFields form={form} setForm={setForm} />
          <SubmitButton isPending={isPending} selectedId={selectedId} />
        </ModalForm>
      ) : null}
    </div>
  );
}

function CreditPackageFormFields({ form, setForm }) {
  return (
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
          onChange={(event) =>
            setForm((current) => ({ ...current, description: event.target.value }))
          }
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Creditos que recibe">
          <FormattedNumberInput
            min="1"
            value={form.credits}
            onValueChange={(credits) => setForm((current) => ({ ...current, credits }))}
            required
          />
        </Field>
        <Field label="Costo en puntos">
          <FormattedNumberInput
            min="1"
            value={form.pointsCost}
            onValueChange={(pointsCost) =>
              setForm((current) => ({ ...current, pointsCost }))
            }
            allowDecimals
            required
          />
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Orden">
          <TextInput
            type="number"
            value={form.sortOrder}
            onChange={(event) =>
              setForm((current) => ({ ...current, sortOrder: event.target.value }))
            }
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
  );
}
