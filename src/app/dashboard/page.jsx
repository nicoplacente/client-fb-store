"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import {
  IconDeviceFloppy,
  IconEdit,
  IconGift,
  IconCoins,
  IconPackage,
  IconPlus,
  IconRefresh,
  IconTicket,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import { toast } from "sonner";
import SectionContainer from "@/modules/ui/section-container";
import useAppContext from "@/context/use-app-context";
import { AuthContext } from "@/context/auth-context/auth-context";
import { hasDashboardAccess } from "@/modules/auth/libs/permissions";
import {
  createProduct,
  deleteProduct,
  getProducts,
  normalizeProduct,
  updateProduct,
} from "@/modules/products/libs/product-api";
import {
  createCreditPackage,
  getCreditPackages,
  normalizeCreditPackage,
  updateCreditPackage,
} from "@/modules/credits/libs/credit-api";
import {
  createGiveaway,
  deleteGiveaway,
  getGiveaways,
  normalizeGiveaway,
  updateGiveaway,
} from "@/modules/giveaways/libs/giveaway-api";
import {
  deleteSupportTicket,
  getSupportTickets,
  normalizeTicket,
  updateSupportTicket,
} from "@/modules/support/libs/support-api";

const tabs = [
  { id: "products", label: "Productos", icon: IconPackage },
  { id: "credits", label: "Creditos", icon: IconCoins },
  { id: "giveaways", label: "Sorteos", icon: IconGift },
  { id: "support", label: "Soporte", icon: IconTicket },
];

const emptyProduct = {
  title: "",
  description: "",
  price: "",
  stock: "",
  category: "",
  imageUrl: "",
  status: "active",
  featured: false,
};

const emptyCreditPackage = {
  name: "",
  description: "",
  credits: "",
  pointsCost: "",
  status: "active",
  sortOrder: "0",
};

const emptyGiveaway = {
  title: "",
  description: "",
  prize: "",
  entryCost: "",
  imageUrl: "",
  status: "active",
  startsAt: "",
  endsAt: "",
};

function formatDateInput(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 16);
}

function productToForm(product) {
  return {
    title: product.title,
    description: product.description,
    price: String(product.price),
    stock: String(product.stock),
    category: product.category,
    imageUrl: product.imageUrl,
    status: product.status,
    featured: product.featured,
  };
}

function creditPackageToForm(creditPackage) {
  return {
    name: creditPackage.name,
    description: creditPackage.description,
    credits: String(creditPackage.credits),
    pointsCost: String(creditPackage.pointsCost),
    status: creditPackage.status,
    sortOrder: String(creditPackage.sortOrder),
  };
}

function giveawayToForm(giveaway) {
  return {
    title: giveaway.title,
    description: giveaway.description,
    prize: giveaway.prize,
    entryCost: String(giveaway.entryCost || 0),
    imageUrl: giveaway.imageUrl,
    status: giveaway.status,
    startsAt: formatDateInput(giveaway.startsAt),
    endsAt: formatDateInput(giveaway.endsAt),
  };
}

function Field({ label, children }) {
  return (
    <label className="grid gap-2 text-sm font-medium text-neutral-300">
      {label}
      {children}
    </label>
  );
}

function TextInput(props) {
  return (
    <input
      {...props}
      className="rounded-md border border-white/10 bg-neutral-900 px-3 py-2 text-white outline-none transition focus:border-red-400"
    />
  );
}

function TextArea(props) {
  return (
    <textarea
      {...props}
      className="resize-none rounded-md border border-white/10 bg-neutral-900 px-3 py-2 text-white outline-none transition focus:border-red-400"
    />
  );
}

function SelectInput(props) {
  return (
    <select
      {...props}
      className="rounded-md border border-white/10 bg-neutral-900 px-3 py-2 text-white outline-none transition focus:border-red-400"
    />
  );
}

export default function DashboardPage() {
  const { user, refreshUser } = useAppContext(AuthContext);
  const canManageDashboard = hasDashboardAccess(user);
  const [activeTab, setActiveTab] = useState("products");
  const [products, setProducts] = useState([]);
  const [creditPackages, setCreditPackages] = useState([]);
  const [giveaways, setGiveaways] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [productForm, setProductForm] = useState(emptyProduct);
  const [creditPackageForm, setCreditPackageForm] = useState(emptyCreditPackage);
  const [giveawayForm, setGiveawayForm] = useState(emptyGiveaway);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [selectedCreditPackageId, setSelectedCreditPackageId] = useState(null);
  const [selectedGiveawayId, setSelectedGiveawayId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const normalizedProducts = useMemo(
    () => products.map(normalizeProduct).filter((product) => product.id),
    [products]
  );

  const normalizedCreditPackages = useMemo(
    () =>
      creditPackages
        .map(normalizeCreditPackage)
        .filter((creditPackage) => creditPackage.id),
    [creditPackages]
  );

  const normalizedGiveaways = useMemo(
    () => giveaways.map(normalizeGiveaway).filter((giveaway) => giveaway.id),
    [giveaways]
  );

  const normalizedTickets = useMemo(
    () => tickets.map(normalizeTicket).filter((ticket) => ticket.id),
    [tickets]
  );

  const stats = useMemo(
    () => ({
      products: normalizedProducts.length,
      credits: normalizedCreditPackages.length,
      giveaways: normalizedGiveaways.length,
      tickets: normalizedTickets.filter((ticket) => ticket.status !== "closed")
        .length,
    }),
    [
      normalizedProducts,
      normalizedCreditPackages,
      normalizedGiveaways,
      normalizedTickets,
    ]
  );

  async function loadDashboard() {
    try {
      setLoading(true);
      setError("");

      const [productData, creditPackageData, giveawayData, ticketData] =
        await Promise.all([
        getProducts({ includeDisabled: true }),
        getCreditPackages({ includeDisabled: true }),
        getGiveaways({ includeInactive: true }),
        getSupportTickets({ includeAll: true }),
      ]);

      setProducts(productData);
      setCreditPackages(creditPackageData);
      setGiveaways(giveawayData);
      setTickets(ticketData);
    } catch (err) {
      setError(err.message || "No se pudo cargar el dashboard");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user) {
      refreshUser?.();
    }
  }, [refreshUser, user?.id]);

  useEffect(() => {
    if (!canManageDashboard) return;
    loadDashboard();
  }, [canManageDashboard]);

  function resetProductForm() {
    setSelectedProductId(null);
    setProductForm(emptyProduct);
  }

  function resetCreditPackageForm() {
    setSelectedCreditPackageId(null);
    setCreditPackageForm(emptyCreditPackage);
  }

  function resetGiveawayForm() {
    setSelectedGiveawayId(null);
    setGiveawayForm(emptyGiveaway);
  }

  function submitProduct(event) {
    event.preventDefault();

    const payload = {
      title: productForm.title.trim(),
      description: productForm.description.trim(),
      price: Number(productForm.price),
      stock: Number(productForm.stock),
      category: productForm.category.trim() || "General",
      imageUrl: productForm.imageUrl.trim(),
      status: productForm.status,
      featured: productForm.featured,
    };

    if (!payload.title || Number.isNaN(payload.price)) {
      toast.error("Completa nombre y precio");
      return;
    }

    startTransition(async () => {
      try {
        if (selectedProductId) {
          await updateProduct(selectedProductId, payload);
          toast.success("Producto actualizado");
        } else {
          await createProduct(payload);
          toast.success("Producto creado");
        }

        resetProductForm();
        await loadDashboard();
      } catch (err) {
        toast.error(err.message || "No se pudo guardar el producto");
      }
    });
  }

  function submitCreditPackage(event) {
    event.preventDefault();

    const payload = {
      name: creditPackageForm.name.trim(),
      description: creditPackageForm.description.trim(),
      credits: Number(creditPackageForm.credits),
      pointsCost: Number(creditPackageForm.pointsCost),
      status: creditPackageForm.status,
      sortOrder: Number(creditPackageForm.sortOrder),
      source: "points",
    };

    if (!payload.name || Number.isNaN(payload.credits) || Number.isNaN(payload.pointsCost)) {
      toast.error("Completa nombre, creditos y costo");
      return;
    }

    startTransition(async () => {
      try {
        if (selectedCreditPackageId) {
          await updateCreditPackage(selectedCreditPackageId, payload);
          toast.success("Pack de creditos actualizado");
        } else {
          await createCreditPackage(payload);
          toast.success("Pack de creditos creado");
        }

        resetCreditPackageForm();
        await loadDashboard();
      } catch (err) {
        toast.error(err.message || "No se pudo guardar el pack");
      }
    });
  }

  function submitGiveaway(event) {
    event.preventDefault();

    const payload = {
      title: giveawayForm.title.trim(),
      description: giveawayForm.description.trim(),
      prize: giveawayForm.prize.trim(),
      entryCost: Number(giveawayForm.entryCost || 0),
      imageUrl: giveawayForm.imageUrl.trim(),
      status: giveawayForm.status,
      startsAt: giveawayForm.startsAt,
      endsAt: giveawayForm.endsAt,
    };

    if (!payload.title || !payload.prize) {
      toast.error("Completa titulo y premio");
      return;
    }

    if (!Number.isFinite(payload.entryCost) || payload.entryCost < 0) {
      toast.error("El costo debe ser 0 o mayor");
      return;
    }

    startTransition(async () => {
      try {
        if (selectedGiveawayId) {
          await updateGiveaway(selectedGiveawayId, payload);
          toast.success("Sorteo actualizado");
        } else {
          await createGiveaway(payload);
          toast.success("Sorteo creado");
        }

        resetGiveawayForm();
        await loadDashboard();
      } catch (err) {
        toast.error(err.message || "No se pudo guardar el sorteo");
      }
    });
  }

  function removeProduct(product) {
    if (!window.confirm(`Eliminar "${product.title}"?`)) return;

    startTransition(async () => {
      try {
        await deleteProduct(product.id);
        toast.success("Producto eliminado");
        if (selectedProductId === product.id) resetProductForm();
        await loadDashboard();
      } catch (err) {
        toast.error(err.message || "No se pudo eliminar el producto");
      }
    });
  }

  function removeGiveaway(giveaway) {
    if (!window.confirm(`Eliminar "${giveaway.title}"?`)) return;

    startTransition(async () => {
      try {
        await deleteGiveaway(giveaway.id);
        toast.success("Sorteo eliminado");
        if (selectedGiveawayId === giveaway.id) resetGiveawayForm();
        await loadDashboard();
      } catch (err) {
        toast.error(err.message || "No se pudo eliminar el sorteo");
      }
    });
  }

  function updateTicketStatus(ticket, status) {
    startTransition(async () => {
      try {
        await updateSupportTicket(ticket.id, {
          subject: ticket.subject,
          category: ticket.category,
          message: ticket.message,
          status,
        });
        toast.success("Ticket actualizado");
        await loadDashboard();
      } catch (err) {
        toast.error(err.message || "No se pudo actualizar el ticket");
      }
    });
  }

  function removeTicket(ticket) {
    if (!window.confirm(`Eliminar ticket "${ticket.subject}"?`)) return;

    startTransition(async () => {
      try {
        await deleteSupportTicket(ticket.id);
        toast.success("Ticket eliminado");
        await loadDashboard();
      } catch (err) {
        toast.error(err.message || "No se pudo eliminar el ticket");
      }
    });
  }

  if (!user) {
    return (
      <SectionContainer className="space-y-6">
        <div className="mx-auto max-w-2xl rounded-lg border border-white/10 bg-neutral-950/80 p-8 text-center">
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="mt-3 text-neutral-400">
            Inicia sesion para administrar la tienda.
          </p>
        </div>
      </SectionContainer>
    );
  }

  if (!canManageDashboard) {
    return (
      <SectionContainer className="space-y-6">
        <div className="mx-auto max-w-2xl rounded-lg border border-white/10 bg-neutral-950/80 p-8 text-center">
          <p className="text-sm font-semibold uppercase text-red-300/80">
            Acceso restringido
          </p>
          <h1 className="mt-2 text-3xl font-bold text-white">Dashboard</h1>
          <p className="mt-3 text-neutral-400">
            Solo mods, admins y el streamer principal pueden administrar.
          </p>
        </div>
      </SectionContainer>
    );
  }

  return (
    <SectionContainer className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase text-red-300/80">
            Administracion
          </p>
          <h1 className="mt-2 text-4xl font-bold text-white">Dashboard</h1>
          <p className="mt-3 max-w-2xl text-neutral-400">
            Gestiona productos, sorteos y tickets desde el mismo panel.
          </p>
        </div>
        <button
          onClick={loadDashboard}
          disabled={loading || isPending}
          className="inline-flex w-fit items-center gap-2 rounded-md border border-white/10 bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:border-red-400/50 hover:text-red-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <IconRefresh size={18} />
          Actualizar
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Stat label="Productos" value={stats.products} />
        <Stat label="Packs de creditos" value={stats.credits} />
        <Stat label="Sorteos" value={stats.giveaways} />
        <Stat label="Tickets abiertos" value={stats.tickets} />
      </div>

      <div className="flex flex-wrap gap-2 border-b border-white/10">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition ${
                active
                  ? "border-red-400 text-white"
                  : "border-transparent text-neutral-500 hover:text-neutral-200"
              }`}
            >
              <Icon size={18} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {error ? (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-6 text-center text-red-200">
          {error}
        </div>
      ) : null}

      {activeTab === "products" ? (
        <ProductsPanel
          form={productForm}
          setForm={setProductForm}
          items={normalizedProducts}
          loading={loading}
          isPending={isPending}
          selectedId={selectedProductId}
          onSubmit={submitProduct}
          onCancel={resetProductForm}
          onEdit={(product) => {
            setSelectedProductId(product.id);
            setProductForm(productToForm(product));
          }}
          onDelete={removeProduct}
        />
      ) : null}

      {activeTab === "credits" ? (
        <CreditPackagesPanel
          form={creditPackageForm}
          setForm={setCreditPackageForm}
          items={normalizedCreditPackages}
          loading={loading}
          isPending={isPending}
          selectedId={selectedCreditPackageId}
          onSubmit={submitCreditPackage}
          onCancel={resetCreditPackageForm}
          onEdit={(creditPackage) => {
            setSelectedCreditPackageId(creditPackage.id);
            setCreditPackageForm(creditPackageToForm(creditPackage));
          }}
        />
      ) : null}

      {activeTab === "giveaways" ? (
        <GiveawaysPanel
          form={giveawayForm}
          setForm={setGiveawayForm}
          items={normalizedGiveaways}
          loading={loading}
          isPending={isPending}
          selectedId={selectedGiveawayId}
          onSubmit={submitGiveaway}
          onCancel={resetGiveawayForm}
          onEdit={(giveaway) => {
            setSelectedGiveawayId(giveaway.id);
            setGiveawayForm(giveawayToForm(giveaway));
          }}
          onDelete={removeGiveaway}
        />
      ) : null}

      {activeTab === "support" ? (
        <SupportPanel
          tickets={normalizedTickets}
          loading={loading}
          isPending={isPending}
          onStatusChange={updateTicketStatus}
          onDelete={removeTicket}
        />
      ) : null}
    </SectionContainer>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-lg border border-white/10 bg-neutral-950/70 p-5">
      <p className="text-sm text-neutral-500">{label}</p>
      <strong className="mt-2 block text-3xl text-white">{value}</strong>
    </div>
  );
}

function ProductsPanel({
  form,
  setForm,
  items,
  loading,
  isPending,
  selectedId,
  onSubmit,
  onCancel,
  onEdit,
  onDelete,
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
      <form
        onSubmit={onSubmit}
        className="h-fit rounded-lg border border-white/10 bg-neutral-950/80 p-5"
      >
        <PanelHeader
          title={selectedId ? "Editar producto" : "Nuevo producto"}
          subtitle="Market y carousel"
          canCancel={Boolean(selectedId)}
          onCancel={onCancel}
        />

        <div className="grid gap-4">
          <Field label="Nombre">
            <TextInput
              value={form.title}
              onChange={(event) =>
                setForm((current) => ({ ...current, title: event.target.value }))
              }
              required
            />
          </Field>
          <Field label="Descripcion">
            <TextArea
              value={form.description}
              rows={4}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Precio">
              <TextInput
                type="number"
                min="0"
                value={form.price}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    price: event.target.value,
                  }))
                }
                required
              />
            </Field>
            <Field label="Stock">
              <TextInput
                type="number"
                min="0"
                value={form.stock}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    stock: event.target.value,
                  }))
                }
                required
              />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Categoria">
              <TextInput
                value={form.category}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    category: event.target.value,
                  }))
                }
              />
            </Field>
            <Field label="Estado">
              <SelectInput
                value={form.status}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    status: event.target.value,
                  }))
                }
              >
                <option value="active">Activo</option>
                <option value="draft">Borrador</option>
                <option value="archived">Archivado</option>
              </SelectInput>
            </Field>
          </div>
          <Field label="Imagen">
            <TextInput
              value={form.imageUrl}
              placeholder="https://..."
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  imageUrl: event.target.value,
                }))
              }
            />
          </Field>
          <label className="flex items-center gap-3 text-sm font-medium text-neutral-300">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  featured: event.target.checked,
                }))
              }
              className="size-4 accent-red-500"
            />
            Mostrar como destacado
          </label>
        </div>

        <SubmitButton isPending={isPending} selectedId={selectedId} />
      </form>

      <ItemsGrid
        loading={loading}
        emptyText="Todavia no hay productos."
        items={items}
        renderItem={(product) => (
          <AdminCard
            key={product.id}
            title={product.title}
            meta={`${product.price.toLocaleString()} creditos`}
            detail={`${product.stock} disponibles - ${product.status}`}
            imageUrl={product.imageUrl}
            icon={<IconPackage size={42} />}
            onEdit={() => onEdit(product)}
            onDelete={() => onDelete(product)}
          />
        )}
      />
    </div>
  );
}

function CreditPackagesPanel({
  form,
  setForm,
  items,
  loading,
  isPending,
  selectedId,
  onSubmit,
  onCancel,
  onEdit,
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
      <form
        onSubmit={onSubmit}
        className="h-fit rounded-lg border border-white/10 bg-neutral-950/80 p-5"
      >
        <PanelHeader
          title={selectedId ? "Editar pack" : "Nuevo pack"}
          subtitle="Creditos comprados con puntos"
          canCancel={Boolean(selectedId)}
          onCancel={onCancel}
        />

        <div className="grid gap-4">
          <Field label="Nombre">
            <TextInput
              value={form.name}
              onChange={(event) =>
                setForm((current) => ({ ...current, name: event.target.value }))
              }
              required
            />
          </Field>
          <Field label="Descripcion">
            <TextArea
              value={form.description}
              rows={4}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Creditos que recibe">
              <TextInput
                type="number"
                min="1"
                value={form.credits}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    credits: event.target.value,
                  }))
                }
                required
              />
            </Field>
            <Field label="Costo en puntos">
              <TextInput
                type="number"
                min="1"
                step="0.01"
                value={form.pointsCost}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    pointsCost: event.target.value,
                  }))
                }
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
                  setForm((current) => ({
                    ...current,
                    sortOrder: event.target.value,
                  }))
                }
              />
            </Field>
            <Field label="Estado">
              <SelectInput
                value={form.status}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    status: event.target.value,
                  }))
                }
              >
                <option value="active">Activo</option>
                <option value="draft">Borrador</option>
                <option value="archived">Archivado</option>
              </SelectInput>
            </Field>
          </div>
        </div>

        <SubmitButton isPending={isPending} selectedId={selectedId} />
      </form>

      <ItemsGrid
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
    </div>
  );
}

function GiveawaysPanel({
  form,
  setForm,
  items,
  loading,
  isPending,
  selectedId,
  onSubmit,
  onCancel,
  onEdit,
  onDelete,
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
      <form
        onSubmit={onSubmit}
        className="h-fit rounded-lg border border-white/10 bg-neutral-950/80 p-5"
      >
        <PanelHeader
          title={selectedId ? "Editar sorteo" : "Nuevo sorteo"}
          subtitle="Premios y participacion"
          canCancel={Boolean(selectedId)}
          onCancel={onCancel}
        />

        <div className="grid gap-4">
          <Field label="Titulo">
            <TextInput
              value={form.title}
              onChange={(event) =>
                setForm((current) => ({ ...current, title: event.target.value }))
              }
              required
            />
          </Field>
          <Field label="Premio">
            <TextInput
              value={form.prize}
              onChange={(event) =>
                setForm((current) => ({ ...current, prize: event.target.value }))
              }
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
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  entryCost: event.target.value,
                }))
              }
            />
          </Field>
          <Field label="Descripcion">
            <TextArea
              value={form.description}
              rows={4}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
            />
          </Field>
          <Field label="Imagen">
            <TextInput
              value={form.imageUrl}
              placeholder="https://..."
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  imageUrl: event.target.value,
                }))
              }
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Estado">
              <SelectInput
                value={form.status}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    status: event.target.value,
                  }))
                }
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
                  setForm((current) => ({
                    ...current,
                    startsAt: event.target.value,
                  }))
                }
              />
            </Field>
          </div>
          <Field label="Fin">
            <TextInput
              type="datetime-local"
              value={form.endsAt}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  endsAt: event.target.value,
                }))
              }
            />
          </Field>
        </div>

        <SubmitButton isPending={isPending} selectedId={selectedId} />
      </form>

      <ItemsGrid
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
    </div>
  );
}

function SupportPanel({ tickets, loading, isPending, onStatusChange, onDelete }) {
  return (
    <div className="rounded-lg border border-white/10 bg-neutral-950/70 p-5">
      {loading ? (
        <p className="rounded-lg border border-white/10 bg-neutral-900/60 p-8 text-center text-neutral-400">
          Cargando tickets...
        </p>
      ) : tickets.length === 0 ? (
        <p className="rounded-lg border border-white/10 bg-neutral-900/60 p-8 text-center text-neutral-400">
          No hay tickets para mostrar.
        </p>
      ) : (
        <div className="grid gap-3">
          {tickets.map((ticket) => (
            <article
              key={ticket.id}
              className="grid gap-4 rounded-lg border border-white/10 bg-neutral-900/60 p-4 lg:grid-cols-[1fr_220px_auto]"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold text-white">{ticket.subject}</h3>
                  <span className="rounded-md bg-white/5 px-2 py-1 text-xs text-neutral-400">
                    {ticket.category}
                  </span>
                  <span className="text-xs text-neutral-500">
                    {ticket.username}
                  </span>
                </div>
                <p className="mt-2 text-sm text-neutral-400">{ticket.message}</p>
              </div>
              <SelectInput
                value={ticket.status}
                disabled={isPending}
                onChange={(event) => onStatusChange(ticket, event.target.value)}
              >
                <option value="open">Abierto</option>
                <option value="in_progress">En proceso</option>
                <option value="closed">Cerrado</option>
              </SelectInput>
              <button
                onClick={() => onDelete(ticket)}
                disabled={isPending}
                className="inline-flex size-10 items-center justify-center rounded-md border border-red-500/30 bg-red-500/10 text-red-200 transition hover:bg-red-500/20 disabled:opacity-50"
                aria-label={`Eliminar ticket ${ticket.subject}`}
              >
                <IconTrash size={17} />
              </button>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function PanelHeader({ title, subtitle, canCancel, onCancel }) {
  return (
    <div className="mb-5 flex items-center justify-between gap-3">
      <div>
        <h2 className="text-xl font-semibold text-white">{title}</h2>
        <p className="text-sm text-neutral-500">{subtitle}</p>
      </div>
      {canCancel ? (
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-white/10 p-2 text-neutral-400 transition hover:text-white"
          aria-label="Cancelar edicion"
        >
          <IconX size={18} />
        </button>
      ) : null}
    </div>
  );
}

function SubmitButton({ isPending, selectedId }) {
  return (
    <button
      type="submit"
      disabled={isPending}
      className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md bg-red-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {selectedId ? <IconDeviceFloppy size={18} /> : <IconPlus size={18} />}
      {selectedId ? "Guardar cambios" : "Crear"}
    </button>
  );
}

function ItemsGrid({ loading, emptyText, items, renderItem }) {
  return (
    <div className="rounded-lg border border-white/10 bg-neutral-950/70 p-5">
      {loading ? (
        <div className="rounded-lg border border-white/10 bg-neutral-900/60 p-8 text-center text-neutral-400">
          Cargando...
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-lg border border-white/10 bg-neutral-900/60 p-8 text-center text-neutral-400">
          {emptyText}
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">{items.map(renderItem)}</div>
      )}
    </div>
  );
}

function AdminCard({ title, meta, detail, imageUrl, icon, onEdit, onDelete }) {
  return (
    <article className="overflow-hidden rounded-lg border border-white/10 bg-neutral-900/60">
      <div className="aspect-[4/3] bg-neutral-900">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="h-full w-full object-cover"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-neutral-600">
            {icon}
          </div>
        )}
      </div>
      <div className="space-y-3 p-4">
        <div>
          <h3 className="font-semibold text-white">{title}</h3>
          <p className="mt-1 text-sm text-neutral-400">{meta}</p>
          <p className="mt-1 text-xs text-neutral-500">{detail}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-md border border-white/10 bg-neutral-950 px-3 py-2 text-sm font-semibold text-white transition hover:border-red-400/50"
          >
            <IconEdit size={17} />
            Editar
          </button>
          {onDelete ? (
            <button
              onClick={onDelete}
              className="inline-flex items-center justify-center rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-red-200 transition hover:bg-red-500/20"
              aria-label={`Eliminar ${title}`}
            >
              <IconTrash size={17} />
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}
