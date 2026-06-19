export default function TH({ children, className = "", ariaSort }) {
  return (
    <th
      scope="col"
      aria-sort={ariaSort}
      className={`p-1 text-sm font-light ${className}`}
    >
      {children}
    </th>
  );
}
