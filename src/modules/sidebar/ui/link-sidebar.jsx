import Link from "next/link";

export default function LinkSidebar({ item, isActive, isOpen }) {
  return (
    <Link
      href={item.href}
      className={`flex items-center rounded-lg transition-colors [&_svg]:size-5 [&_svg]:shrink-0 ${
        isOpen ? "h-11 justify-start px-3" : "mx-auto size-11 justify-center p-0"
      }
                    ${
                      isActive
                        ? "bg-gradient-to-br from-red-700 via-primary to-red-950 text-white shadow-[0_0_18px_rgba(239,68,68,0.2)]"
                        : "hover:bg-neutral-900"
                    }`}
    >
      <div className="flex size-6 items-center justify-center">{item.icon}</div>
      <span
        className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${
          isOpen ? "ml-3 max-w-44 opacity-100" : "ml-0 max-w-0 opacity-0"
        }`}
      >
        {item.name}
      </span>
    </Link>
  );
}
