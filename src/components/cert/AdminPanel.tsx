"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  adminList,
  deleteRecord,
  fileToBase64,
  hasFile,
  login,
  newId,
  publishedFileName,
  recordBytes,
  saveRecord,
  SLOTS,
  toPublishedJson,
  type CertRecord,
  type Session,
} from "@/lib/certstore";
import { saveBlob } from "@/lib/convert";
import { fill, type CertDict } from "@/lib/certdict";

/* Board dashboard.
 *
 * Three people put certificates on this site: the chair, the secretary and the
 * faculty supervisor. They share one dashboard with identical rights — every
 * control below is reachable by all three — but sign in separately, so the
 * panel can say who is working and one account can be revoked without locking
 * the other two out.
 *
 * The passwords are no longer in this file. CERT_ACCOUNTS lives in the server
 * environment and /api/admin/login does the comparison; what comes back is a
 * bearer token that every write below carries. Reading the page source no
 * longer hands anyone the keys.
 */
const SESSION_KEY = "uajmesport.cert.session";

type Draft = {
  id: string | null;
  fullName: string;
  nim: string;
  title: string;
  event: string;
  issuedAt: string;
  ref: string;
};

const emptyDraft: Draft = {
  id: null,
  fullName: "",
  nim: "",
  title: "",
  event: "",
  issuedAt: "",
  ref: "",
};

export function AdminPanel({
  d,
  onChanged,
  onClose,
}: {
  d: CertDict;
  onChanged: () => void;
  onClose: () => void;
}) {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (raw) setSession(JSON.parse(raw) as Session);
    } catch {
      /* storage unavailable, the gate simply asks again */
    }
  }, []);

  const signIn = useCallback((s: Session) => {
    setSession(s);
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(s));
    } catch {
      /* in-memory session still applies */
    }
  }, []);

  const signOut = useCallback(() => {
    setSession(null);
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch {
      /* nothing to clear */
    }
    onClose();
  }, [onClose]);

  return session ? (
    <Dashboard d={d} session={session} onChanged={onChanged} onSignOut={signOut} />
  ) : (
    <SignIn d={d} onSignedIn={signIn} onClose={onClose} />
  );
}

function SignIn({
  d,
  onSignedIn,
  onClose,
}: {
  d: CertDict;
  onSignedIn: (s: Session) => void;
  onClose: () => void;
}) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const s = await login(user.trim(), pass);
      if (s?.token) onSignedIn(s);
      else setError(d.admin.wrong);
    } catch {
      setError(d.err.generic);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="panel-feature clip-corner mx-auto max-w-md p-7">
      <div className="text-[10px] uppercase tracking-[0.25em] text-[color:var(--crimson)]">{d.admin.signIn}</div>
      <div className="mt-5 space-y-4">
        <Field label={d.admin.user}>
          <input value={user} onChange={(e) => setUser(e.target.value)} autoComplete="username" className={inputCls} />
        </Field>
        <Field label={d.admin.pass}>
          <input
            type="password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            autoComplete="current-password"
            className={inputCls}
          />
        </Field>
      </div>
      {error && (
        <p role="alert" className="mt-3 text-xs text-[color:var(--crimson)]">
          {error}
        </p>
      )}
      <div className="mt-6 flex items-center gap-3">
        <button type="submit" disabled={busy} className="btn-primary rounded px-5 py-2.5 text-xs disabled:opacity-60">
          {busy ? d.form.working : d.admin.enter}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="link-quiet text-xs text-[color:var(--muted)] hover:text-[color:var(--text)]"
        >
          {d.admin.cancel}
        </button>
      </div>
      <p className="mt-5 border-t border-[color:var(--border)] pt-4 text-[11px] leading-relaxed text-[color:var(--faint)]">
        {d.admin.note}
      </p>
    </form>
  );
}

function Dashboard({
  d,
  session,
  onChanged,
  onSignOut,
}: {
  d: CertDict;
  session: Session;
  onChanged: () => void;
  onSignOut: () => void;
}) {
  const [records, setRecords] = useState<CertRecord[]>([]);
  const [bytes, setBytes] = useState(0);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [file, setFile] = useState<File | null>(null);
  const [roster, setRoster] = useState("");
  const [query, setQuery] = useState("");
  const [dragId, setDragId] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const importRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  const reload = useCallback(async () => {
    try {
      const { records: rows, bytes: used } = await adminList(session.token);
      setRecords(rows);
      setBytes(used);
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : d.err.generic);
    }
  }, [session.token, onChanged, d.err.generic]);

  useEffect(() => {
    reload();
  }, [reload]);

  const set = (k: keyof Draft) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setDraft((v) => ({ ...v, [k]: e.target.value }));

  function reset() {
    setDraft(emptyDraft);
    setFile(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setStatus("");
    if (!draft.fullName.trim() || !draft.nim.trim()) {
      setError(d.err.empty);
      return;
    }
    setBusy(true);
    try {
      const existing = draft.id ? records.find((r) => r.id === draft.id) : undefined;
      const rec: CertRecord = {
        id: existing?.id ?? newId(),
        fullName: draft.fullName.trim(),
        nim: draft.nim.trim(),
        title: draft.title.trim() || "Sertifikat UKM E-Sport UAJM",
        event: draft.event.trim(),
        issuedAt: draft.issuedAt.trim(),
        ref: draft.ref.trim() || undefined,
        fileName: file ? file.name : existing?.fileName ?? "",
        mime: file ? file.type || "application/octet-stream" : existing?.mime ?? "",
        size: file ? file.size : existing?.size ?? 0,
        createdAt: existing?.createdAt ?? Date.now(),
      };
      await saveRecord(session.token, rec, file ? await fileToBase64(file) : null);
      reset();
      await reload();
      setStatus(d.admin.saved);
    } catch (err) {
      setError(err instanceof Error ? err.message : d.err.generic);
    } finally {
      setBusy(false);
    }
  }

  function edit(rec: CertRecord) {
    setDraft({
      id: rec.id,
      fullName: rec.fullName,
      nim: rec.nim,
      title: rec.title,
      event: rec.event,
      issuedAt: rec.issuedAt,
      ref: rec.ref ?? "",
    });
    setFile(null);
    if (fileRef.current) fileRef.current.value = "";
    setStatus("");
    setError("");
    // On a wide screen the form is already pinned in view; on a narrow one it
    // is not, and a board member editing the last of two hundred rows should
    // not have to hunt back up the page for it.
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.setTimeout(() => nameRef.current?.focus(), 260);
  }

  async function remove(rec: CertRecord) {
    if (!window.confirm(d.admin.delConfirm)) return;
    try {
      await deleteRecord(session.token, rec.id);
      if (draft.id === rec.id) reset();
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : d.err.generic);
    }
  }

  /* Dropping a file on a roster row is the whole upload. The board has the
     certificates in a folder and the names already typed; opening an edit form
     for each of two hundred people would be the slower path by far. */
  async function attach(rec: CertRecord, f: File) {
    setError("");
    setBusy(true);
    try {
      await saveRecord(
        session.token,
        { ...rec, fileName: f.name, mime: f.type || "application/octet-stream", size: f.size },
        await fileToBase64(f),
      );
      await reload();
      setStatus(d.admin.saved);
    } catch (err) {
      setError(err instanceof Error ? err.message : d.err.generic);
    } finally {
      setBusy(false);
    }
  }

  /* One paste fills the roster. Each line is a name and a NIM separated by a
     comma, a semicolon or a tab, which is what a copy out of the registration
     spreadsheet already looks like. */
  async function addRoster() {
    const lines = roster.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) return;
    setBusy(true);
    setError("");
    try {
      let n = 0;
      for (const line of lines) {
        const [name, nim] = line.split(/[,;\t]/).map((v) => v.trim());
        if (!name || !nim) continue;
        await saveRecord(
          session.token,
          {
            id: newId(),
            fullName: name,
            nim,
            title: "Sertifikat UKM E-Sport UAJM",
            event: "",
            issuedAt: "",
            fileName: "",
            mime: "",
            size: 0,
            createdAt: Date.now() + n,
          },
          null,
        );
        n++;
      }
      setRoster("");
      await reload();
      setStatus(d.admin.saved);
    } catch (err) {
      setError(err instanceof Error ? err.message : d.err.generic);
    } finally {
      setBusy(false);
    }
  }



  function exportJson() {
    saveBlob(new Blob([toPublishedJson(records)], { type: "application/json" }), "certificates.json");
    setStatus(d.admin.saved);
  }

  async function exportFiles() {
    setError("");
    setBusy(true);
    try {
      for (const r of records) {
        if (!hasFile(r)) continue;
        const out = await recordBytes(r);
        saveBlob(new Blob([out.slice().buffer as ArrayBuffer], { type: r.mime }), publishedFileName(r));
        await new Promise((res) => setTimeout(res, 250));
      }
      setStatus(d.admin.saved);
    } catch (err) {
      setError(err instanceof Error ? err.message : d.err.generic);
    } finally {
      setBusy(false);
    }
  }

  async function importJson(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setError("");
    setBusy(true);
    try {
      const rows: unknown = JSON.parse(await f.text());
      if (!Array.isArray(rows)) throw new Error("JSON harus berupa larik sertifikat.");
      for (const row of rows as CertRecord[]) {
        if (!row?.fullName || !row?.nim) continue;
        await saveRecord(session.token, { ...row, id: row.id || newId() }, null);
      }
      await reload();
      setStatus(d.admin.saved);
    } catch (err) {
      setError(err instanceof Error ? err.message : d.err.generic);
    } finally {
      setBusy(false);
      if (importRef.current) importRef.current.value = "";
    }
  }

  async function downloadFile(rec: CertRecord) {
    const b = await recordBytes(rec);
    saveBlob(new Blob([b.slice().buffer as ArrayBuffer], { type: rec.mime }), rec.fileName);
  }

  /* Matching the way the claim page does: case, spacing and punctuation must
     not decide whether a row is found. */
  const needle = query.normalize("NFKD").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  const shown = needle
    ? records.filter((r) =>
        [r.fullName, r.nim, r.title, r.event]
          .join(" ")
          .normalize("NFKD")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, " ")
          .includes(needle),
      )
    : records;

  const filled = records.length;
  const mb = (bytes / (1024 * 1024)).toFixed(1);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-[10px] uppercase tracking-[0.25em] text-[color:var(--crimson)]">{d.admin.title}</div>
          <h2 className="mt-2 font-display text-2xl font-extrabold uppercase tracking-tight text-[color:var(--text)]">
            {fill(d.admin.slots, { n: filled, t: SLOTS })}
          </h2>
          <p className="mt-1.5 text-xs text-[color:var(--faint)]">{d.admin.slotsNote}</p>
          <p className="mt-1 font-mono text-[11px] text-[color:var(--faint)]">
            {d.admin.signedInAs} {roleLabel(d, session.role)} · {fill(d.admin.storage, { mb })}
          </p>
        </div>
        <button
          type="button"
          onClick={onSignOut}
          className="rounded border border-[color:var(--muted)] px-4 py-2 text-xs font-medium text-[color:var(--text)] hover:bg-[color:var(--surface)]"
        >
          {d.admin.signOut}
        </button>
      </div>

      <div
        className="mt-6 h-2 w-full overflow-hidden rounded-full border border-[color:var(--border-strong)]"
        role="img"
        aria-label={fill(d.admin.slots, { n: filled, t: SLOTS })}
      >
        <div
          className="h-full bg-gradient-to-r from-crimson-glow to-ember-glow"
          style={{ width: `${Math.min(100, (filled / SLOTS) * 100)}%` }}
        />
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <ToolButton onClick={exportJson}>{d.admin.exportJson}</ToolButton>
        <ToolButton onClick={exportFiles} disabled={busy || records.length === 0}>
          {d.admin.exportFiles}
        </ToolButton>
        <ToolButton onClick={() => importRef.current?.click()}>{d.admin.importJson}</ToolButton>
        {/* No seed button and no bulk wipe. This registry holds documents the
            organisation has actually issued: a one-click injector of sample
            rows has no business next to them, and a button that deletes every
            certificate for everyone is not something a dashboard should offer.
            Corrections go through the per-row Ubah and Hapus. A genuine reset
            is a database task for whoever holds the credentials. */}
        <input ref={importRef} type="file" accept="application/json,.json" onChange={importJson} className="hidden" />
      </div>

      <div className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <form
          ref={formRef}
          onSubmit={save}
          className="panel clip-corner h-fit p-6 lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto"
        >
          <div className="text-[10px] uppercase tracking-[0.2em] text-[color:var(--faint)]">
            {draft.id ? d.admin.edit : d.admin.add}
          </div>
          <div className="mt-5 space-y-4">
            <Field label={d.admin.fName}>
              <input ref={nameRef} value={draft.fullName} onChange={set("fullName")} className={inputCls} required />
            </Field>
            <Field label={d.admin.fNim}>
              <input value={draft.nim} onChange={set("nim")} className={`${inputCls} font-mono`} required />
            </Field>
            <Field label={d.admin.fTitle}>
              <input value={draft.title} onChange={set("title")} className={inputCls} />
            </Field>
            <Field label={d.admin.fEvent}>
              <input value={draft.event} onChange={set("event")} className={inputCls} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={d.admin.fDate}>
                <input value={draft.issuedAt} onChange={set("issuedAt")} className={inputCls} />
              </Field>
              <Field label={d.admin.fRef}>
                <input value={draft.ref} onChange={set("ref")} className={`${inputCls} font-mono`} />
              </Field>
            </div>
            <Field label={d.admin.fFile}>
              <input
                ref={fileRef}
                type="file"
                accept="application/pdf,image/png,image/jpeg,image/webp"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="w-full text-xs text-[color:var(--muted)] file:mr-3 file:cursor-pointer file:border file:border-[color:var(--border)] file:bg-[color:var(--surface-2)] file:px-3 file:py-2 file:text-xs file:text-[color:var(--text)]"
              />
              {draft.id && <p className="mt-1.5 text-[11px] text-[color:var(--faint)]">{d.admin.fFileKeep}</p>}
            </Field>
          </div>

          {error && (
            <p role="alert" className="mt-4 text-xs text-[color:var(--crimson)]">
              {error}
            </p>
          )}
          {status && <p className="mt-4 text-xs text-[color:var(--muted)]">{status}</p>}

          <div className="mt-6 flex items-center gap-3">
            <button type="submit" disabled={busy} className="btn-primary rounded px-5 py-2.5 text-xs disabled:opacity-60">
              {draft.id ? d.admin.update : d.admin.save}
            </button>
            {draft.id && (
              <button
                type="button"
                onClick={reset}
                className="link-quiet text-xs text-[color:var(--muted)] hover:text-[color:var(--text)]"
              >
                {d.admin.cancel}
              </button>
            )}
          </div>
        </form>

        <div className="panel clip-corner p-6">
          <div className="text-[10px] uppercase tracking-[0.2em] text-[color:var(--faint)]">{d.admin.list}</div>
          <div className="mt-4 border-b border-[color:var(--border)] pb-5">
            <label className="block">
              <span className="mb-1.5 block text-[11px] uppercase tracking-wider text-[color:var(--faint)]">
                {d.admin.rosterLabel}
              </span>
              <textarea
                value={roster}
                onChange={(e) => setRoster(e.target.value)}
                rows={3}
                placeholder={d.admin.rosterPh}
                className={`${inputCls} resize-y font-mono text-xs`}
              />
            </label>
            <div className="mt-2.5 flex flex-wrap items-center gap-3">
              <ToolButton onClick={addRoster} disabled={busy || !roster.trim()}>
                {d.admin.rosterAdd}
              </ToolButton>
              <span className="text-[11px] text-[color:var(--faint)]">{d.admin.rosterHint}</span>
            </div>
          </div>

          {records.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={d.admin.search}
                aria-label={d.admin.search}
                className={`${inputCls} max-w-xs`}
              />
              <span className="text-[11px] text-[color:var(--faint)]">
                {fill(d.admin.searchCount, { n: shown.length, t: records.length })}
              </span>
            </div>
          )}

          {records.length === 0 ? (
            <p className="mt-5 text-xs leading-relaxed text-[color:var(--faint)]">{d.admin.listEmpty}</p>
          ) : (
            <ul className="mt-4 divide-y divide-[color:var(--border)]">
              {shown.map((r) => (
                <li
                  key={r.id}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragId(r.id);
                  }}
                  onDragLeave={() => setDragId((v) => (v === r.id ? null : v))}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragId(null);
                    const f = e.dataTransfer.files?.[0];
                    if (f) attach(r, f);
                  }}
                  className={`grid grid-cols-1 gap-x-5 gap-y-2 px-2 py-3.5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center ${
                    dragId === r.id
                      ? "bg-[color:var(--surface)] outline-dashed outline-1 outline-[color:var(--crimson)]"
                      : ""
                  }`}
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-[color:var(--text)]">{r.fullName}</div>
                    <div className="mt-0.5 truncate font-mono text-[11px] text-[color:var(--faint)]">
                      {r.nim}
                      {hasFile(r) ? ` · ${r.fileName}` : ""}
                    </div>
                    <div className="mt-0.5 text-xs text-[color:var(--muted)]">{r.title}</div>
                    {!hasFile(r) && (
                      <div className="mt-1.5 text-[11px] text-[color:var(--crimson)]">{d.admin.dropHere}</div>
                    )}
                  </div>
                  <div className="flex items-center gap-4 sm:justify-end">
                    {/* A status, not a control. The bordered pill it used to wear
                        read as a fourth button sitting among three real ones. */}
                    <span className="font-mono text-[10px] uppercase tracking-wider text-[color:var(--faint)]">
                      {hasFile(r) ? d.admin.published : d.admin.awaiting}
                    </span>
                    {hasFile(r) && (
                      <button
                        type="button"
                        onClick={() => downloadFile(r)}
                        aria-label={`${d.admin.download} ${r.fileName}`}
                        title={d.admin.download}
                        className="link-quiet text-xs text-[color:var(--muted)] hover:text-[color:var(--text)]"
                      >
                        {d.admin.download}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => edit(r)}
                      className="link-quiet text-xs text-[color:var(--muted)] hover:text-[color:var(--text)]"
                    >
                      {d.admin.edit.split(" ")[0]}
                    </button>
                    {/* The destructive one is set off by a rule, so it is never the
                        thing a hurried thumb lands on next to Ubah. */}
                    <button
                      type="button"
                      onClick={() => remove(r)}
                      className="link-quiet border-l border-[color:var(--border)] pl-4 text-xs text-[color:var(--crimson)]"
                    >
                      {d.admin.del}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-6 border-t border-[color:var(--border)] pt-4 text-[11px] leading-relaxed text-[color:var(--faint)]">
            {d.admin.publishHelp}
          </p>
        </div>
      </div>
    </div>
  );
}

/* Role decides the label on the panel and nothing else: the three accounts
   reach exactly the same controls and the same registry. */
function roleLabel(d: CertDict, role: Session["role"]): string {
  if (role === "lead") return d.admin.roleLead;
  if (role === "sekretaris") return d.admin.roleSekretaris;
  return d.admin.rolePembina;
}

const inputCls =
  "w-full rounded border border-[color:var(--border)] bg-[color:var(--surface-2)] px-3 py-2.5 text-sm text-[color:var(--text)] outline-none placeholder:text-[color:var(--faint)] hover:border-[color:var(--border-strong)] focus-visible:border-[color:var(--crimson)]";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] uppercase tracking-wider text-[color:var(--faint)]">{label}</span>
      {children}
    </label>
  );
}

function ToolButton({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="rounded border border-[color:var(--muted)] px-3.5 py-2 text-xs font-medium text-[color:var(--text)] hover:bg-[color:var(--surface)] disabled:border-[color:var(--border-strong)] disabled:text-[color:var(--faint)] disabled:opacity-100"
    >
      {children}
    </button>
  );
}
