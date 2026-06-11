import LegalDocument from "@/modules/legal/components/legal-document";
import {
  legalUpdatedAt,
  privacySections,
} from "@/modules/legal/lib/legal-content";
import { createPageMetadata } from "@/modules/seo/metadata";

export const metadata = createPageMetadata({
  title: "Política de privacidad",
  description:
    "Política de privacidad de FrancoBertello74 Store sobre datos de cuenta, puntos, créditos, extensión, sorteos, canjes y soporte.",
  path: "/privacy",
  keywords: [
    "política de privacidad",
    "FrancoBertello74",
    "Kick",
    "store",
    "datos personales",
    "extensión",
  ],
});

export default function PrivacyPage() {
  return (
    <LegalDocument
      eyebrow="Privacidad"
      title="Política de privacidad"
      description="Esta política explica qué información recopilamos, para qué la usamos y cómo se administra dentro del store, la extensión y las funciones de comunidad."
      updatedAt={legalUpdatedAt}
      sections={privacySections}
    />
  );
}
