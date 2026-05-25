import SectionContainer from "@/modules/ui/section-container";

export const metadata = {
  title: "Términos y condiciones",
  description:
    "Condiciones de uso del store, créditos, sorteos, canjes y herramientas de la comunidad.",
  keywords: [
    "términos y condiciones",
    "FrancoBertello74",
    "Kick",
    "créditos",
    "canjes",
    "sorteos",
  ],
  openGraph: {
    title: "Términos y condiciones | FrancoBertello74 Store",
    description:
      "Reglas de uso del store, el sistema de créditos, sorteos y soporte.",
    type: "website",
    locale: "es_AR",
  },
};

export default function TerminosPage() {
  return (
    <SectionContainer className="space-y-8">
      <div>
        <p className="text-sm font-semibold uppercase text-red-300/80">
          Términos
        </p>
        <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">
          Términos y condiciones
        </h1>
        <p className="mt-3 max-w-3xl text-neutral-400">
          Estas condiciones regulan el uso del store, los créditos, sorteos,
          canjes y herramientas vinculadas a la comunidad.
        </p>
      </div>

      <article className="space-y-6 rounded-lg border border-white/10 bg-neutral-950/80 p-6 text-neutral-300">
        <section>
          <h2 className="text-xl font-semibold text-white">1. Uso de la cuenta</h2>
          <p className="mt-2 leading-7">
            El acceso puede requerir verificación mediante Kick. Cada usuario es
            responsable por mantener segura su cuenta y por las acciones
            realizadas desde su sesión.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white">2. Créditos y puntos</h2>
          <p className="mt-2 leading-7">
            Los créditos, puntos y recompensas son beneficios internos del store.
            No representan dinero real, no son transferibles salvo indicación
            expresa y pueden ajustarse si se detectan errores, abuso o actividad
            fraudulenta.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white">3. Canjes del market</h2>
          <p className="mt-2 leading-7">
            Los productos publicados dependen de disponibilidad y stock. Un canje
            puede ser revisado, rechazado o revertido cuando no cumpla las reglas
            de la comunidad o exista un problema técnico con el procesamiento.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white">4. Sorteos</h2>
          <p className="mt-2 leading-7">
            La participación en sorteos puede estar limitada por requisitos de
            cuenta, actividad, país, edad o reglas específicas de cada sorteo.
            Los ganadores deben responder dentro del plazo informado para recibir
            el premio.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white">5. Soporte</h2>
          <p className="mt-2 leading-7">
            Las consultas enviadas desde soporte se usan para resolver problemas
            de cuenta, canjes, sorteos o funcionamiento del sitio. El equipo puede
            solicitar información adicional para verificar identidad o actividad.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white">6. Cambios</h2>
          <p className="mt-2 leading-7">
            Estos términos pueden actualizarse para reflejar cambios del store,
            del backend o de las reglas de la comunidad. El uso continuo del sitio
            implica aceptación de la versión vigente.
          </p>
        </section>
      </article>
    </SectionContainer>
  );
}
