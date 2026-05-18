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
      className={`overflow-hidden rounded-lg border bg-neutral-900/60 ${
        featured ? "border-yellow-300/40" : "border-white/10"
      } ${unavailable ? "opacity-75" : ""}`}
    >
      <div className="relative aspect-[5/3] bg-neutral-900">
        {featured ? (
          <span className="absolute left-3 top-3 z-10 rounded-md border border-yellow-300/40 bg-yellow-300/15 px-2 py-1 text-xs font-bold text-yellow-200">
            Destacado
          </span>
        ) : null}
        {unavailable ? (
          <span className="absolute right-3 top-3 z-10 rounded-md border border-neutral-500/40 bg-neutral-950/80 px-2 py-1 text-xs font-bold uppercase text-neutral-300">
            No disponible
          </span>
        ) : null}
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className={`h-full w-full object-cover ${unavailable ? "grayscale" : ""}`}
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-neutral-600">
            {icon}
          </div>
        )}
      </div>
      <div className="space-y-3 p-3">
        <div>
          <h3 className="line-clamp-1 font-semibold text-white">{title}</h3>
          <p className="mt-1 text-sm text-neutral-400">{meta}</p>
          <p className="mt-1 text-xs text-neutral-500">{detail}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-md border border-white/10 bg-neutral-950 px-3 py-2 text-sm font-semibold text-white transition hover:border-red-400/50"
          >
            <IconEdit size={17} />
            Editar
          </button>
          {onDelete ? (
            <button
              onClick={onDelete}
              className="inline-flex items-center justify-center rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-red-200 transition hover:bg-red-500/20"
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
