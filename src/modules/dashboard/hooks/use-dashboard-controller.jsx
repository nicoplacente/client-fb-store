import { useEffect, useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import useAppContext from "@/context/use-app-context";
import { AuthContext } from "@/context/auth-context/auth-context";
import { hasDashboardAccess } from "@/modules/auth/libs/permissions";
import {
  createProduct,
  deleteProduct,
  normalizeProduct,
  updateProduct,
} from "@/modules/products/libs/product-api";
import {
  createCreditPackage,
  deleteCreditPackage,
  normalizeCreditPackage,
  updateCreditPackage,
} from "@/modules/credits/libs/credit-api";
import {
  createGiveaway,
  deleteGiveaway,
  normalizeGiveaway,
  updateGiveaway,
} from "@/modules/giveaways/libs/giveaway-api";
import { uploadImage } from "@/modules/uploads/libs/upload-api";
import {
  createSupportMessage,
  deleteSupportTicket,
  normalizeTicket,
  updateSupportTicket,
} from "@/modules/support/libs/support-api";
import {
  createStreamChatReward,
  createStreamChest,
  normalizeStreamHourState,
  normalizeStreamRewardState,
  resetRankingPoints,
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
import { loadDashboardData } from "../lib/dashboard-loader";
import {
  buildCreditPackagePayload,
  buildGiveawayPayload,
  buildProductPayload,
} from "../lib/dashboard-payloads";
import useDashboardNotifications from "./use-dashboard-notifications";

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
  const [liveStatus, setLiveStatus] = useState(null);
  const [productForm, setProductForm] = useState(emptyProduct);
  const [creditPackageForm, setCreditPackageForm] =
    useState(emptyCreditPackage);
  const [giveawayForm, setGiveawayForm] = useState(emptyGiveaway);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [selectedCreditPackageId, setSelectedCreditPackageId] = useState(null);
  const [selectedGiveawayId, setSelectedGiveawayId] = useState(null);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [creditPackageModalOpen, setCreditPackageModalOpen] = useState(false);
  const [giveawayModalOpen, setGiveawayModalOpen] = useState(false);
  const [supportReplies, setSupportReplies] = useState({});
  const [confirmation, setConfirmation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const trackDashboardNotifications = useDashboardNotifications();

  const normalizedProducts = useMemo(
    () => products.map(normalizeProduct).filter((product) => product.id),
    [products],
  );
  const normalizedCreditPackages = useMemo(
    () =>
      creditPackages
        .map(normalizeCreditPackage)
        .filter((creditPackage) => creditPackage.id),
    [creditPackages],
  );
  const normalizedGiveaways = useMemo(
    () => giveaways.map(normalizeGiveaway).filter((giveaway) => giveaway.id),
    [giveaways],
  );
  const normalizedTickets = useMemo(
    () => tickets.map(normalizeTicket).filter((ticket) => ticket.id),
    [tickets],
  );
  const redemptionTickets = useMemo(
    () => normalizedTickets.filter((ticket) => ticket.category === "market"),
    [normalizedTickets],
  );
  const openSupportTickets = useMemo(
    () =>
      normalizedTickets.filter(
        (ticket) => ticket.category !== "market" && ticket.status !== "closed",
      ),
    [normalizedTickets],
  );
  const stats = useMemo(
    () => ({
      products: normalizedProducts.length,
      credits: normalizedCreditPackages.length,
      giveaways: normalizedGiveaways.length,
      tickets: openSupportTickets.length,
      purchases: redemptionTickets.filter(
        (ticket) => ticket.status !== "closed",
      ).length,
    }),
    [
      normalizedProducts,
      normalizedCreditPackages,
      normalizedGiveaways,
      openSupportTickets,
      redemptionTickets,
    ],
  );

  async function loadDashboard({ showLoading = true } = {}) {
    try {
      if (showLoading) setLoading(true);
      setError("");
      const data = await loadDashboardData();

      setProducts(data.productData);
      setCreditPackages(data.creditPackageData);
      setGiveaways(data.giveawayData);
      setTickets(data.ticketData);
      if (data.streamHour) setStreamHour(data.streamHour);
      if (data.streamRewards) setStreamRewards(data.streamRewards);
      if (data.liveStatus) setLiveStatus(data.liveStatus);
      trackDashboardNotifications(data.ticketData);
    } catch {
      setError("No se pudo cargar el dashboard");
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

  function submitProduct(event, formSnapshot = productForm) {
    event.preventDefault();

    const payloadBase = buildProductPayload(formSnapshot);

    if (!payloadBase.title || Number.isNaN(payloadBase.price)) {
      toast.error("Completa nombre y precio");
      return;
    }

    startTransition(async () => {
      try {
        const imageUrl = formSnapshot.imageFile
          ? await uploadImage(formSnapshot.imageFile)
          : formSnapshot.imageUrl.trim();
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
      } catch {
        toast.error("No se pudo guardar el producto");
      }
    });
  }

  function submitCreditPackage(event) {
    event.preventDefault();

    const payload = buildCreditPackagePayload(creditPackageForm);

    if (
      !payload.name ||
      Number.isNaN(payload.credits) ||
      Number.isNaN(payload.pointsCost)
    ) {
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
      } catch {
        toast.error("No se pudo guardar el pack");
      }
    });
  }

  function submitGiveaway(event, formSnapshot = giveawayForm) {
    event.preventDefault();

    const payloadBase = buildGiveawayPayload(formSnapshot);

    if (!payloadBase.title) {
      toast.error("Completa titulo");
      return;
    }

    if (!Number.isFinite(payloadBase.entryCost) || payloadBase.entryCost < 0) {
      toast.error("El costo debe ser 0 o mayor");
      return;
    }

    startTransition(async () => {
      try {
        const imageUrl = formSnapshot.imageFile
          ? await uploadImage(formSnapshot.imageFile)
          : formSnapshot.imageUrl.trim();
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
      } catch {
        toast.error("No se pudo guardar el sorteo");
      }
    });
  }

  function deleteProductById(product) {
    startTransition(async () => {
      try {
        await deleteProduct(product.id);
        toast.success("Producto eliminado");
        if (selectedProductId === product.id) resetProductForm();
        await loadDashboard();
      } catch {
        toast.error("No se pudo eliminar el producto");
      }
    });
  }

  function deleteCreditPackageById(creditPackage) {
    startTransition(async () => {
      try {
        await deleteCreditPackage(creditPackage.id);
        toast.success("Pack de creditos eliminado");
        if (selectedCreditPackageId === creditPackage.id) resetCreditPackageForm();
        await loadDashboard();
      } catch {
        toast.error("No se pudo eliminar el pack");
      }
    });
  }

  function removeProduct(product) {
    setConfirmation({
      type: "delete-product",
      title: "Eliminar producto",
      description: `Vas a eliminar "${product.title}" del catalogo.`,
      confirmLabel: "Eliminar producto",
      cancelLabel: "Conservar producto",
      details: [
        "El producto dejara de estar disponible para nuevos canjes.",
        "Esta accion puede afectar la gestion del market.",
      ],
      target: product,
    });
  }

  function removeCreditPackage(creditPackage) {
    setConfirmation({
      type: "delete-credit-package",
      title: "Eliminar pack de creditos",
      description: `Vas a eliminar "${creditPackage.name}" del listado de packs.`,
      confirmLabel: "Eliminar pack",
      cancelLabel: "Conservar pack",
      details: [
        "El pack dejara de estar disponible para nuevas compras.",
        "Tambien se eliminara el historial de compras asociado a este pack.",
      ],
      target: creditPackage,
    });
  }

  function deleteGiveawayById(giveaway) {
    startTransition(async () => {
      try {
        await deleteGiveaway(giveaway.id);
        toast.success("Sorteo eliminado");
        if (selectedGiveawayId === giveaway.id) resetGiveawayForm();
        await loadDashboard();
      } catch {
        toast.error("No se pudo eliminar el sorteo");
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
      } catch {
        toast.error("No se pudo actualizar el ticket");
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
      } catch {
        toast.error("No se pudo responder");
      }
    });
  }

  function deleteTicketById(ticket) {
    startTransition(async () => {
      try {
        await deleteSupportTicket(ticket.id);
        toast.success("Ticket eliminado");
        await loadDashboard();
      } catch {
        toast.error("No se pudo eliminar el ticket");
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
      } catch {
        toast.error("No se pudo activar la hora especial");
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
      } catch {
        toast.error("No se pudo activar el modo automatico");
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
      } catch {
        toast.error("No se pudo desactivar la hora especial");
      }
    });
  }

  function activateStreamChest() {
    startTransition(async () => {
      try {
        const data = await createStreamChest();
        setStreamRewards(normalizeStreamRewardState(data));
        toast.success(data?.chest ? "Cofre activo" : "Cofre creado");
      } catch {
        toast.error("No se pudo activar el cofre");
      }
    });
  }

  function activateStreamChatReward() {
    startTransition(async () => {
      try {
        const data = await createStreamChatReward();
        setStreamRewards(normalizeStreamRewardState(data));
        toast.success(
          data?.chatReward ? "Recompensa de chat activa" : "Recompensa creada",
        );
      } catch {
        toast.error("No se pudo activar la recompensa de chat");
      }
    });
  }

  function removeTicket(ticket) {
    setConfirmation({
      type: "delete-ticket",
      title: "Eliminar ticket",
      description: `Vas a eliminar el ticket "${ticket.subject}".`,
      confirmLabel: "Eliminar ticket",
      cancelLabel: "Conservar ticket",
      details: [
        "Se eliminara el historial visible de esta consulta.",
        "Esta accion no cambia canjes ni productos relacionados.",
      ],
      target: ticket,
    });
  }

  function cancelConfirmation() {
    setConfirmation(null);
  }

  function confirmDashboardAction() {
    const current = confirmation;
    if (!current) return;

    setConfirmation(null);

    if (current.type === "delete-product") {
      deleteProductById(current.target);
      return;
    }

    if (current.type === "delete-credit-package") {
      deleteCreditPackageById(current.target);
      return;
    }

    if (current.type === "delete-giveaway") {
      deleteGiveawayById(current.target);
      return;
    }

    if (current.type === "delete-ticket") {
      deleteTicketById(current.target);
    }
  }

  function removeGiveaway(giveaway) {
    setConfirmation({
      type: "delete-giveaway",
      title: "Eliminar sorteo",
      description: `Vas a eliminar "${giveaway.title}" del listado de sorteos.`,
      confirmLabel: "Eliminar sorteo",
      cancelLabel: "Conservar sorteo",
      details: [
        "El sorteo dejara de estar disponible para la comunidad.",
        "Revisa que no haya participantes o premios pendientes antes de continuar.",
      ],
      target: giveaway,
    });
  }

  function resetRankingPointsToZero() {
    startTransition(async () => {
      try {
        const data = await resetRankingPoints();
        toast.success(
          `Puntos y creditos reiniciados para ${data.updated || 0} usuarios`,
        );
        await loadDashboard();
      } catch {
        toast.error("No se pudieron reiniciar puntos y creditos");
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
    confirmation,
    products: normalizedProducts,
    creditPackages: normalizedCreditPackages,
    giveaways: normalizedGiveaways,
    supportTickets: openSupportTickets,
    redemptionTickets,
    streamHour,
    streamRewards,
    liveStatus,
    supportReplies,
    setSupportReplies,
    loadDashboard,
    productForm,
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
    removeCreditPackage,
    giveawayForm,
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
    cancelConfirmation,
    confirmDashboardAction,
    activateStreamHour,
    disableStreamHour,
    activateStreamChest,
    activateStreamChatReward,
    resetRankingPointsToZero,
    useAutomaticStreamHour,
  };
}
