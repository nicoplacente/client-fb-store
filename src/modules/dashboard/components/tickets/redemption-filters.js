const MONTH_ALIASES = new Map([
  ["1", 1],
  ["01", 1],
  ["ene", 1],
  ["enero", 1],
  ["jan", 1],
  ["january", 1],
  ["2", 2],
  ["02", 2],
  ["feb", 2],
  ["febrero", 2],
  ["february", 2],
  ["3", 3],
  ["03", 3],
  ["mar", 3],
  ["marzo", 3],
  ["march", 3],
  ["4", 4],
  ["04", 4],
  ["abr", 4],
  ["abril", 4],
  ["apr", 4],
  ["april", 4],
  ["5", 5],
  ["05", 5],
  ["may", 5],
  ["mayo", 5],
  ["6", 6],
  ["06", 6],
  ["jun", 6],
  ["junio", 6],
  ["june", 6],
  ["7", 7],
  ["07", 7],
  ["jul", 7],
  ["julio", 7],
  ["july", 7],
  ["8", 8],
  ["08", 8],
  ["ago", 8],
  ["agosto", 8],
  ["aug", 8],
  ["august", 8],
  ["9", 9],
  ["09", 9],
  ["sep", 9],
  ["sept", 9],
  ["septiembre", 9],
  ["september", 9],
  ["10", 10],
  ["oct", 10],
  ["octubre", 10],
  ["october", 10],
  ["11", 11],
  ["nov", 11],
  ["noviembre", 11],
  ["november", 11],
  ["12", 12],
  ["dic", 12],
  ["diciembre", 12],
  ["dec", 12],
  ["december", 12],
]);

export function filterTicketsByDate(tickets, filter) {
  const parsedFilter = parseCalendarDate(filter.date) || parseDateFilter(filter.text);
  if (!parsedFilter) return tickets;

  return tickets.filter((ticket) => {
    if (!ticket.createdAt) return false;

    const date = new Date(ticket.createdAt);
    if (Number.isNaN(date.getTime())) return false;

    const sameDay = date.getDate() === parsedFilter.day;
    const sameMonth = date.getMonth() + 1 === parsedFilter.month;
    const sameYear = !parsedFilter.year || date.getFullYear() === parsedFilter.year;

    return sameDay && sameMonth && sameYear;
  });
}

export function buildProductMap(products = []) {
  return new Map(
    products
      .filter((product) => product?.title)
      .map((product) => [normalizeProductKey(product.title), product])
  );
}

export function normalizeProductKey(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function normalizeDateFilter(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+de\s+/g, "-")
    .replace(/[/.]/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function parseDateFilter(value) {
  const normalized = normalizeDateFilter(value);
  if (!normalized) return null;

  const parts = normalized.split("-").filter(Boolean);
  if (parts.length < 2) return null;

  const day = Number(parts[0]);
  const month = MONTH_ALIASES.get(parts[1]);
  const year = parts[2] ? Number(parts[2]) : null;

  if (!Number.isInteger(day) || day < 1 || day > 31 || !month) return null;

  return {
    day,
    month,
    year: Number.isInteger(year) ? year : null,
  };
}

function parseCalendarDate(value) {
  if (!value) return null;

  const [year, month, day] = String(value).split("-").map(Number);

  if (!Number.isInteger(day) || !Number.isInteger(month) || !Number.isInteger(year)) {
    return null;
  }

  return { day, month, year };
}
