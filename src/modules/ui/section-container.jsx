export default function SectionContainer({ children, id, className }) {
  return (
    <section id={id}>
      <div className={`max-w-7xl mx-auto ${className}`}>{children}</div>
    </section>
  );
}
