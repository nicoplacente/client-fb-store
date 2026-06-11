import SectionContainer from "@/modules/ui/section-container";

export default function LegalDocument({
  eyebrow,
  title,
  description,
  updatedAt,
  sections,
}) {
  return (
    <SectionContainer className="max-w-5xl space-y-7">
      <header className="rounded-2xl border border-white/10 bg-neutral-950/80 p-5 shadow-xl shadow-black/20 ring-1 ring-white/[0.03] sm:p-7">
        <p className="text-sm font-semibold uppercase text-red-300/80">
          {eyebrow}
        </p>
        <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">
          {title}
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-neutral-400 sm:text-base">
          {description}
        </p>
        <p className="mt-4 text-xs font-semibold uppercase text-neutral-500">
          Última actualización: {updatedAt}
        </p>
      </header>

      <article className="space-y-5 rounded-2xl border border-white/10 bg-neutral-950/80 p-5 text-neutral-300 shadow-xl shadow-black/20 ring-1 ring-white/[0.03] sm:p-7">
        {sections.map((section, index) => (
          <section
            key={section.title}
            className={index === 0 ? "" : "border-t border-white/10 pt-5"}
          >
            <h2 className="text-lg font-bold text-white sm:text-xl">
              {section.title}
            </h2>
            <div className="mt-2 space-y-3 text-sm leading-7 text-neutral-400 sm:text-base">
              {section.content.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </section>
        ))}
      </article>
    </SectionContainer>
  );
}
