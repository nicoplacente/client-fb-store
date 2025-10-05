"use client";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function useCopy() {
  const [copied, setCopied] = useState(false);

  const copy = async (text) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copiado correctamente");
  };

  useEffect(() => {
    if (!copied) return;
    const timeout = setTimeout(() => setCopied(false), 3000);
    return () => clearTimeout(timeout);
  }, [copied]);

  return { copied, copy };
}
