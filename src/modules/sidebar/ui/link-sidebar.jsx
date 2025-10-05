import Link from "next/link";

export default function LinkSidebar({ item, isActive, isOpen }) {
  return (
    <Link
      href={item.href}
      className={`flex items-center px-3 py-2 rounded-md transition-colors
                    ${
                      isActive
                        ? "bg-gradient-to-br from-neutral-900 via-primary to-neutral-900 text-white"
                        : "hover:bg-neutral-900"
                    }`}
    >
      <div className="w-6 flex items-center justify-center">{item.icon}</div>
      <span
        className={`whitespace-nowrap transition-all duration-300 ${
          isOpen ? "opacity-100 ml-3" : "opacity-0 -ml-10"
        }`}
      >
        {item.name}
      </span>
    </Link>
  );
}
