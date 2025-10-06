export default function SectionContainer({ children, id, className }) {
  return (
    <section id={id}>
      <div className={`max-w-7xl space-y-36 mt-9 mx-auto ${className}`}>
        {children}
      </div>
    </section>
  );
}
