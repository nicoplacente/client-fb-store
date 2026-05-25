import { IconLoader2 } from "@tabler/icons-react";

export default function Loader() {
  return (
    <div role="status" aria-live="polite" className="inline-flex items-center">
      <IconLoader2 aria-hidden="true" className="size-5 animate-spin text-green-500" />
      <span className="sr-only">Cargando...</span>
    </div>
  );
}
