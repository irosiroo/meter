export const metadata = {
  title: "About — METER",
  description: "About METER Tools Panel — 309 calculators and professional tools.",
};

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-fg">About METER</h1>
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-fg-muted">
        <p>
          METER is a free tools panel bringing together 309 calculators across 20 categories —
          mathematics, finance, unit conversion, health, engineering, physics, chemistry and more
          — in a single, fast, ad-supported platform.
        </p>
        <p>
          Every tool is built to give accurate, instant results without sign-ups, downloads or
          paywalls. Our goal is to make everyday calculations — from mortgage payments to BMI to
          unit conversions — simple and accessible to everyone.
        </p>
      </div>
    </main>
  );
}
