import { IconEdit, IconTrash } from "@tabler/icons-react";

export default function AdminCard({
  title,
  meta,
  detail,
  imageUrl,
  featured = false,
  unavailable = false,
  icon,
  onEdit,
  onDelete,
}) {
  return (
    <article
      className={`group overflow-hidden rounded-2xl border bg-neutral-950/80 shadow-xl shadow-black/20 ring-1 ring-white/[0.03] transition duration-300 hover:-translate-y-1 hover:bg-neutral-950 ${
        featured
          ? "border-amber-300/40 hover:border-amber-300/60"
          : "border-white/10 hover:border-red-300/25"
      } ${unavailable ? "opacity-75" : ""}`}
    >
      <div className="relative aspect-[5/3] overflow-hidden bg-neutral-900">
        <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-black/50 via-transparent to-black/10" />
        {featured ? (
          <span className="absolute left-3 top-3 z-10 rounded-full border border-amber-300/40 bg-amber-300/15 px-3 py-1 text-xs font-bold text-amber-100 backdrop-blur">
            Destacado
          </span>
        ) : null}
        {unavailable ? (
          <span className="absolute right-3 top-3 z-10 rounded-full border border-neutral-500/40 bg-neutral-950/80 px-3 py-1 text-xs font-bold uppercase text-neutral-300 backdrop-blur">
            No disponible
          </span>
        ) : null}
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className={`h-full w-full object-scale-down transition duration-700 group-hover:scale-105 ${unavailable ? "grayscale" : ""}`}
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-neutral-600">
            {icon}
          </div>
        )}
      </div>
      <div className="space-y-4 p-4">
        <div>
          <h3 className="line-clamp-1 font-bold text-white">{title}</h3>
          <p className="mt-2 text-sm font-semibold text-neutral-300">{meta}</p>
          <p className="mt-1 text-xs text-neutral-500">{detail}</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            onClick={onEdit}
            className="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/10 bg-neutral-950 px-3 py-2.5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:border-red-300/50 hover:bg-white/[0.04] focus:outline-none"
          >
            <IconEdit size={17} />
            Editar
          </button>
          {onDelete ? (
            <button
              onClick={onDelete}
              className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-red-200 transition hover:-translate-y-0.5 hover:bg-red-500/20 focus:outline-none"
              aria-label={`Eliminar ${title}`}
            >
              <IconTrash size={17} />
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}
