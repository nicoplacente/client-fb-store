import {
  IconAlertTriangle,
  IconBroadcast,
  IconCoins,
  IconCrown,
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
  { id: "subscriptions", label: "Subscripciones", icon: IconCrown },
  { id: "support", label: "Soporte", icon: IconTicket },
  { id: "stream", label: "Stream", icon: IconBroadcast },
  { id: "danger", label: "Peligro", icon: IconAlertTriangle },
];

let screamerOptionSequence = 0;

export function createEmptyScreamerOption() {
  screamerOptionSequence += 1;

  return {
    clientId: `screamer-option-${screamerOptionSequence}`,
    name: "",
    gifUrl: "",
    gifFile: null,
    audioUrl: "",
    audioFile: null,
  };
}

export const emptyProduct = {
  title: "",
  description: "",
  price: "",
  stock: "",
  infiniteStock: false,
  singleUnitPerRedemption: false,
  category: "",
  imageUrl: "",
  imageFile: null,
  status: "active",
  featured: false,
  rewardEffectType: "",
  rewardEffectValue: "happy",
  rewardEffectDurationMinutes: "60",
  audioMaxDurationSeconds: "15",
  screamerOptions: [createEmptyScreamerOption()],
  screamerDurationSeconds: "5",
  screamerVolume: "1",
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
