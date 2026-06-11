import LegalDocument from "@/modules/legal/components/legal-document";
import { legalUpdatedAt, termsSections } from "@/modules/legal/lib/legal-content";
import { createPageMetadata } from "@/modules/seo/metadata";

export const metadata = createPageMetadata({
  title: "Términos y condiciones",
  description:
    "Condiciones de uso del store, créditos, puntos, sorteos, canjes y herramientas de la comunidad.",
  path: "/terms",
  keywords: [
    "términos y condiciones",
    "FrancoBertello74",
    "Kick",
    "créditos",
    "canjes",
    "sorteos",
  ],
});

export default function TermsPage() {
  return (
    <LegalDocument
      eyebrow="Términos"
      title="Términos y condiciones"
      description="Estas condiciones regulan el uso del store, los créditos, puntos, sorteos, canjes, soporte, recompensas y herramientas vinculadas a la comunidad de FrancoBertello74."
      updatedAt={legalUpdatedAt}
      sections={termsSections}
    />
  );
}
