"use client";
import Image from "next/image";
import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { Reveal, Stagger, StaggerItem } from "@/components/Reveal";
import { Letterhead } from "@/components/Letterhead";
import { Certificates } from "@/components/Certificates";
import { LogoMark } from "@/components/Logo";
import { useApp } from "@/components/Providers";
import {
  org, vision, missions, trophies, games, ranks, faculties, timeline, structure, values, links,
  contact, certificates,
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
      <Letterhead />
      <CTA />
      <Footer />
    </main>
  );
}

function Marquee() {
  const words = ["Mobile Legends", "Sportivitas", "Starboy Esport", "Lintas Fakultas", "1v1 Champion", "Resmi & Terstruktur", "Komunitas", "Web3 Ready"];
  const row = [...words, ...words];
  return (
    <div className="relative overflow-hidden border-y border-[color:var(--border)] py-4">
      <div className="marquee-track flex w-max gap-10 whitespace-nowrap">
        {row.map((w, i) => (
          <span key={i} className="flex items-center gap-10 text-sm text-[color:var(--faint)]">
            <span>{w}</span>
            <span className="text-[color:var(--crimson)]">▸</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function SectionHead({ kicker, title, sub }: { kicker: string; title: React.ReactNode; sub?: string }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <span className="chip clip-corner inline-block px-3 py-1 text-xs uppercase tracking-wider text-[color:var(--muted)]">{kicker}</span>
      <h2 className="mt-4 font-display text-3xl font-extrabold uppercase tracking-tight text-[color:var(--text)] md:text-4xl">{title}</h2>
      {sub && <p className="mt-4 normal-case text-[color:var(--faint)]">{sub}</p>}
    </div>
  );
}

function About() {
  const { t } = useApp();
  const a = t.about;
  return (
    <section id="tentang" className="mx-auto max-w-6xl px-5 py-24">
      <SectionHead kicker={a.kicker} title={<>{a.title} <span className="gradient-text">{a.titleEm}</span></>} />
      <Reveal delay={0.05} className="mx-auto mt-10 max-w-3xl">
        <div className="glass clip-corner p-8 text-center">
          <div className="text-[10px] uppercase tracking-[0.25em] text-[color:var(--crimson)]">{a.visionLabel}</div>
          <p className="mt-3 text-lg leading-relaxed text-[color:var(--text)] md:text-xl">{vision}</p>
          <div className="mt-3 text-xs text-[color:var(--faint)]">{a.visionRef}</div>
        </div>
      </Reveal>
      <Stagger className="mt-6 grid gap-4 md:grid-cols-2">
        {missions.map((m, i) => (
          <StaggerItem key={i}>
            <div className="glass flex h-full items-start gap-4 p-6">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-[color:var(--border)] bg-gradient-to-br from-crimson-glow/25 to-ember-glow/10 font-display text-sm font-bold text-[color:var(--text)]">
                {i + 1}
              </div>
              <p className="text-sm leading-relaxed text-[color:var(--muted)]">{m}</p>
            </div>
          </StaggerItem>
        ))}
      </Stagger>
      <Stagger className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {values.map((v, i) => (
          <StaggerItem key={v.title}>
            <div className="glass h-full p-5">
              <h3 className="font-display text-sm font-bold uppercase tracking-wide text-[color:var(--text)]">{t.values[i].title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-[color:var(--faint)]">{t.values[i].body}</p>
            </div>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}

function Prestasi() {
  const { t } = useApp();
  const a = t.ach;
  return (
    <section id="prestasi" className="mx-auto max-w-6xl px-5 py-24">
      <SectionHead
        kicker={a.kicker}
        title={<>{a.title} <span className="gradient-text">{a.titleEm}</span></>}
        sub={a.sub}
      />
      <Stagger className="mt-12 grid gap-5 md:grid-cols-3">
        {trophies.map((t) => (
          <StaggerItem key={t.title}>
            <div className="glass clip-corner group relative h-full overflow-hidden p-6">
              <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-crimson-glow/15 blur-2xl duration-300 [transition-property:background-color] group-hover:bg-crimson-glow/30" />
              <div className="font-display text-5xl">🏆</div>
              <h3 className="mt-4 font-display text-xl font-extrabold uppercase text-[color:var(--text)]">{t.title}</h3>
              <p className="mt-2 text-sm text-[color:var(--muted)]">{t.event}</p>
              <div className="mt-4 flex items-center justify-between border-t border-[color:var(--border)] pt-4 text-xs text-[color:var(--faint)]">
                <span className="chip px-2 py-0.5">{t.mode}</span>
                <span className="font-mono">{t.date}</span>
              </div>
            </div>
          </StaggerItem>
        ))}
      </Stagger>

      <Certificates />
      <Reveal className="mt-5">
        <p className="text-center font-mono text-[11px] text-[color:var(--faint)]">
          {structure.lead.name} · {a.note}
        </p>
      </Reveal>
    </section>
  );
}

function Komunitas() {
  const { t } = useApp();
  const c = t.com;
  const max = Math.max(...games.map((g) => g.count));
  return (
    <section id="komunitas" className="mx-auto max-w-6xl px-5 py-24">
      <SectionHead
        kicker={c.kicker}
        title={<>{c.title} <span className="gradient-text">{c.titleEm}</span></>}
        sub={c.sub}
      />
      <div className="mt-12 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Reveal>
          <div className="glass p-7">
            <h3 className="font-display text-sm font-bold uppercase tracking-wide text-[color:var(--muted)]">{c.games}</h3>
            <div className="mt-6 space-y-4">
              {games.map((g) => (
                <div key={g.name}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[color:var(--muted)]">{g.name}</span>
                    <span className="font-mono text-[color:var(--faint)]">{g.count}</span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-[color:var(--surface)]">
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
              <h3 className="font-display text-sm font-bold uppercase tracking-wide text-[color:var(--muted)]">{c.ranks}</h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {ranks.map((r) => (
                  <span key={r} className="chip clip-corner px-3 py-1.5 text-xs text-[color:var(--muted)]">{r}</span>
                ))}
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="glass p-7">
              <h3 className="font-display text-sm font-bold uppercase tracking-wide text-[color:var(--muted)]">{c.faculties}</h3>
              <div className="mt-4 grid grid-cols-3 gap-3">
                {faculties.map((f) => (
                  <div key={f.name} className="text-center">
                    <div className="font-display text-2xl font-extrabold text-[color:var(--text)]">{f.count}</div>
                    <div className="mt-1 text-[10px] leading-tight text-[color:var(--faint)]">{f.name}</div>
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
                <div className="font-mono text-sm font-semibold text-[color:var(--crimson)]">{t.date}</div>
              </div>
              <div className="relative border-l border-[color:var(--border)] pb-8 pl-6">
                <span className="absolute -left-[7px] top-1.5 h-3.5 w-3.5 rounded-sm border-2 border-[color:var(--bg)] bg-gradient-to-br from-ember-glow to-crimson-glow" />
                <h3 className="font-display text-lg font-bold uppercase text-[color:var(--text)]">{t.title}</h3>
                <p className="mt-1.5 normal-case text-sm leading-relaxed text-[color:var(--faint)]">{t.body}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function Pengurus() {
  const { t } = useApp();
  const o = t.officers;
  return (
    <section id="pengurus" className="mx-auto max-w-6xl px-5 py-24">
      <SectionHead
        kicker={o.kicker}
        title={<>{o.title} <span className="gradient-text">{o.titleEm}</span></>}
        sub={org.sk}
      />
      <Reveal delay={0.05} className="mx-auto mt-10 max-w-2xl">
        <div className="glass clip-corner p-7 text-center">
          <div className="text-[10px] uppercase tracking-[0.25em] text-[color:var(--faint)]">{structure.lead.role}</div>
          <div className="mt-2 font-display text-2xl font-extrabold text-[color:var(--text)]">{structure.lead.name}</div>
          <div className="mt-1 text-sm text-[color:var(--faint)]">{structure.lead.prodi}</div>
        </div>
      </Reveal>
      <div className="mx-auto mt-4 grid max-w-2xl gap-4 sm:grid-cols-2">
        {structure.core.map((c) => (
          <Reveal key={c.role}>
            <div className="glass p-5 text-center">
              <div className="text-[10px] uppercase tracking-widest text-[color:var(--faint)]">{c.role}</div>
              <div className="mt-1.5 font-display text-base font-bold text-[color:var(--text)]">{c.name}</div>
            </div>
          </Reveal>
        ))}
      </div>
      <Stagger className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {structure.divisions.map((d) => (
          <StaggerItem key={d.name}>
            <div className="glass h-full p-5">
              <div className="text-[10px] uppercase tracking-widest text-[color:var(--crimson)]">{o.division}</div>
              <h3 className="mt-1.5 font-display text-sm font-bold text-[color:var(--text)]">{d.name}</h3>
              <p className="mt-2 text-xs text-[color:var(--faint)]">{o.coordinator} · {d.coord}</p>
            </div>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}

function CTA() {
  const { t } = useApp();
  const c = t.cta;
  return (
    <section className="mx-auto max-w-6xl px-5 py-20">
      <Reveal>
        <div className="glass clip-corner relative overflow-hidden p-10 text-center md:p-16">
          <div className="pointer-events-none absolute inset-0 bg-grid opacity-40" />
          <div className="relative">
            <div className="text-[10px] uppercase tracking-[0.25em] text-[color:var(--crimson)]">{c.kicker}</div>
            <h2 className="mt-3 font-display text-3xl font-extrabold uppercase tracking-tight text-[color:var(--text)] md:text-4xl">
              {c.title} <span className="gradient-text">{c.titleEm}</span>
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-[color:var(--muted)]">
              {c.lede}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <a href={links.register} target="_blank" rel="noopener noreferrer" className="btn-primary clip-corner px-6 py-3 text-sm">
                {c.register}
              </a>
              <a href={links.instagram} target="_blank" rel="noopener" className="clip-corner border border-[color:var(--border)] px-6 py-3 text-sm text-[color:var(--text)] transition-colors hover:border-[color:var(--border)] hover:text-[color:var(--text)]">
                {c.instagram}
              </a>
              <a href={`https://${org.domainBcc}`} target="_blank" rel="noopener" className="clip-corner border border-[color:var(--border)] px-6 py-3 text-sm text-[color:var(--text)] transition-colors hover:border-[color:var(--border)] hover:text-[color:var(--text)]">
                {c.bcc} ↗
              </a>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

function Footer() {
  const { t } = useApp();
  const f = t.footer;
  return (
    <footer id="kontak" className="border-t border-[color:var(--border)] px-5 py-14">
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[1.2fr_1fr_0.9fr]">
        <div>
          <div className="flex items-center gap-3">
            <LogoMark size={34} />
            <div>
              <div className="font-display text-sm font-extrabold text-[color:var(--text)]">{org.name}</div>
              <div className="text-xs text-[color:var(--faint)]">{org.short}</div>
            </div>
          </div>
          <p className="mt-4 max-w-xs text-xs leading-relaxed text-[color:var(--faint)]">{org.full}.</p>
        </div>

        <div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-[color:var(--crimson)]">{f.contact}</div>
          <address className="mt-3 space-y-2 text-sm not-italic leading-relaxed text-[color:var(--muted)]">
            <div>{contact.secretariat}</div>
            <div>{contact.address}</div>
            <div>
              Email{" "}
              <a href={contact.emailHref} className="hover:text-[color:var(--text)]">{contact.email}</a>
            </div>
            <div>
              {f.phone} <a href={`tel:${contact.phone.replace(/[^0-9]/g, "")}`} className="hover:text-[color:var(--text)]">{contact.phone}</a>
            </div>
            <div>
              {f.whatsapp}{" "}
              <a href={contact.whatsappHref} target="_blank" rel="noopener noreferrer" className="hover:text-[color:var(--text)]">
                {contact.whatsapp}
              </a>
            </div>
          </address>
        </div>

        <div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-[color:var(--faint)]">{f.links}</div>
          <div className="mt-3 flex flex-col gap-2 text-sm text-[color:var(--muted)]">
            <a href={links.register} target="_blank" rel="noopener noreferrer" className="hover:text-[color:var(--text)]">{t.cta.register}</a>
            <a href={links.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-[color:var(--text)]">Instagram @uajm_esport</a>
            <a href={`https://${org.domainBcc}`} target="_blank" rel="noopener noreferrer" className="hover:text-[color:var(--text)]">UAJM BCC ↗</a>
          </div>
        </div>
      </div>
      <div className="mx-auto mt-10 max-w-6xl border-t border-[color:var(--border)] pt-6 text-center text-xs text-[color:var(--faint)]">
        © {new Date().getFullYear()} {org.full}. {org.period}.
      </div>
    </footer>
  );
}
