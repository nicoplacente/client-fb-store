"use client";

export default function ContentWrapper({ children }) {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 px-4 pb-8 pt-20 sm:px-6">{children}</main>
    </div>
  );
}
