import { useRef } from "react";
import { toast } from "sonner";

export default function useDashboardNotifications() {
  const knownPurchaseTicketsRef = useRef(new Set());
  const knownSupportTicketsRef = useRef(new Set());
  const dashboardLoadedRef = useRef(false);

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

  return trackDashboardNotifications;
}
