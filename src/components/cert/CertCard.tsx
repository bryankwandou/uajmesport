"use client";
import { useEffect, useState } from "react";
import { convert, downloadName, formatsFor, previewUrl, saveBlob, type Format } from "@/lib/convert";
import type { CertRecord } from "@/lib/certstore";
import { recordBytes } from "@/lib/certstore";
import type { CertDict } from "@/lib/certdict";

const LABEL: Record<Format, string> = {
  pdf: "PDF",
  png: "PNG",
  jpg: "JPG",
  jpeg: "JPEG",
  webp: "WEBP",
};

/* One claimed certificate: the document itself on the left, what it says and
   how to take it away on the right. The preview is rendered from the stored
   bytes, PDFs included, so the member sees the actual sheet before choosing a
   format rather than a filename and a guess. */
export function CertCard({ rec, d }: { rec: CertRecord; d: CertDict }) {
  const [preview, setPreview] = useState<string | null>(null);
  const [previewFailed, setPreviewFailed] = useState(false);
  const [busy, setBusy] = useState<Format | "original" | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let url: string | null = null;
    let live = true;
    previewUrl(rec)
      .then((u) => {
        if (!live) {
          URL.revokeObjectURL(u);
          return;
        }
        url = u;
        setPreview(u);
      })
      .catch(() => live && setPreviewFailed(true));
    return () => {
      live = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [rec]);

  const formats = formatsFor(rec);

  async function take(fmt: Format) {
    setError("");
    setBusy(fmt);
    try {
      saveBlob(await convert(rec, fmt), downloadName(rec, fmt));
    } catch (e) {
      setError(e instanceof Error ? e.message : d.err.generic);
    } finally {
      setBusy(null);
    }
  }

  async function takeOriginal() {
    setError("");
    setBusy("original");
    try {
      const bytes = await recordBytes(rec);
      saveBlob(new Blob([bytes.slice().buffer as ArrayBuffer], { type: rec.mime }), rec.fileName);
    } catch (e) {
      setError(e instanceof Error ? e.message : d.err.generic);
    } finally {
      setBusy(null);
    }
  }

  return (
    <article className="panel clip-corner overflow-hidden">
      <div className="grid gap-0 md:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
        <div className="relative min-h-[220px] border-b border-[color:var(--border)] bg-[color:var(--surface-2)] p-4 md:border-b-0 md:border-r">
          {preview ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={preview}
              alt={`${rec.title} — ${rec.fullName}`}
              className="mx-auto h-auto w-full max-w-full rounded object-contain"
            />
          ) : previewFailed ? (
            <p className="grid h-full place-items-center p-6 text-center text-xs leading-relaxed text-[color:var(--faint)]">
              {d.res.noPreview}
            </p>
          ) : (
            <div
              aria-label={d.res.preview}
              className="h-full min-h-[200px] w-full animate-pulseglow rounded bg-[color:var(--surface)]"
            />
          )}
        </div>

        <div className="p-6">
          <h3 className="font-display text-lg font-extrabold uppercase leading-tight tracking-tight text-[color:var(--text)]">
            {rec.title}
          </h3>
          <p className="mt-1.5 text-sm leading-relaxed text-[color:var(--muted)]">{rec.event}</p>

          <dl className="mt-5 space-y-2 border-t border-[color:var(--border)] pt-4 text-xs">
            <Row label={d.form.name} value={rec.fullName} />
            <Row label={d.form.nim} value={rec.nim} mono />
            <Row label={d.res.issued} value={rec.issuedAt} />
            {rec.ref && <Row label={d.res.ref} value={rec.ref} mono />}
            <Row label={d.res.source} value={rec.fileName} mono />
          </dl>

          {formats.length > 0 && (
            <>
              <div className="mt-6 text-[10px] uppercase tracking-[0.2em] text-[color:var(--crimson)]">
                {d.res.formats}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {formats.map((f, i) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => take(f)}
                    disabled={busy !== null}
                    className={
                      i === 0
                        ? "btn-primary clip-corner px-4 py-2 text-xs disabled:opacity-60"
                        : "clip-corner border border-[color:var(--border)] px-4 py-2 text-xs font-semibold text-[color:var(--text)] duration-200 ease-crisp [transition-property:border-color] hover:border-[color:var(--border-strong)] disabled:opacity-60"
                    }
                  >
                    {busy === f ? d.res.preparing : LABEL[f]}
                  </button>
                ))}
              </div>
            </>
          )}

          <button
            type="button"
            onClick={takeOriginal}
            disabled={busy !== null}
            className="link-quiet mt-4 inline-block text-xs text-[color:var(--muted)] underline decoration-[color:var(--border-strong)] underline-offset-4 hover:text-[color:var(--text)] disabled:opacity-60"
          >
            {busy === "original" ? d.res.preparing : d.res.original}
          </button>

          <p className="mt-4 text-[11px] leading-relaxed text-[color:var(--faint)]">{d.res.formatsNote}</p>
          {error && (
            <p role="alert" className="mt-3 text-xs text-[color:var(--crimson)]">
              {error}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}

function Row({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
      <dt className="text-[color:var(--faint)]">{label}</dt>
      <dd className={`text-right text-[color:var(--text)] ${mono ? "font-mono text-[11px]" : ""}`}>{value}</dd>
    </div>
  );
}
