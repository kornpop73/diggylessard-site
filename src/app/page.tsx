const releases = [
  {
    title: "New music",
    detail: "A sparse, late-night sound built around voice, guitar, and slow-burning texture.",
    meta: "Release details coming soon",
  },
  {
    title: "Live sessions",
    detail: "Stripped-down recordings and intimate performance cuts from the room where the songs begin.",
    meta: "In progress",
  },
];

const shows = [
  {
    city: "Announcing soon",
    venue: "Live dates are being assembled",
    date: "2026",
  },
  {
    city: "Booking open",
    venue: "Clubs, rooms, listening spaces",
    date: "Now",
  },
];

const socialLinks = ["Instagram", "YouTube", "Spotify", "Contact"];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#080808] text-stone-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.13),transparent_34%),linear-gradient(180deg,rgba(115,95,70,0.16),transparent_42%)]" />
      <div className="pointer-events-none fixed inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,0.7)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.7)_1px,transparent_1px)] [background-size:72px_72px]" />

      <div className="relative mx-auto flex w-full max-w-7xl flex-col px-5 py-6 sm:px-8 lg:px-10">
        <header className="animate-rise flex items-center justify-between border-b border-white/10 pb-5 text-xs uppercase tracking-[0.34em] text-stone-400">
          <a href="#home" className="text-stone-100">
            Diggy Lessard
          </a>
          <nav className="hidden gap-8 sm:flex">
            <a className="transition hover:text-stone-100" href="#music">
              Music
            </a>
            <a className="transition hover:text-stone-100" href="#shows">
              Shows
            </a>
            <a className="transition hover:text-stone-100" href="#contact">
              Contact
            </a>
          </nav>
        </header>

        <section
          id="home"
          className="grid min-h-[calc(100vh-88px)] items-center gap-12 py-16 md:grid-cols-[1.08fr_0.92fr] md:py-24"
        >
          <div className="animate-rise max-w-4xl [animation-delay:120ms]">
            <p className="mb-6 text-sm uppercase tracking-[0.42em] text-amber-200/70">
              Songs for dim rooms and long drives
            </p>
            <h1 className="text-balance text-6xl font-semibold leading-[0.9] tracking-[-0.06em] text-stone-50 sm:text-7xl md:text-8xl lg:text-9xl">
              Diggy Lessard
            </h1>
            <p className="mt-8 max-w-2xl text-lg leading-8 text-stone-300 sm:text-xl">
              Minimalist folk rock with cinematic shadows, close-mic vocals, and
              a pulse that waits until the room goes quiet.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <a
                href="#music"
                className="rounded-full bg-stone-100 px-6 py-3 text-center text-sm font-semibold uppercase tracking-[0.18em] text-stone-950 transition hover:bg-amber-200"
              >
                Listen soon
              </a>
              <a
                href="#contact"
                className="rounded-full border border-white/20 px-6 py-3 text-center text-sm font-semibold uppercase tracking-[0.18em] text-stone-100 transition hover:border-amber-200/80 hover:text-amber-100"
              >
                Booking
              </a>
            </div>
          </div>

          <div className="animate-rise relative min-h-[430px] overflow-hidden border border-white/10 bg-stone-950/70 p-5 shadow-2xl shadow-black/50 [animation-delay:240ms]">
            <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.12),transparent_26%,rgba(218,177,108,0.18)_52%,transparent_72%)]" />
            <div className="absolute left-1/2 top-10 h-72 w-px bg-amber-200/40 blur-[1px]" />
            <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black to-transparent" />
            <div className="relative flex h-full min-h-[390px] flex-col justify-between">
              <div className="flex justify-between text-xs uppercase tracking-[0.32em] text-stone-400">
                <span>Studio</span>
                <span>Low light</span>
              </div>
              <div className="space-y-4">
                <div className="h-28 w-full border-y border-white/15 [background:repeating-linear-gradient(90deg,transparent_0_12px,rgba(255,255,255,0.18)_12px_13px,transparent_13px_26px)]" />
                <p className="max-w-sm text-2xl font-medium leading-tight tracking-[-0.03em] text-stone-100">
                  New recordings are taking shape in the negative space.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="music" className="border-t border-white/10 py-16 md:py-24">
          <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-sm uppercase tracking-[0.36em] text-amber-200/70">
                Music
              </p>
              <h2 className="mt-3 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
                Releases
              </h2>
            </div>
            <p className="max-w-xl text-stone-400">
              A simple home for singles, sessions, and long-form pieces as they
              arrive.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {releases.map((release) => (
              <article
                className="group border border-white/10 bg-white/[0.03] p-6 transition duration-300 hover:border-amber-200/40 hover:bg-white/[0.06]"
                key={release.title}
              >
                <p className="text-xs uppercase tracking-[0.28em] text-stone-500">
                  {release.meta}
                </p>
                <h3 className="mt-8 text-3xl font-semibold tracking-[-0.04em]">
                  {release.title}
                </h3>
                <p className="mt-4 leading-7 text-stone-400">{release.detail}</p>
                <div className="mt-8 h-px w-full origin-left scale-x-50 bg-amber-200/50 transition duration-500 group-hover:scale-x-100" />
              </article>
            ))}
          </div>
        </section>

        <section id="shows" className="border-t border-white/10 py-16 md:py-24">
          <p className="text-sm uppercase tracking-[0.36em] text-amber-200/70">
            Shows
          </p>
          <h2 className="mt-3 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
            Live
          </h2>
          <div className="mt-10 divide-y divide-white/10 border-y border-white/10">
            {shows.map((show) => (
              <article
                className="grid gap-3 py-6 text-stone-300 sm:grid-cols-[0.5fr_1fr_0.35fr] sm:items-center"
                key={`${show.city}-${show.date}`}
              >
                <p className="text-xl font-medium text-stone-50">{show.city}</p>
                <p className="text-stone-400">{show.venue}</p>
                <p className="text-left text-sm uppercase tracking-[0.24em] text-amber-200/70 sm:text-right">
                  {show.date}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section
          id="contact"
          className="grid gap-10 border-t border-white/10 py-16 md:grid-cols-[1fr_1fr] md:py-24"
        >
          <div>
            <p className="text-sm uppercase tracking-[0.36em] text-amber-200/70">
              Contact
            </p>
            <h2 className="mt-3 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
              Booking, press, and releases.
            </h2>
          </div>
          <div className="flex flex-col justify-end gap-6">
            <a
              href="mailto:booking@diggylessard.com"
              className="text-2xl font-medium tracking-[-0.03em] text-stone-100 transition hover:text-amber-100"
            >
              booking@diggylessard.com
            </a>
            <div className="flex flex-wrap gap-3">
              {socialLinks.map((link) => (
                <a
                  className="rounded-full border border-white/10 px-4 py-2 text-sm uppercase tracking-[0.18em] text-stone-300 transition hover:border-amber-200/60 hover:text-amber-100"
                  href={link === "Contact" ? "mailto:booking@diggylessard.com" : "#"}
                  key={link}
                >
                  {link}
                </a>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
