import {
  IconAlertTriangle,
  IconBroadcast,
  IconCoins,
  IconGift,
  IconPackage,
  IconShoppingBag,
  IconTicket,
} from "@tabler/icons-react";

export const dashboardTabs = [
  { id: "products", label: "Productos", icon: IconPackage },
  { id: "credits", label: "Creditos", icon: IconCoins },
  { id: "giveaways", label: "Sorteos", icon: IconGift },
  { id: "redemptions", label: "Canjes", icon: IconShoppingBag },
  { id: "support", label: "Soporte", icon: IconTicket },
  { id: "stream", label: "Stream", icon: IconBroadcast },
  { id: "danger", label: "Peligro", icon: IconAlertTriangle },
];

export const emptyProduct = {
  title: "",
  description: "",
  price: "",
  stock: "",
  category: "",
  imageUrl: "",
  imageFile: null,
  status: "active",
  featured: false,
  rewardEffectType: "",
  rewardEffectValue: "happy",
  rewardEffectDurationMinutes: "60",
  alertEnabled: false,
  alertType: "confetti",
  alertMessage: "",
  alertDurationSeconds: "8",
};

export const emptyCreditPackage = {
  name: "",
  description: "",
  credits: "",
  pointsCost: "",
  status: "active",
  sortOrder: "0",
};

export const emptyGiveaway = {
  title: "",
  description: "",
  entryCost: "",
  imageUrl: "",
  imageFile: null,
  status: "active",
  startsAt: "",
  endsAt: "",
};
