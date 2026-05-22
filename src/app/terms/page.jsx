import SectionContainer from "@/modules/ui/section-container";
export default function TerminosPage() {
  return (
    <SectionContainer className="space-y-8">
      <div>
        <p className="text-sm font-semibold uppercase text-red-300/80">
          Terminos
        </p>
        <h1 className="mt-2 text-4xl font-bold text-white">
          Terminos y Condiciones
        </h1>
        <p className="mt-3 max-w-3xl text-neutral-400">
          Estas condiciones regulan el uso del store, los creditos, sorteos,
          canjes y herramientas vinculadas a la comunidad.
        </p>
      </div>

      <article className="space-y-6 rounded-lg border border-white/10 bg-neutral-950/80 p-6 text-neutral-300">
        <section>
          <h2 className="text-xl font-semibold text-white">1. Uso de la cuenta</h2>
          <p className="mt-2 leading-7">
            El acceso puede requerir verificacion mediante Kick. Cada usuario es
            responsable por mantener segura su cuenta y por las acciones
            realizadas desde su sesion.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white">2. Creditos y puntos</h2>
          <p className="mt-2 leading-7">
            Los creditos, puntos y recompensas son beneficios internos del store.
            No representan dinero real, no son transferibles salvo indicacion
            expresa y pueden ajustarse si se detectan errores, abuso o actividad
            fraudulenta.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white">3. Canjes del market</h2>
          <p className="mt-2 leading-7">
            Los productos publicados dependen de disponibilidad y stock. Un canje
            puede ser revisado, rechazado o revertido cuando no cumpla las reglas
            de la comunidad o exista un problema tecnico con el procesamiento.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white">4. Sorteos</h2>
          <p className="mt-2 leading-7">
            La participacion en sorteos puede estar limitada por requisitos de
            cuenta, actividad, pais, edad o reglas especificas de cada sorteo.
            Los ganadores deben responder dentro del plazo informado para recibir
            el premio.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white">5. Soporte</h2>
          <p className="mt-2 leading-7">
            Las consultas enviadas desde soporte se usan para resolver problemas
            de cuenta, canjes, sorteos o funcionamiento del sitio. El equipo puede
            solicitar informacion adicional para verificar identidad o actividad.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white">6. Cambios</h2>
          <p className="mt-2 leading-7">
            Estos terminos pueden actualizarse para reflejar cambios del store,
            del backend o de las reglas de la comunidad. El uso continuo del sitio
            implica aceptacion de la version vigente.
          </p>
        </section>
      </article>
    </SectionContainer>
  );
}
