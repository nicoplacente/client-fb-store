import { envConfig } from "@/config";
import { apiRequest, buildResourceUrl } from "@/modules/api/client";

export async function createSupportTicket(ticket) {
  return apiRequest(envConfig.API_SUPPORT, {
    method: "POST",
    body: ticket,
  });
}

export async function getSupportTickets({ includeAll = false } = {}) {
  const url = includeAll
    ? `${envConfig.API_SUPPORT_TICKETS}?includeAll=true`
    : envConfig.API_SUPPORT_TICKETS;
  const data = await apiRequest(url);
  return Array.isArray(data) ? data : data.tickets || [];
}

export async function updateSupportTicket(ticketId, ticket) {
  return apiRequest(buildResourceUrl(envConfig.API_SUPPORT_TICKETS, ticketId), {
    method: "PUT",
    body: ticket,
  });
}

export async function deleteSupportTicket(ticketId) {
  return apiRequest(buildResourceUrl(envConfig.API_SUPPORT_TICKETS, ticketId), {
    method: "DELETE",
  });
}

export function normalizeTicket(ticket) {
  return {
    id: ticket.id || ticket._id || ticket.code || ticket.subject,
    subject: ticket.subject || "Consulta",
    message: ticket.message || ticket.description || "",
    status: ticket.status || "open",
    category: ticket.category || "General",
    username: ticket.user?.username || ticket.username || "Sin usuario",
    createdAt: ticket.createdAt || ticket.date || "",
  };
}
