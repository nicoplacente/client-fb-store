import { envConfig } from "@/config";
import { apiRequest, buildResourceUrl } from "@/modules/api/client";
import { getSupportCategoryLabel } from "./support-categories";

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

export async function createSupportMessage(ticketId, message, options = {}) {
  return apiRequest(
    `${buildResourceUrl(envConfig.API_SUPPORT_TICKETS, ticketId)}/messages`,
    {
      method: "POST",
      body: {
        message,
        senderRole: options.senderRole,
      },
    }
  );
}

export async function deleteSupportTicket(ticketId) {
  return apiRequest(buildResourceUrl(envConfig.API_SUPPORT_TICKETS, ticketId), {
    method: "DELETE",
  });
}

export async function deleteRedemptionTickets(mode) {
  return apiRequest(`${envConfig.API_SUPPORT_TICKETS}/market`, {
    method: "DELETE",
    body: {
      mode,
    },
  });
}

export async function deleteSupportTickets(mode) {
  return apiRequest(`${envConfig.API_SUPPORT_TICKETS}/support`, {
    method: "DELETE",
    body: {
      mode,
    },
  });
}

export function normalizeTicket(ticket) {
  const user = ticket.user
    ? {
        id: ticket.user.id || ticket.user._id,
        username: ticket.user.username || ticket.username || "Sin usuario",
        avatarUrl: ticket.user.avatarUrl || "",
        name: ticket.user.name || "",
        dni: ticket.user.dni || "",
        email: ticket.user.email || "",
        country: ticket.user.country || "",
        province: ticket.user.province || "",
        city: ticket.user.city || "",
        direction: ticket.user.direction || "",
        postalCode: ticket.user.postalCode || "",
        phone: ticket.user.phone || "",
        instagram: ticket.user.instagram || "",
        twitter: ticket.user.twitter || "",
        discord: ticket.user.discord || "",
      }
    : null;

  return {
    id: ticket.id || ticket._id || ticket.code || ticket.subject,
    subject: ticket.subject || "Consulta",
    message: ticket.message || ticket.description || "",
    status: ticket.status || "open",
    category: ticket.category || "General",
    categoryLabel: getSupportCategoryLabel(ticket.category),
    username: user?.username || ticket.username || "Sin usuario",
    user,
    createdAt: ticket.createdAt || ticket.date || "",
    messages: Array.isArray(ticket.messages)
      ? ticket.messages.map((message) => ({
          id: message.id || `${ticket.id}-${message.createdAt}`,
          senderRole: message.senderRole || "user",
          message: message.message || "",
          createdAt: message.createdAt || "",
          username:
            message.user?.username ||
            (message.senderRole === "admin" ? "Soporte" : ticket.user?.username) ||
            "Usuario",
        }))
      : [],
  };
}
