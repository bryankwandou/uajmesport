import Image from "next/image";
import { Reveal } from "./Reveal";
import { letterhead, legal } from "@/lib/content";

/* Reproduction of the official UKM E-Sport letterhead (kop surat) exactly as it
   appears on the SK and AD/ART documents: two official logos flanking the three
   organisation lines, above a rule. The documents carry no address line, so the
   secretariat address is shown separately and labelled by its actual source
   rather than presented as part of the letterhead. */
export function Letterhead() {
  return (
    <section id="legalitas" className="mx-auto max-w-6xl px-5 py-24">
      <div className="mx-auto max-w-2xl text-center">
        <span className="chip clip-corner inline-block px-3 py-1 text-xs uppercase tracking-wider text-[color:var(--muted)]">
          Legalitas
        </span>
        <h2 className="mt-4 font-display text-3xl font-extrabold uppercase tracking-tight text-[color:var(--text)] md:text-4xl">
          Kop surat <span className="gradient-text">resmi</span>
        </h2>
        <p className="mt-4 normal-case text-[color:var(--faint)]">
          Identitas persuratan resmi organisasi beserta dasar hukum penetapannya.
        </p>
      </div>

      <Reveal className="mx-auto mt-12 max-w-3xl">
        {/* Rendered on paper white, the way the document itself prints. */}
        <div className="clip-corner overflow-hidden rounded-lg bg-white p-8 ring-1 ring-black/10 md:p-10">
          <div className="flex items-center justify-between gap-4">
            <Image
              src="/uajm-logo.png"
              alt="Segel resmi Universitas Atma Jaya Makassar"
              width={84}
              height={84}
              className="h-[58px] w-auto shrink-0 object-contain md:h-[84px]"
            />
            <div className="min-w-0 text-center font-serif leading-tight text-neutral-900">
              <div className="text-xs font-bold uppercase tracking-[0.04em] md:text-lg">
                {letterhead.line1}
              </div>
              <div className="mt-1 text-sm font-bold uppercase tracking-[0.04em] md:text-2xl">
                {letterhead.line2}
              </div>
              <div className="mt-1 text-xs font-bold uppercase tracking-[0.02em] md:text-lg">
                {letterhead.line3}
              </div>
            </div>
            <Image
              src="/ukm-esport-logo.png"
              alt="Logo resmi UKM E-Sport UAJM"
              width={84}
              height={84}
              className="h-[58px] w-auto shrink-0 object-contain md:h-[84px]"
            />
          </div>

          {/* The document rules this block with a box, not a single line. */}
          <div className="mt-4 border border-neutral-800 px-4 py-2.5">
            <p className="text-center font-serif text-[10px] leading-relaxed text-neutral-900 md:text-xs">
              Sekretariat : {letterhead.secretariat} &nbsp;|&nbsp; Alamat : {letterhead.address}
              &nbsp;|&nbsp; Email : {letterhead.email}
            </p>
          </div>
        </div>
      </Reveal>

      <Reveal className="mx-auto mt-6 max-w-3xl">
        <div className="grid gap-3 sm:grid-cols-2">
          {legal.map((l) => (
            <div key={l.label} className="glass flex items-baseline justify-between gap-4 p-4">
              <span className="text-[10px] uppercase tracking-widest text-[color:var(--faint)]">{l.label}</span>
              <span className="text-end font-mono text-[11px] text-[color:var(--muted)]">{l.value}</span>
            </div>
          ))}
        </div>
        <p className="mt-4 text-center font-mono text-[10px] leading-relaxed text-[color:var(--faint)]">
          {letterhead.sourceNote}
        </p>
      </Reveal>
    </section>
  );
}
