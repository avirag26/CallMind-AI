import Link from "next/link";
import Image from "next/image";
import { Fraunces, Figtree } from "next/font/google";

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-landing-display",
});

const sans = Figtree({
  subsets: ["latin"],
  variable: "--font-landing-sans",
});

export default function Home() {
  return (
    <div
      className={`${display.variable} ${sans.variable} landing min-h-screen text-[var(--ink)]`}
    >
      <header className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-6 py-5 md:px-10">
        <span className="sr-only">CallMind</span>
        <div />
        <nav className="flex items-center gap-3 landing-fade" style={{ animationDelay: "0.45s" }}>
          <Link
            href="/login"
            className="px-4 py-2 text-sm font-medium text-white/85 transition hover:text-white"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="bg-[var(--foam)] px-4 py-2 text-sm font-semibold text-[var(--deep)] transition hover:bg-white"
          >
            Get started
          </Link>
        </nav>
      </header>

      <section className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?auto=format&fit=crop&w=2400&q=80"
          alt="Clinician speaking with a patient by phone in a calm consultation room"
          fill
          priority
          className="object-cover landing- ken"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,32,30,0.35)_0%,rgba(8,32,30,0.2)_35%,rgba(8,32,30,0.88)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_10%,rgba(126,184,170,0.22),transparent_50%)]" />

        <div className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-16 pt-32 md:px-10 md:pb-20">
          <p className="landing-fade font-[family-name:var(--font-landing-display)] text-5xl leading-none tracking-tight text-white sm:text-6xl md:text-8xl lg:text-9xl">
            CallMind
          </p>
          <h1 className="landing-fade mt-6 max-w-xl font-[family-name:var(--font-landing-sans)] text-xl font-medium leading-snug text-white/95 md:text-2xl" style={{ animationDelay: "0.12s" }}>
            Your clinic&apos;s AI receptionist—answering when doctors can&apos;t.
          </h1>
          <p className="landing-fade mt-4 max-w-md font-[family-name:var(--font-landing-sans)] text-base leading-relaxed text-white/70 md:text-lg" style={{ animationDelay: "0.2s" }}>
            Missed and declined calls become calm triage conversations, with patient summaries ready for your team.
          </p>
          <div className="landing-fade mt-8 flex flex-wrap items-center gap-3" style={{ animationDelay: "0.32s" }}>
            <Link
              href="/register"
              className="bg-[var(--foam)] px-6 py-3 text-sm font-semibold text-[var(--deep)] transition hover:bg-white"
            >
              Open the dashboard
            </Link>
            <Link
              href="/login"
              className="border border-white/35 px-6 py-3 text-sm font-medium text-white transition hover:border-white hover:bg-white/10"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-[var(--foam)] px-6 py-20 md:px-10 md:py-28">
        <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-[0.9fr_1.1fr] md:gap-20">
          <div>
            <p className="font-[family-name:var(--font-landing-sans)] text-xs font-semibold uppercase tracking-[0.2em] text-[var(--teal)]">
              How it works
            </p>
            <h2 className="mt-4 font-[family-name:var(--font-landing-display)] text-4xl leading-tight text-[var(--deep)] md:text-5xl">
              From ringing phone to ready chart note.
            </h2>
          </div>
          <ol className="space-y-8 font-[family-name:var(--font-landing-sans)]">
            {[
              {
                step: "01",
                title: "A call comes in",
                body: "Your team answers live—or declines when they are with a patient.",
              },
              {
                step: "02",
                title: "CallMind picks up",
                body: "The AI receptionist gathers name, concern, symptoms, and callback preference.",
              },
              {
                step: "03",
                title: "You get the summary",
                body: "A structured triage note lands in Patients so the next clinician starts informed.",
              },
            ].map((item) => (
              <li key={item.step} className="grid grid-cols-[auto_1fr] gap-5 border-t border-[var(--deep)]/10 pt-8 first:border-t-0 first:pt-0">
                <span className="font-[family-name:var(--font-landing-display)] text-2xl text-[var(--teal)]">
                  {item.step}
                </span>
                <div>
                  <h3 className="text-lg font-semibold text-[var(--deep)]">{item.title}</h3>
                  <p className="mt-2 max-w-md text-[var(--ink-soft)] leading-relaxed">{item.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[var(--deep)] px-6 py-20 text-[var(--foam)] md:px-10 md:py-28">
        <div className="pointer-events-none absolute -right-24 top-0 h-80 w-80 rounded-full bg-[var(--teal)]/20 blur-3xl" />
        <div className="relative mx-auto flex max-w-6xl flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <h2 className="font-[family-name:var(--font-landing-display)] text-4xl leading-tight md:text-5xl">
              Built for clinics that refuse to let a missed call become a missed patient.
            </h2>
            <p className="mt-5 max-w-lg font-[family-name:var(--font-landing-sans)] text-base leading-relaxed text-white/65">
              CallMind keeps the front desk calm: live when you can, intelligent when you can&apos;t—always with a clear handoff.
            </p>
          </div>
          <Link
            href="/register"
            className="inline-flex shrink-0 bg-[var(--foam)] px-6 py-3 text-sm font-semibold text-[var(--deep)] transition hover:bg-white"
          >
            Start with CallMind
          </Link>
        </div>
      </section>

      <footer className="border-t border-[var(--deep)]/10 bg-[var(--foam)] px-6 py-8 md:px-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 font-[family-name:var(--font-landing-sans)] text-sm text-[var(--ink-soft)] sm:flex-row sm:items-center sm:justify-between">
          <p className="font-[family-name:var(--font-landing-display)] text-lg text-[var(--deep)]">
            CallMind
          </p>
          <div className="flex gap-6">
            <Link href="/login" className="hover:text-[var(--deep)]">
              Sign in
            </Link>
            <Link href="/dashboard" className="hover:text-[var(--deep)]">
              Dashboard
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
