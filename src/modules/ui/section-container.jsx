export default function SectionContainer({ children, id, className }) {
  return (
    <section id={id}>
      <div className={`max-w-7xl space-y-18 my-9 mx-auto ${className}`}>
        {children}
      </div>
    </section>
  );
}
