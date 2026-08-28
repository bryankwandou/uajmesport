"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  clearLocal,
  deleteRecord,
  fileToDataUrl,
  newId,
  putRecord,
  hasFile,
  publishedFileName,
  recordBytes,
  SLOTS,
  toPublishedJson,
  type CertRecord,
} from "@/lib/certstore";
import { saveBlob } from "@/lib/convert";
import { sampleRecords } from "@/lib/demoCerts";
import { fill, type CertDict } from "@/lib/certdict";

/* Board dashboard.
 *
 * The gate below compares against a fixed pair of credentials in the client
 * bundle. That is deliberate and it is stated in the panel: this separates the
 * board from a visitor who wandered in, it is not a vault. Nothing secret sits
 * behind it — the registry it edits is the same registry the claim form reads.
 */
/* Two people put certificates on this site: the board chair and the faculty
   supervisor. They get separate sign-ins so the dashboard can say who is
   working and so one can be revoked without locking the other out.
   To change a password, edit the line here and redeploy. */
export type Account = { user: string; pass: string; role: "lead" | "pembina" };

export const ACCOUNTS: Account[] = [
  { user: "nayrbryanGaming", pass: "nayrbryanGaming", role: "lead" },
  { user: "pembina.uajmesport", pass: "pembina.uajmesport", role: "pembina" },
];

const SESSION_KEY = "uajmesport.cert.admin";
const ROLE_KEY = "uajmesport.cert.role";

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
  records,
  onChanged,
  onClose,
}: {
  d: CertDict;
  records: CertRecord[];
  onChanged: () => void;
  onClose: () => void;
}) {
  const [authed, setAuthed] = useState(false);
  const [role, setRole] = useState<Account["role"]>("lead");

  useEffect(() => {
    try {
      setAuthed(sessionStorage.getItem(SESSION_KEY) === "1");
      const r = sessionStorage.getItem(ROLE_KEY);
      if (r === "lead" || r === "pembina") setRole(r);
    } catch {
      /* storage unavailable, the gate simply asks again */
    }
  }, []);

  const signIn = useCallback((account: Account) => {
    setAuthed(true);
    setRole(account.role);
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
      sessionStorage.setItem(ROLE_KEY, account.role);
    } catch {
      /* in-memory session still applies */
    }
  }, []);

  const signOut = useCallback(() => {
    setAuthed(false);
    try {
      sessionStorage.removeItem(SESSION_KEY);
      sessionStorage.removeItem(ROLE_KEY);
    } catch {
      /* nothing to clear */
    }
    onClose();
  }, [onClose]);

  return authed ? (
    <Dashboard d={d} records={records} role={role} onChanged={onChanged} onSignOut={signOut} />
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
  onSignedIn: (account: Account) => void;
  onClose: () => void;
}) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const account = ACCOUNTS.find((a) => a.user === user.trim() && a.pass === pass);
        if (account) onSignedIn(account);
        else setError(d.admin.wrong);
      }}
      className="panel-feature clip-corner mx-auto max-w-md p-7"
    >
      <div className="text-[10px] uppercase tracking-[0.25em] text-[color:var(--crimson)]">{d.admin.signIn}</div>
      <div className="mt-5 space-y-4">
        <Field label={d.admin.user}>
          <input
            value={user}
            onChange={(e) => setUser(e.target.value)}
            autoComplete="username"
            className={inputCls}
          />
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
        <button type="submit" className="btn-primary clip-corner px-5 py-2.5 text-xs">
          {d.admin.enter}
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
  records,
  role,
  onChanged,
  onSignOut,
}: {
  d: CertDict;
  records: CertRecord[];
  role: Account["role"];
  onChanged: () => void;
  onSignOut: () => void;
}) {
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [roster, setRoster] = useState("");
  const [dragId, setDragId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const importRef = useRef<HTMLInputElement>(null);

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
    const existing = draft.id ? records.find((r) => r.id === draft.id) : undefined;
    setBusy(true);
    try {
      const base: CertRecord = existing ?? {
        id: newId(),
        fullName: "",
        nim: "",
        title: "",
        event: "",
        issuedAt: "",
        fileName: "",
        mime: "",
        size: 0,
        source: "local",
        createdAt: Date.now(),
      };
      const rec: CertRecord = {
        ...base,
        fullName: draft.fullName.trim(),
        nim: draft.nim.trim(),
        title: draft.title.trim() || "Sertifikat UKM E-Sport UAJM",
        event: draft.event.trim(),
        issuedAt: draft.issuedAt.trim(),
        ref: draft.ref.trim() || undefined,
        source: "local",
      };
      if (file) {
        rec.data = await fileToDataUrl(file);
        rec.url = undefined;
        rec.fileName = file.name;
        rec.mime = file.type || "application/octet-stream";
        rec.size = file.size;
      }
      await putRecord(rec);
      reset();
      onChanged();
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
  }

  async function remove(rec: CertRecord) {
    if (!window.confirm(d.admin.delConfirm)) return;
    await deleteRecord(rec.id);
    if (draft.id === rec.id) reset();
    onChanged();
  }

  async function seed() {
    setBusy(true);
    setError("");
    try {
      for (const rec of sampleRecords()) await putRecord(rec);
      onChanged();
      setStatus(d.admin.saved);
    } catch (err) {
      setError(err instanceof Error ? err.message : d.err.generic);
    } finally {
      setBusy(false);
    }
  }

  async function wipe() {
    if (!window.confirm(d.admin.wipeConfirm)) return;
    await clearLocal();
    reset();
    onChanged();
  }

  async function exportJson() {
    setError("");
    try {
      const json = await toPublishedJson(records);
      saveBlob(new Blob([json], { type: "application/json" }), "certificates.json");
      setStatus(d.admin.saved);
    } catch (err) {
      setError(err instanceof Error ? err.message : d.err.generic);
    }
  }

  /* The registry names each file by its record id, so the files have to leave
     here under those names. Downloading them one by one under their original
     names would guarantee a mismatch with the JSON. */
  async function exportFiles() {
    setError("");
    setBusy(true);
    try {
      for (const r of records) {
        const bytes = await recordBytes(r);
        saveBlob(new Blob([bytes.slice().buffer as ArrayBuffer], { type: r.mime }), publishedFileName(r));
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
    try {
      const rows: unknown = JSON.parse(await f.text());
      if (!Array.isArray(rows)) throw new Error("JSON harus berupa larik sertifikat.");
      for (const row of rows as CertRecord[]) {
        if (!row?.fullName || !row?.nim) continue;
        await putRecord({ ...row, id: row.id || newId(), source: "local", createdAt: row.createdAt || Date.now() });
      }
      onChanged();
      setStatus(d.admin.saved);
    } catch (err) {
      setError(err instanceof Error ? err.message : d.err.generic);
    } finally {
      if (importRef.current) importRef.current.value = "";
    }
  }

  /* Dropping a file on a roster row is the whole upload. The board has the
     certificates in a folder and the names already typed; opening an edit form
     for each of 25 people would be the slower path by far. */
  async function attach(rec: CertRecord, file: File) {
    setError("");
    try {
      await putRecord({
        ...rec,
        data: await fileToDataUrl(file),
        url: undefined,
        fileName: file.name,
        mime: file.type || "application/octet-stream",
        size: file.size,
      });
      onChanged();
      setStatus(d.admin.saved);
    } catch (err) {
      setError(err instanceof Error ? err.message : d.err.generic);
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
        await putRecord({
          id: newId(),
          fullName: name,
          nim,
          title: "Sertifikat UKM E-Sport UAJM",
          event: "",
          issuedAt: "",
          fileName: "",
          mime: "",
          size: 0,
          source: "local",
          createdAt: Date.now() + n,
        });
        n++;
      }
      setRoster("");
      onChanged();
      setStatus(d.admin.saved);
    } catch (err) {
      setError(err instanceof Error ? err.message : d.err.generic);
    } finally {
      setBusy(false);
    }
  }

  async function downloadFile(rec: CertRecord) {
    const bytes = await recordBytes(rec);
    saveBlob(new Blob([bytes.slice().buffer as ArrayBuffer], { type: rec.mime }), rec.fileName);
  }

  const filled = records.length;

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
            {d.admin.signedInAs} {role === "lead" ? d.admin.roleLead : d.admin.rolePembina}
          </p>
        </div>
        <button
          type="button"
          onClick={onSignOut}
          className="clip-corner border border-[color:var(--border)] px-4 py-2 text-xs text-[color:var(--text)] hover:border-[color:var(--border-strong)]"
        >
          {d.admin.signOut}
        </button>
      </div>

      <div className="mt-6 flex flex-wrap gap-1.5" aria-hidden="true">
        {Array.from({ length: Math.max(SLOTS, filled) }, (_, i) => (
          <span
            key={i}
            className={`h-2.5 w-6 rounded-sm ${
              i < filled
                ? "bg-gradient-to-r from-crimson-glow to-ember-glow"
                : "border border-[color:var(--border)] bg-[color:var(--surface-2)]"
            }`}
          />
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <ToolButton onClick={exportJson}>{d.admin.exportJson}</ToolButton>
        <ToolButton onClick={exportFiles} disabled={busy || records.length === 0}>
          {d.admin.exportFiles}
        </ToolButton>
        <ToolButton onClick={() => importRef.current?.click()}>{d.admin.importJson}</ToolButton>
        <ToolButton onClick={seed} disabled={busy}>
          {d.admin.seed}
        </ToolButton>
        <ToolButton onClick={wipe}>{d.admin.wipe}</ToolButton>
        <input ref={importRef} type="file" accept="application/json,.json" onChange={importJson} className="hidden" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <form onSubmit={save} className="panel clip-corner h-fit p-6">
          <div className="text-[10px] uppercase tracking-[0.2em] text-[color:var(--faint)]">
            {draft.id ? d.admin.edit : d.admin.add}
          </div>
          <div className="mt-5 space-y-4">
            <Field label={d.admin.fName}>
              <input value={draft.fullName} onChange={set("fullName")} className={inputCls} required />
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
            <button type="submit" disabled={busy} className="btn-primary clip-corner px-5 py-2.5 text-xs disabled:opacity-60">
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
          {records.length === 0 ? (
            <p className="mt-5 text-xs leading-relaxed text-[color:var(--faint)]">{d.admin.listEmpty}</p>
          ) : (
            <ul className="mt-4 divide-y divide-[color:var(--border)]">
              {records.map((r) => (
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
                  className={`flex flex-wrap items-start justify-between gap-3 px-2 py-3.5 ${
                    dragId === r.id
                      ? "bg-[color:var(--surface)] outline-dashed outline-1 outline-[color:var(--crimson)]"
                      : ""
                  }`}
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-[color:var(--text)]">{r.fullName}</div>
                    <div className="mt-0.5 font-mono text-[11px] text-[color:var(--faint)]">
                      {r.nim}
                      {hasFile(r) ? ` · ${r.fileName}` : ""}
                    </div>
                    <div className="mt-0.5 text-xs text-[color:var(--muted)]">{r.title}</div>
                    {!hasFile(r) && (
                      <div className="mt-1.5 text-[11px] text-[color:var(--crimson)]">{d.admin.dropHere}</div>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="chip px-2 py-0.5 font-mono text-[10px] text-[color:var(--faint)]">
                      {hasFile(r)
                        ? r.source === "published"
                          ? d.admin.published
                          : d.admin.local
                        : d.admin.awaiting}
                    </span>
                    {hasFile(r) && (
                      <button
                        type="button"
                        onClick={() => downloadFile(r)}
                        className="link-quiet text-xs text-[color:var(--muted)] hover:text-[color:var(--text)]"
                      >
                        ↓
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => edit(r)}
                      className="link-quiet text-xs text-[color:var(--muted)] hover:text-[color:var(--text)]"
                    >
                      {d.admin.edit.split(" ")[0]}
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(r)}
                      className="link-quiet text-xs text-[color:var(--crimson)]"
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

const inputCls =
  "w-full rounded border border-[color:var(--border)] bg-[color:var(--surface-2)] px-3 py-2.5 text-sm text-[color:var(--text)] outline-none duration-200 ease-crisp [transition-property:opacity] placeholder:text-[color:var(--faint)] hover:border-[color:var(--border-strong)] focus-visible:border-[color:var(--crimson)]";

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
      className="clip-corner border border-[color:var(--border)] px-3.5 py-2 text-xs text-[color:var(--muted)] duration-200 ease-crisp [transition-property:opacity] hover:border-[color:var(--border-strong)] hover:text-[color:var(--text)] disabled:opacity-60"
    >
      {children}
    </button>
  );
}


