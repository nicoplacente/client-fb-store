import Link from "next/link";

export default function LinkSidebar({ item, isActive, isOpen, compact = false }) {
  return (
    <Link
      href={item.href}
      title={!isOpen ? item.name : undefined}
      className={`group relative flex items-center overflow-hidden rounded-lg border text-sm font-semibold transition-[background,border-color,color,transform] duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-red-300/40 [&_svg]:size-5 [&_svg]:shrink-0 ${
        isOpen ? "h-11 justify-start px-3" : "h-11 w-full justify-start px-3"
      } ${
        compact ? "text-xs" : "text-sm"
      } ${
        isActive
          ? "border-red-300/35 bg-red-500/14 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
          : "border-transparent text-neutral-400 hover:border-white/10 hover:bg-white/[0.045] hover:text-neutral-100"
      }`}
    >
      <span
        className={`absolute left-0 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-r-full bg-red-300 transition-opacity duration-200 ${
          isActive ? "opacity-100" : "opacity-0"
        }`}
      />
      <div
        className={`flex size-7 items-center justify-center rounded-md transition-colors duration-200 ${
          isActive
            ? "bg-red-400/15 text-red-100"
            : "bg-white/[0.035] text-neutral-400 group-hover:text-neutral-100"
        }`}
      >
        {item.icon}
      </div>
      <span
        className={`overflow-hidden whitespace-nowrap transition-[max-width,opacity,transform,margin] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isOpen
            ? "ml-3 max-w-44 translate-x-0 opacity-100"
            : "ml-0 max-w-0 -translate-x-2 opacity-0"
        }`}
      >
        {item.name}
      </span>
    </Link>
  );
}
