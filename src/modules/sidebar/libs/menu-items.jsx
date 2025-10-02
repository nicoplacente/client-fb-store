import {
  IconHomeFilled,
  IconChartBar,
  IconCoinBitcoin,
  IconGift,
  IconHelpHexagon,
  IconFileText,
} from "@tabler/icons-react";

export const menuItems = [
  { name: "Inicio", icon: <IconHomeFilled size={20} />, href: "/" },
  { name: "Ranking", icon: <IconChartBar size={20} />, href: "/ranking" },
  { name: "Market", icon: <IconCoinBitcoin size={20} />, href: "/market" },
  { name: "Sorteos", icon: <IconGift size={20} />, href: "/gifts" },
  { name: "Soporte", icon: <IconHelpHexagon size={20} />, href: "/support" },
  {
    name: "Términos y Condiciones",
    icon: <IconFileText size={20} />,
    href: "/terms",
  },
];
