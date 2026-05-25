import Link from "next/link";

export default function LinkSidebar({ item, isActive, isOpen }) {
  return (
    <Link
      href={item.href}
      className={`flex items-center rounded-md px-3 py-2 transition-colors
                    ${
                      isActive
                        ? "bg-gradient-to-br from-neutral-900 via-primary to-neutral-900 text-white"
                        : "hover:bg-neutral-900"
                    }`}
    >
      <div className="flex w-6 items-center justify-center">{item.icon}</div>
      <span
        className={`whitespace-nowrap transition-all duration-300 ${
          isOpen ? "ml-3 opacity-100" : "-ml-10 opacity-0"
        }`}
      >
        {item.name}
      </span>
    </Link>
  );
}
