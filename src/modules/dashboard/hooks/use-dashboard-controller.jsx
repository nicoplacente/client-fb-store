import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
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
import { uploadImage } from "@/modules/uploads/libs/upload-api";
import {
  createSupportMessage,
  deleteSupportTicket,
  getSupportTickets,
  normalizeTicket,
  updateSupportTicket,
} from "@/modules/support/libs/support-api";
import {
  createStreamChatReward,
  createStreamChest,
  getStreamHours,
  getStreamRewards,
  normalizeStreamHourState,
  normalizeStreamRewardState,
  updateStreamHour,
} from "@/modules/stream/libs/stream-api";
import {
  emptyCreditPackage,
  emptyGiveaway,
  emptyProduct,
} from "../lib/constants";
import {
  creditPackageToForm,
  giveawayToForm,
  productToForm,
} from "../lib/form-mappers";

export default function useDashboardController() {
  const { user, refreshUser } = useAppContext(AuthContext);
  const canManageDashboard = hasDashboardAccess(user);
  const [activeTab, setActiveTab] = useState("products");
  const [products, setProducts] = useState([]);
  const [creditPackages, setCreditPackages] = useState([]);
  const [giveaways, setGiveaways] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [streamHour, setStreamHour] = useState(null);
  const [streamRewards, setStreamRewards] = useState(null);
  const [productForm, setProductForm] = useState(emptyProduct);
  const [creditPackageForm, setCreditPackageForm] = useState(emptyCreditPackage);
  const [giveawayForm, setGiveawayForm] = useState(emptyGiveaway);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [selectedCreditPackageId, setSelectedCreditPackageId] = useState(null);
  const [selectedGiveawayId, setSelectedGiveawayId] = useState(null);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [creditPackageModalOpen, setCreditPackageModalOpen] = useState(false);
  const [giveawayModalOpen, setGiveawayModalOpen] = useState(false);
  const [supportReplies, setSupportReplies] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const knownPurchaseTicketsRef = useRef(new Set());
  const knownSupportTicketsRef = useRef(new Set());
  const dashboardLoadedRef = useRef(false);

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
  const redemptionTickets = useMemo(
    () => normalizedTickets.filter((ticket) => ticket.category === "market"),
    [normalizedTickets]
  );
  const openSupportTickets = useMemo(
    () =>
      normalizedTickets.filter(
        (ticket) => ticket.category !== "market" && ticket.status !== "closed"
      ),
    [normalizedTickets]
  );
  const stats = useMemo(
    () => ({
      products: normalizedProducts.length,
      credits: normalizedCreditPackages.length,
      giveaways: normalizedGiveaways.length,
      tickets: openSupportTickets.length,
      purchases: redemptionTickets.filter((ticket) => ticket.status !== "closed")
        .length,
    }),
    [
      normalizedProducts,
      normalizedCreditPackages,
      normalizedGiveaways,
      openSupportTickets,
      redemptionTickets,
    ]
  );

  function trackDashboardNotifications(ticketData) {
    const purchases = ticketData.filter((ticket) => ticket.category === "market");
    const support = ticketData.filter((ticket) => ticket.category !== "market");

    if (dashboardLoadedRef.current) {
      const newPurchases = purchases.filter(
        (ticket) => !knownPurchaseTicketsRef.current.has(ticket.id)
      );
      const newSupport = support.filter(
        (ticket) => !knownSupportTicketsRef.current.has(ticket.id)
      );

      if (newPurchases.length > 0) {
        toast.info(`${newPurchases.length} compra nueva en dashboard`);
      }

      if (newSupport.length > 0) {
        toast.info(`${newSupport.length} consulta nueva en soporte`);
      }
    }

    knownPurchaseTicketsRef.current = new Set(purchases.map((ticket) => ticket.id));
    knownSupportTicketsRef.current = new Set(support.map((ticket) => ticket.id));
    dashboardLoadedRef.current = true;
  }

  async function loadDashboard({ showLoading = true } = {}) {
    try {
      if (showLoading) setLoading(true);
      setError("");

      const [
        productData,
        creditPackageData,
        giveawayData,
        ticketData,
        streamHourData,
        streamRewardData,
      ] =
        await Promise.all([
          getProducts({ includeDisabled: true }),
          getCreditPackages({ includeDisabled: true }),
          getGiveaways({ includeInactive: true }),
          getSupportTickets({ includeAll: true }),
          getStreamHours().catch(() => null),
          getStreamRewards().catch(() => null),
        ]);

      setProducts(productData);
      setCreditPackages(creditPackageData);
      setGiveaways(giveawayData);
      setTickets(ticketData);
      if (streamHourData) setStreamHour(normalizeStreamHourState(streamHourData));
      if (streamRewardData) {
        setStreamRewards(normalizeStreamRewardState(streamRewardData));
      }
      trackDashboardNotifications(ticketData);
    } catch (err) {
      setError(err.message || "No se pudo cargar el dashboard");
    } finally {
      if (showLoading) setLoading(false);
    }
  }

  useEffect(() => {
    if (user) refreshUser?.();
  }, [refreshUser, user?.id]);

  useEffect(() => {
    if (!canManageDashboard) return;
    loadDashboard();
    const intervalId = window.setInterval(() => {
      loadDashboard({ showLoading: false });
    }, 30000);

    return () => window.clearInterval(intervalId);
  }, [canManageDashboard]);

  function resetProductForm() {
    setSelectedProductId(null);
    setProductForm(emptyProduct);
    setProductModalOpen(false);
  }

  function resetCreditPackageForm() {
    setSelectedCreditPackageId(null);
    setCreditPackageForm(emptyCreditPackage);
    setCreditPackageModalOpen(false);
  }

  function resetGiveawayForm() {
    setSelectedGiveawayId(null);
    setGiveawayForm(emptyGiveaway);
    setGiveawayModalOpen(false);
  }

  function submitProduct(event) {
    event.preventDefault();

    const payloadBase = {
      title: productForm.title.trim(),
      description: productForm.description.trim(),
      price: Number(productForm.price),
      stock: Number(productForm.stock),
      category: productForm.category.trim() || "General",
      status: productForm.status,
      featured: productForm.featured,
    };

    if (!payloadBase.title || Number.isNaN(payloadBase.price)) {
      toast.error("Completa nombre y precio");
      return;
    }

    startTransition(async () => {
      try {
        const imageUrl = productForm.imageFile
          ? await uploadImage(productForm.imageFile)
          : productForm.imageUrl.trim();
        const payload = {
          ...payloadBase,
          imageUrl,
        };

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

    const payloadBase = {
      title: giveawayForm.title.trim(),
      description: giveawayForm.description.trim(),
      prize: giveawayForm.prize.trim(),
      entryCost: Number(giveawayForm.entryCost || 0),
      status: giveawayForm.status,
      startsAt: giveawayForm.startsAt,
      endsAt: giveawayForm.endsAt,
    };

    if (!payloadBase.title || !payloadBase.prize) {
      toast.error("Completa titulo y premio");
      return;
    }

    if (!Number.isFinite(payloadBase.entryCost) || payloadBase.entryCost < 0) {
      toast.error("El costo debe ser 0 o mayor");
      return;
    }

    startTransition(async () => {
      try {
        const imageUrl = giveawayForm.imageFile
          ? await uploadImage(giveawayForm.imageFile)
          : giveawayForm.imageUrl.trim();
        const payload = {
          ...payloadBase,
          imageUrl,
        };

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

  function replyToTicket(ticket) {
    const message = String(supportReplies[ticket.id] || "").trim();

    if (!message) {
      toast.error("Escribi una respuesta");
      return;
    }

    startTransition(async () => {
      try {
        await createSupportMessage(ticket.id, message);
        setSupportReplies((current) => ({ ...current, [ticket.id]: "" }));
        toast.success("Respuesta enviada");
        await loadDashboard();
      } catch (err) {
        toast.error(err.message || "No se pudo responder");
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

  function activateStreamHour(hour, options = {}) {
    startTransition(async () => {
      try {
        const data = await updateStreamHour({
          mode: "manual",
          hour,
          autoDisable: Boolean(options.autoDisable),
        });
        setStreamHour(normalizeStreamHourState(data));
        toast.success("Hora especial activada");
      } catch (err) {
        toast.error(err.message || "No se pudo activar la hora especial");
      }
    });
  }

  function useAutomaticStreamHour() {
    startTransition(async () => {
      try {
        const data = await updateStreamHour({
          mode: "auto",
        });
        setStreamHour(normalizeStreamHourState(data));
        toast.success("Modo automatico activado");
      } catch (err) {
        toast.error(err.message || "No se pudo activar el modo automatico");
      }
    });
  }

  function disableStreamHour() {
    startTransition(async () => {
      try {
        const data = await updateStreamHour({
          mode: "off",
        });
        setStreamHour(normalizeStreamHourState(data));
        toast.success("Horas especiales desactivadas");
      } catch (err) {
        toast.error(err.message || "No se pudo desactivar la hora especial");
      }
    });
  }

  function activateStreamChest() {
    startTransition(async () => {
      try {
        const data = await createStreamChest();
        setStreamRewards(normalizeStreamRewardState(data));
        toast.success(data?.chest ? "Cofre activo" : "Cofre creado");
      } catch (err) {
        toast.error(err.message || "No se pudo activar el cofre");
      }
    });
  }

  function activateStreamChatReward() {
    startTransition(async () => {
      try {
        const data = await createStreamChatReward();
        setStreamRewards(normalizeStreamRewardState(data));
        toast.success(data?.chatReward ? "Recompensa de chat activa" : "Recompensa creada");
      } catch (err) {
        toast.error(err.message || "No se pudo activar la recompensa de chat");
      }
    });
  }

  return {
    user,
    canManageDashboard,
    activeTab,
    setActiveTab,
    stats,
    loading,
    error,
    isPending,
    products: normalizedProducts,
    creditPackages: normalizedCreditPackages,
    giveaways: normalizedGiveaways,
    supportTickets: openSupportTickets,
    redemptionTickets,
    streamHour,
    streamRewards,
    supportReplies,
    setSupportReplies,
    loadDashboard,
    productForm,
    setProductForm,
    selectedProductId,
    productModalOpen,
    createProductForm: () => {
      setSelectedProductId(null);
      setProductForm(emptyProduct);
      setProductModalOpen(true);
    },
    submitProduct,
    resetProductForm,
    editProduct: (product) => {
      setSelectedProductId(product.id);
      setProductForm(productToForm(product));
      setProductModalOpen(true);
    },
    removeProduct,
    creditPackageForm,
    setCreditPackageForm,
    selectedCreditPackageId,
    creditPackageModalOpen,
    createCreditPackageForm: () => {
      setSelectedCreditPackageId(null);
      setCreditPackageForm(emptyCreditPackage);
      setCreditPackageModalOpen(true);
    },
    submitCreditPackage,
    resetCreditPackageForm,
    editCreditPackage: (creditPackage) => {
      setSelectedCreditPackageId(creditPackage.id);
      setCreditPackageForm(creditPackageToForm(creditPackage));
      setCreditPackageModalOpen(true);
    },
    giveawayForm,
    setGiveawayForm,
    selectedGiveawayId,
    giveawayModalOpen,
    createGiveawayForm: () => {
      setSelectedGiveawayId(null);
      setGiveawayForm(emptyGiveaway);
      setGiveawayModalOpen(true);
    },
    submitGiveaway,
    resetGiveawayForm,
    editGiveaway: (giveaway) => {
      setSelectedGiveawayId(giveaway.id);
      setGiveawayForm(giveawayToForm(giveaway));
      setGiveawayModalOpen(true);
    },
    removeGiveaway,
    updateTicketStatus,
    replyToTicket,
    removeTicket,
    activateStreamHour,
    disableStreamHour,
    activateStreamChest,
    activateStreamChatReward,
    useAutomaticStreamHour,
  };
}
