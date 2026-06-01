import { IconCrown, IconInfoCircle, IconShoppingBag } from "@tabler/icons-react";

const profileTabs = [
  {
    id: "info",
    label: "Informacion",
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
    <div className="mx-auto mb-7 grid w-full max-w-xl grid-cols-3 gap-2 border-b border-white/10">
      {profileTabs.map((tab) => {
        const Icon = tab.icon;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            aria-label={`Ver seccion ${tab.label}`}
            className={`inline-flex min-w-0 cursor-pointer items-center justify-center gap-2 border-b-2 px-2 py-3 text-sm font-bold transition sm:px-4 ${
              activeTab === tab.id
                ? "border-red-400 text-white"
                : "border-transparent text-neutral-500 hover:text-neutral-200"
            }`}
          >
            <Icon size={17} />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
