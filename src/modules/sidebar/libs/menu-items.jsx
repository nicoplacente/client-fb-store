import {
  IconHomeFilled,
  IconChartBar,
  IconCoinBitcoin,
  IconGift,
  IconHelpHexagon,
  IconLayoutDashboard,
} from "@tabler/icons-react";

export const menuItems = [
  { name: "Inicio", icon: <IconHomeFilled size={20} />, href: "/" },
  {
    name: "Dashboard",
    icon: <IconLayoutDashboard size={20} />,
    href: "/dashboard",
    requiresDashboardAccess: true,
  },
  { name: "Ranking", icon: <IconChartBar size={20} />, href: "/ranking" },
  { name: "Tienda", icon: <IconCoinBitcoin size={20} />, href: "/market" },
  { name: "Sorteos", icon: <IconGift size={20} />, href: "/gifts" },
  { name: "Soporte", icon: <IconHelpHexagon size={20} />, href: "/support" },
];
