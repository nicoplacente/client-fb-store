import LegalDocument from "@/modules/legal/components/legal-document";
import {
  legalUpdatedAt,
  privacySections,
} from "@/modules/legal/lib/legal-content";

export const metadata = {
  title: "Politica de privacidad",
  description:
    "Politica de privacidad de FrancoBertello74 Store sobre datos de cuenta, puntos, creditos, extension, sorteos, canjes y soporte.",
  keywords: [
    "politica de privacidad",
    "FrancoBertello74",
    "Kick",
    "store",
    "datos personales",
    "extension",
  ],
  openGraph: {
    title: "Politica de privacidad | FrancoBertello74 Store",
    description:
      "Informacion sobre como el store recopila, usa y protege datos de la comunidad.",
    type: "website",
    locale: "es_AR",
  },
};

export default function PrivacyPage() {
  return (
    <LegalDocument
      eyebrow="Privacidad"
      title="Politica de privacidad"
      description="Esta politica explica que informacion recopilamos, para que la usamos y como se administra dentro del store, la extension y las funciones de comunidad."
      updatedAt={legalUpdatedAt}
      sections={privacySections}
    />
  );
}
