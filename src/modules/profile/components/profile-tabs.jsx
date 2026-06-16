import { IconCrown, IconInfoCircle, IconShoppingBag } from "@tabler/icons-react";

const profileTabs = [
  {
    id: "info",
    label: "Información",
    icon: IconInfoCircle,
  },
  {
    id: "redemptions",
    label: "Mis canjes",
    icon: IconShoppingBag,
  },
  {
    id: "subscriptions",
    label: "Mis subs",
    icon: IconCrown,
  },
];

export default function ProfileTabs({ activeTab, onChange }) {
  return (
    <div
      role="tablist"
      aria-label="Secciones del perfil"
      className="mx-auto mb-7 grid w-full max-w-xl grid-cols-3 gap-1 border-b border-white/10 sm:gap-2"
    >
      {profileTabs.map((tab) => {
        const Icon = tab.icon;

        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => onChange(tab.id)}
            aria-label={`Ver sección ${tab.label}`}
            className={`inline-flex min-w-0 cursor-pointer flex-col items-center justify-center gap-1 border-b-2 px-1 py-3 text-center text-xs font-bold leading-tight transition sm:flex-row sm:gap-2 sm:px-4 sm:text-sm ${
              activeTab === tab.id
                ? "border-red-400 text-white"
                : "border-transparent text-neutral-500 hover:text-neutral-200"
            }`}
          >
            <Icon size={17} className="shrink-0" />
            <span className="min-w-0">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
