import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { Reveal, Stagger, StaggerItem } from "@/components/Reveal";
import { InstagramFeed } from "@/components/InstagramFeed";
import { LogoMark } from "@/components/Logo";
import {
  org, vision, missions, trophies, games, ranks, faculties, timeline, structure, values, links,
} from "@/lib/content";

export default function Home() {
  return (
    <main className="bg-field relative min-h-screen">
      <Nav />
      <Hero />
      <Marquee />
      <About />
      <Prestasi />
      <Komunitas />
      <Journey />
      <Pengurus />
      <InstagramFeed />
      <CTA />
      <Footer />
    </main>
  );
}

function Marquee() {
  const words = ["Mobile Legends", "Sportivitas", "Starboy Esport", "Lintas Fakultas", "1v1 Champion", "Resmi & Terstruktur", "Komunitas", "Web3 Ready"];
  const row = [...words, ...words];
  return (
    <div className="relative overflow-hidden border-y border-white/6 py-4">
      <div className="marquee-track flex w-max gap-10 whitespace-nowrap">
        {row.map((w, i) => (
          <span key={i} className="flex items-center gap-10 text-sm text-white/35">
            <span>{w}</span>
            <span className="text-crimson-glow/60">▸</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function SectionHead({ kicker, title, sub }: { kicker: string; title: React.ReactNode; sub?: string }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <span className="chip clip-corner inline-block px-3 py-1 text-xs uppercase tracking-wider text-white/60">{kicker}</span>
      <h2 className="mt-4 font-display text-3xl font-extrabold uppercase tracking-tight text-white md:text-4xl">{title}</h2>
      {sub && <p className="mt-4 normal-case text-white/55">{sub}</p>}
    </div>
  );
}

function About() {
  return (
    <section id="tentang" className="mx-auto max-w-6xl px-5 py-24">
      <SectionHead kicker="Visi & Misi" title={<>Wadah <span className="gradient-text">resmi</span> mahasiswa</>} />
      <Reveal delay={0.05} className="mx-auto mt-10 max-w-3xl">
        <div className="glass clip-corner p-8 text-center">
          <div className="text-[10px] uppercase tracking-[0.25em] text-crimson-glow/90">Visi</div>
          <p className="mt-3 text-lg leading-relaxed text-white/85 md:text-xl">{vision}</p>
          <div className="mt-3 text-xs text-white/35">AD/ART Pasal 6 · SK No. 002/XII/2025</div>
        </div>
      </Reveal>
      <Stagger className="mt-6 grid gap-4 md:grid-cols-2">
        {missions.map((m, i) => (
          <StaggerItem key={i}>
            <div className="glass flex h-full items-start gap-4 p-6">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-white/10 bg-gradient-to-br from-crimson-glow/25 to-ember-glow/10 font-display text-sm font-bold text-white">
                {i + 1}
              </div>
              <p className="text-sm leading-relaxed text-white/70">{m}</p>
            </div>
          </StaggerItem>
        ))}
      </Stagger>
      <Stagger className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {values.map((v) => (
          <StaggerItem key={v.title}>
            <div className="glass h-full p-5">
              <h3 className="font-display text-sm font-bold uppercase tracking-wide text-white">{v.title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-white/50">{v.body}</p>
            </div>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}

function Prestasi() {
  return (
    <section id="prestasi" className="mx-auto max-w-6xl px-5 py-24">
      <SectionHead
        kicker="Prestasi"
        title={<>Gelar yang <span className="gradient-text">terbukti</span></>}
        sub="Tiga gelar 1v1 Mobile Legends dari Titans Organizer: Fighter, Marksman, dan Assassin."
      />
      <Stagger className="mt-12 grid gap-5 md:grid-cols-3">
        {trophies.map((t) => (
          <StaggerItem key={t.title}>
            <div className="glass clip-corner group relative h-full overflow-hidden p-6">
              <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-crimson-glow/15 blur-2xl duration-300 [transition-property:background-color] group-hover:bg-crimson-glow/30" />
              <div className="font-display text-5xl">🏆</div>
              <h3 className="mt-4 font-display text-xl font-extrabold uppercase text-white">{t.title}</h3>
              <p className="mt-2 text-sm text-white/60">{t.event}</p>
              <div className="mt-4 flex items-center justify-between border-t border-white/8 pt-4 text-xs text-white/45">
                <span className="chip px-2 py-0.5">{t.mode}</span>
                <span className="font-mono">{t.date}</span>
              </div>
            </div>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}

function Komunitas() {
  const max = Math.max(...games.map((g) => g.count));
  return (
    <section id="komunitas" className="mx-auto max-w-6xl px-5 py-24">
      <SectionHead
        kicker="Komunitas"
        title={<>Satu klub, <span className="gradient-text">banyak arena</span></>}
        sub="Komposisi game & rank tertinggi dari data pendaftaran resmi, lintas 3 fakultas."
      />
      <div className="mt-12 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Reveal>
          <div className="glass p-7">
            <h3 className="font-display text-sm font-bold uppercase tracking-wide text-white/70">Game paling dimainkan</h3>
            <div className="mt-6 space-y-4">
              {games.map((g) => (
                <div key={g.name}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/75">{g.name}</span>
                    <span className="font-mono text-white/45">{g.count}</span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/5">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-crimson-glow to-ember-glow"
                      style={{ width: `${(g.count / max) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
        <div className="flex flex-col gap-6">
          <Reveal delay={0.1}>
            <div className="glass p-7">
              <h3 className="font-display text-sm font-bold uppercase tracking-wide text-white/70">Rank tertinggi anggota</h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {ranks.map((r) => (
                  <span key={r} className="chip clip-corner px-3 py-1.5 text-xs text-white/70">{r}</span>
                ))}
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="glass p-7">
              <h3 className="font-display text-sm font-bold uppercase tracking-wide text-white/70">Lintas fakultas</h3>
              <div className="mt-4 grid grid-cols-3 gap-3">
                {faculties.map((f) => (
                  <div key={f.name} className="text-center">
                    <div className="font-display text-2xl font-extrabold text-white">{f.count}</div>
                    <div className="mt-1 text-[10px] leading-tight text-white/45">{f.name}</div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Journey() {
  return (
    <section id="perjalanan" className="mx-auto max-w-4xl px-5 py-24">
      <SectionHead kicker="Perjalanan" title={<>Dari Starboy ke <span className="gradient-text">UKM resmi</span></>} />
      <div className="mt-14 space-y-2">
        {timeline.map((t, i) => (
          <Reveal key={t.date} delay={i * 0.05}>
            <div className="grid grid-cols-[110px_1fr] gap-5 md:grid-cols-[150px_1fr]">
              <div className="pt-1 text-right">
                <div className="font-mono text-sm font-semibold text-crimson-glow/90">{t.date}</div>
              </div>
              <div className="relative border-l border-white/10 pb-8 pl-6">
                <span className="absolute -left-[7px] top-1.5 h-3.5 w-3.5 rounded-sm border-2 border-ink-950 bg-gradient-to-br from-ember-glow to-crimson-glow" />
                <h3 className="font-display text-lg font-bold uppercase text-white">{t.title}</h3>
                <p className="mt-1.5 normal-case text-sm leading-relaxed text-white/55">{t.body}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function Pengurus() {
  return (
    <section id="pengurus" className="mx-auto max-w-6xl px-5 py-24">
      <SectionHead
        kicker="Pengurus 2025/2026"
        title={<>Struktur <span className="gradient-text">kepengurusan</span></>}
        sub={org.sk}
      />
      <Reveal delay={0.05} className="mx-auto mt-10 max-w-2xl">
        <div className="glass clip-corner p-7 text-center">
          <div className="text-[10px] uppercase tracking-[0.25em] text-white/40">{structure.lead.role}</div>
          <div className="mt-2 font-display text-2xl font-extrabold text-white">{structure.lead.name}</div>
          <div className="mt-1 text-sm text-white/50">{structure.lead.prodi}</div>
        </div>
      </Reveal>
      <div className="mx-auto mt-4 grid max-w-2xl gap-4 sm:grid-cols-2">
        {structure.core.map((c) => (
          <Reveal key={c.role}>
            <div className="glass p-5 text-center">
              <div className="text-[10px] uppercase tracking-widest text-white/40">{c.role}</div>
              <div className="mt-1.5 font-display text-base font-bold text-white">{c.name}</div>
            </div>
          </Reveal>
        ))}
      </div>
      <Stagger className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {structure.divisions.map((d) => (
          <StaggerItem key={d.name}>
            <div className="glass h-full p-5">
              <div className="text-[10px] uppercase tracking-widest text-crimson-glow/80">Divisi</div>
              <h3 className="mt-1.5 font-display text-sm font-bold text-white">{d.name}</h3>
              <p className="mt-2 text-xs text-white/50">Koordinator · {d.coord}</p>
            </div>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}

function CTA() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-20">
      <Reveal>
        <div className="glass clip-corner relative overflow-hidden p-10 text-center md:p-16">
          <div className="pointer-events-none absolute inset-0 bg-grid opacity-40" />
          <div className="relative">
            <div className="text-[10px] uppercase tracking-[0.25em] text-crimson-glow/90">Pendaftaran Anggota 2026/2027</div>
            <h2 className="mt-3 font-display text-3xl font-extrabold uppercase tracking-tight text-white md:text-4xl">
              Saatnya <span className="gradient-text">naik level</span>
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-white/60">
              Mahasiswa UAJM yang ingin berkompetisi, berlatih, atau membangun komunitas, silakan mendaftar sebagai anggota UKM E-Sport.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <a href={links.register} target="_blank" rel="noopener noreferrer" className="btn-primary clip-corner px-6 py-3 text-sm">
                Daftar Anggota 2026/2027
              </a>
              <a href={links.instagram} target="_blank" rel="noopener" className="clip-corner border border-white/12 px-6 py-3 text-sm text-white/80 transition-colors hover:border-white/30 hover:text-white">
                Instagram @uajm_esport
              </a>
              <a href={`https://${org.domainBcc}`} target="_blank" rel="noopener" className="clip-corner border border-white/12 px-6 py-3 text-sm text-white/80 transition-colors hover:border-white/30 hover:text-white">
                Divisi Web3 (BCC) ↗
              </a>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/6 px-5 py-12">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 md:flex-row">
        <div className="flex items-center gap-3">
          <LogoMark size={30} />
          <div>
            <div className="font-display text-sm font-extrabold text-white">{org.name}</div>
            <div className="text-xs text-white/40">{org.location}</div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/50">
          <a href={links.instagram} target="_blank" rel="noopener" className="hover:text-white">Instagram</a>
          <a href={links.campus} target="_blank" rel="noopener" className="hover:text-white">UAJM</a>
          <a href={`https://${org.domainBcc}`} target="_blank" rel="noopener" className="hover:text-white">UAJM BCC ↗</a>
        </div>
      </div>
      <div className="mx-auto mt-8 max-w-6xl border-t border-white/6 pt-6 text-center text-xs text-white/30">
        © {new Date().getFullYear()} {org.full}. {org.period}.
      </div>
    </footer>
  );
}
