import {
  IconHomeFilled,
  IconChartBar,
  IconChartPie,
  IconCoinBitcoin,
  IconGift,
  IconHelpHexagon,
  IconLayoutDashboard,
  IconShieldLock,
  IconFileText,
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
  { name: "Predicciones", icon: <IconChartPie size={20} />, href: "/predictions" },
  { name: "Sorteos", icon: <IconGift size={20} />, href: "/gifts" },
  { name: "Soporte", icon: <IconHelpHexagon size={20} />, href: "/support" },
  {
    name: "Codeluxe",
    imageSrc: "/logo-cd-3d.webp",
    href: "https://codeluxe.tech",
    external: true,
    accent: "blue",
  },
];

export const legalMenuItems = [
  { name: "Términos", icon: <IconFileText size={20} />, href: "/terms" },
  {
    name: "Privacidad",
    icon: <IconShieldLock size={20} />,
    href: "/privacy",
  },
];
