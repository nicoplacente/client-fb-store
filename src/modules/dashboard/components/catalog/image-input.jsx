import { useEffect, useRef, useState } from "react";
import { IconLink, IconPhotoUp, IconX } from "@tabler/icons-react";
import { Field, TextInput } from "../form-controls";

export default function ImageInput({
  file,
  imageUrl,
  onFileChange,
  onUrlChange,
  onClearFile,
}) {
  const inputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(imageUrl);
  const fileName = file?.name || "";
  const hasPreview = Boolean(previewUrl);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(imageUrl);
      return undefined;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [file, imageUrl]);

  function openFileSelector() {
    inputRef.current?.click();
  }

  function handleFileChange(event) {
    onFileChange(event.target.files?.[0] || null);
  }

  function handleDrop(event) {
    event.preventDefault();
    onFileChange(event.dataTransfer.files?.[0] || null);
  }

  function clearFile() {
    if (inputRef.current) {
      inputRef.current.value = "";
    }

    onClearFile();
  }

  return (
    <div className="grid gap-4 rounded-2xl border border-white/10 bg-neutral-950/70 p-4 shadow-inner shadow-black/10">
      <div>
        <h3 className="text-base font-bold text-white">Agregar imagen</h3>
        <p className="mt-1 text-sm text-neutral-500">
          Sube una imagen limpia. Se usara como thumbnail principal.
        </p>
      </div>

      <button
        type="button"
        onClick={openFileSelector}
        onDrop={handleDrop}
        onDragOver={(event) => event.preventDefault()}
        className="grid min-h-44 cursor-pointer place-items-center rounded-2xl border border-dashed border-white/15 bg-neutral-900/60 px-4 py-8 text-center transition hover:border-red-300/45 hover:bg-red-500/5 focus:outline-none focus:ring-2 focus:ring-red-300/35"
      >
        <span className="grid justify-items-center gap-3">
          <IconPhotoUp size={44} className="text-neutral-600" />
          <span className="text-sm font-black text-white">Arrastra o selecciona una imagen</span>
          <span className="text-xs font-medium text-neutral-500">
            PNG, JPG, WEBP, GIF o AVIF hasta 5MB.
          </span>
        </span>
      </button>

      <input
        ref={inputRef}
        key={fileName || "empty"}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
        className="sr-only"
        onChange={handleFileChange}
      />

      <Field label="O subir link de imagen">
        <div className="relative">
          <IconLink
            size={17}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
          />
          <TextInput
            value={imageUrl}
            placeholder="https://..."
            onChange={onUrlChange}
            className="w-full pl-9"
          />
        </div>
      </Field>

      {hasPreview ? (
        <div className="flex flex-wrap gap-3">
          <div className="group relative h-28 w-28 overflow-hidden rounded-2xl border border-white/10 bg-neutral-900 shadow-lg shadow-black/20">
            <img src={previewUrl} alt="Preview de imagen" className="h-full w-full object-cover" />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-3 py-2">
              <span className="block truncate text-xs font-black text-white">
                {file ? "Archivo" : "Link"}
              </span>
            </div>
            {file ? (
              <button
                type="button"
                onClick={clearFile}
                className="absolute right-2 top-2 grid size-8 cursor-pointer place-items-center rounded-full bg-black/70 text-white opacity-100 transition hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300/45 sm:opacity-0 sm:group-hover:opacity-100"
                aria-label="Quitar archivo"
              >
                <IconX size={16} />
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
