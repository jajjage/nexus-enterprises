export function HeroSection() {
  return (
    <section
      className="relative min-h-[68vh] overflow-hidden"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1800&q=80')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="hero-overlay absolute inset-0" aria-hidden="true" />
      <div className="site-container relative z-10 flex min-h-[68vh] items-center py-20">
        <div className="max-w-3xl text-center md:text-left">
          <p className="mb-5 text-sm font-semibold uppercase tracking-[0.2em] text-slate-200">
            Business Consultancy
          </p>
          <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">
            Simplifying Business Registration &amp; Compliance in Nigeria.
          </h1>
          <p className="mt-6 text-base leading-relaxed text-slate-200 sm:text-lg">
            Expert guidance for CAC, Tax, and Regulatory compliance.
          </p>
        </div>
      </div>
    </section>
  );
}
