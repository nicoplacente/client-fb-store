"use client";

export default function ContentWrapper({ children }) {
  return (
    <div className="flex min-h-screen flex-col">
      <main
        id="contenido-principal"
        tabIndex="-1"
        className="flex-1 px-4 pb-8 pt-20 outline-none sm:px-6"
      >
        {children}
      </main>
    </div>
  );
}
