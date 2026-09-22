"use client";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Segments } from "@/components/ui/Segments";
import { GalleryEditor } from "@/components/gallery/GalleryEditor";
import { SuperPanel } from "./SuperPanel";
import { RegisterPanel } from "./RegisterPanel";
import { can, fetchMe, NONE, type Perms } from "@/lib/adminclient";
import type { Session } from "@/lib/certstore";

/* Pembungkus dasbor setelah masuk.
 *
 * Pengelola izin langsung mendapat panelnya sendiri, tanpa tab lain. Akun
 * pengurus mendapat bar segmen — Sertifikat | Galeri | Pendaftaran — berisi
 * hanya segmen yang diizinkan.
 *
 * Izin TIDAK pernah diambil dari salinan di browser. Tidak ada modul yang
 * dirender sebelum server menjawab, dan izin ditanyakan ulang tiap 15 detik
 * serta setiap kali tab kembali aktif. Begitu pengelola izin mematikan sebuah
 * sakelar, segmennya hilang dari layar akun itu — dan server sudah menolak
 * permintaannya sejak detik yang sama. */
type Tab = "cert" | "gallery" | "form";
const TAB_KEY = "admin.tab";
const POLL_MS = 15_000;

export function Workspace({
  session,
  onSession,
  onSignOut,
  siteName,
  brand,
  registerFallback,
  cert,
}: {
  session: Session;
  onSession: (s: Session) => void;
  onSignOut: () => void;
  siteName: string;
  brand: { name: string; handle: string; avatar: ReactNode };
  registerFallback: string;
  cert: (perms: Perms) => ReactNode;
}) {
  const [perms, setPerms] = useState<Perms | null>(null);
  const [role, setRole] = useState(session.role);
  const [tab, setTab] = useState<Tab>("cert");
  const [offline, setOffline] = useState(false);
  const [notice, setNotice] = useState("");
  const last = useRef<string>("");
  const sessionRef = useRef(session);
  sessionRef.current = session;

  useEffect(() => {
    try {
      const t = sessionStorage.getItem(TAB_KEY);
      if (t === "cert" || t === "gallery" || t === "form") setTab(t);
    } catch {
      /* tab bawaan */
    }
  }, []);

  const check = useCallback(async () => {
    try {
      const me = await fetchMe(session.token);
      if (!me) return onSignOut();
      setOffline(false);
      const sig = JSON.stringify([me.role, me.perms]);
      if (last.current && last.current !== sig) setNotice("Izin akun ini baru saja diubah oleh pengelola izin.");
      last.current = sig;
      setRole(me.role);
      setPerms(me.perms);
      const s = sessionRef.current;
      if (JSON.stringify(s.perms) !== JSON.stringify(me.perms) || s.role !== me.role || s.user !== me.user) {
        onSession({ ...s, role: me.role, user: me.user, perms: me.perms });
      }
    } catch {
      setOffline(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.token]);

  useEffect(() => {
    check();
    const t = window.setInterval(check, POLL_MS);
    const onVis = () => document.visibilityState === "visible" && check();
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("focus", onVis);
    return () => {
      window.clearInterval(t);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("focus", onVis);
    };
  }, [check]);

  useEffect(() => {
    if (!notice) return;
    const t = window.setTimeout(() => setNotice(""), 4000);
    return () => window.clearTimeout(t);
  }, [notice]);

  if (perms === null) {
    return (
      <Centered>
        <p className="text-sm">{offline ? "Server tidak terjangkau. Mencoba lagi…" : "Memeriksa izin akun…"}</p>
        <SignOut onClick={onSignOut} />
      </Centered>
    );
  }

  if (role === "super") {
    return <SuperPanel token={session.token} siteName={siteName} onSignOut={onSignOut} />;
  }

  const p = perms ?? NONE;
  const tabs = [
    ...(can(p, "cert", "post") ? [{ id: "cert" as Tab, label: "Sertifikat" }] : []),
    ...(can(p, "gallery", "post") ? [{ id: "gallery" as Tab, label: "Galeri" }] : []),
    ...(can(p, "form", "full") ? [{ id: "form" as Tab, label: "Pendaftaran" }] : []),
  ];
  const current = tabs.some((t) => t.id === tab) ? tab : tabs[0]?.id;

  function choose(t: Tab) {
    setTab(t);
    try {
      sessionStorage.setItem(TAB_KEY, t);
    } catch {
      /* tetap berlaku di memori */
    }
  }

  if (!current) {
    return (
      <Centered>
        <p className="text-sm">Akun ini belum diberi izin apa pun. Hubungi pengelola izin.</p>
        <SignOut onClick={onSignOut} />
      </Centered>
    );
  }

  return (
    <div>
      <Segments items={tabs} value={current} onChange={choose} label="Bagian dasbor" className="mb-10 [justify-content:safe_center]" />
      {current === "cert" && cert(p)}
      {current === "gallery" && (
        <GalleryEditor key={p.gallery} token={session.token} perms={p} brand={brand} onSignOut={onSignOut} />
      )}
      {current === "form" && (
        <RegisterPanel token={session.token} fallback={registerFallback} onSignOut={onSignOut} />
      )}
      {(notice || offline) && (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 z-[120] -translate-x-1/2 rounded-lg bg-[#262626] px-4 py-3 text-sm text-white shadow-lg"
        >
          {offline ? "Koneksi terputus — perubahan izin akan diterapkan saat tersambung lagi." : notice}
        </div>
      )}
    </div>
  );
}

function Centered({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto max-w-md rounded-xl border border-[color:var(--ui-line)] p-7 text-center text-[color:var(--ui-text)]">
      {children}
    </div>
  );
}

function SignOut({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-5 rounded-lg border border-[color:var(--ui-line-strong)] px-4 py-2 text-xs"
    >
      Keluar
    </button>
  );
}
