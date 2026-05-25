export default function SectionContainer({ children, id, className = "" }) {
  return (
    <section id={id}>
      <div
        className={[
          "mx-auto mt-4 max-w-7xl space-y-8 sm:mt-7 lg:mt-9 lg:space-y-12",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {children}
      </div>
    </section>
  );
}
