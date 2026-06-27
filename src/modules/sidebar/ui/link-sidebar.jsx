import Link from "next/link";
import Image from "next/image";

export default function LinkSidebar({
  item,
  isActive,
  isOpen,
  compact = false,
}) {
  const isBlueAccent = item.accent === "blue";
  const isVioletAccent = item.accent === "violet";

  const stateClassName = isBlueAccent
    ? isActive
      ? "border-cyan-300/35 bg-cyan-400/12 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
      : "border-transparent text-neutral-400 hover:border-cyan-300/20 hover:bg-cyan-400/[0.055] hover:text-cyan-100"
    : isVioletAccent
      ? isActive
        ? "border-[#9b4dff]/35 bg-[#9b4dff]/15 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
        : "border-transparent text-neutral-400 hover:border-[#9b4dff]/20 hover:bg-[#9b4dff]/[0.055] hover:text-[#e9d8ff]"
      : isActive
        ? "border-red-300/35 bg-red-500/14 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
        : "border-transparent text-neutral-400 hover:border-white/10 hover:bg-white/[0.045] hover:text-neutral-100";

  const indicatorClassName = isBlueAccent
    ? "bg-cyan-300"
    : isVioletAccent
      ? "bg-[#9b4dff]"
      : "bg-red-300";

  const iconClassName = isBlueAccent
    ? isActive
      ? "text-cyan-100"
      : "text-cyan-200/70 group-hover:text-cyan-100"
    : isVioletAccent
      ? isActive
        ? "bg-[#9b4dff]/15 text-[#f2e8ff]"
        : "text-[#cfb7ff] group-hover:text-[#f2e8ff]"
      : isActive
        ? "bg-red-400/15 text-red-100"
        : "bg-white/[0.035] text-neutral-400 group-hover:text-neutral-100";

  return (
    <Link
      href={item.href}
      target={item.external ? "_blank" : undefined}
      rel={item.external ? "noopener" : undefined}
      title={!isOpen ? item.name : undefined}
      className={`group relative flex items-center overflow-hidden rounded-lg border text-sm font-semibold transition-[background,border-color,color,transform] duration-200 ease-out focus:outline-none [&_svg]:size-5 [&_svg]:shrink-0 ${
        isOpen ? "h-11 justify-start px-3" : "h-11 w-full justify-start px-3"
      } ${compact ? "text-xs" : "text-sm"} ${stateClassName}`}
    >
      <span
        className={`absolute left-0 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-r-full transition-opacity duration-200 ${indicatorClassName} ${
          isActive ? "opacity-100" : "opacity-0"
        }`}
      />
      <div
        className={`flex size-7 items-center justify-center ${
          isBlueAccent ? "" : "rounded-md"
        } transition-colors duration-200 ${iconClassName}`}
      >
        {item.imageSrc ? (
          <Image
            src={item.imageSrc}
            alt=""
            width={28}
            height={28}
            className="size-6 object-contain"
          />
        ) : (
          item.icon
        )}
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
