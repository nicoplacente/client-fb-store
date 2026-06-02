import LegalDocument from "@/modules/legal/components/legal-document";
import { legalUpdatedAt, termsSections } from "@/modules/legal/lib/legal-content";

export const metadata = {
  title: "Terminos y condiciones",
  description:
    "Condiciones de uso del store, creditos, puntos, sorteos, canjes y herramientas de la comunidad.",
  keywords: [
    "terminos y condiciones",
    "FrancoBertello74",
    "Kick",
    "creditos",
    "canjes",
    "sorteos",
  ],
  openGraph: {
    title: "Terminos y condiciones | FrancoBertello74 Store",
    description:
      "Reglas de uso del store, el sistema de creditos, sorteos, canjes y soporte.",
    type: "website",
    locale: "es_AR",
  },
};

export default function TermsPage() {
  return (
    <LegalDocument
      eyebrow="Terminos"
      title="Terminos y condiciones"
      description="Estas condiciones regulan el uso del store, los creditos, puntos, sorteos, canjes, soporte, recompensas y herramientas vinculadas a la comunidad de FrancoBertello74."
      updatedAt={legalUpdatedAt}
      sections={termsSections}
    />
  );
}
