"use client";
import { useEffect, useState, type ReactNode } from "react";
import { Segments } from "@/components/ui/Segments";
import { GalleryEditor } from "@/components/gallery/GalleryEditor";
import { PermissionsPanel } from "./PermissionsPanel";
import { can, fetchMe, FULL, type Perms } from "@/lib/adminclient";
import type { Session } from "@/lib/certstore";

/* Pembungkus dasbor setelah masuk.
 *
 * Pengelola izin langsung mendapat panel izin, tanpa tab lain. Akun pengurus
 * mendapat bar segmen di puncak halaman — Sertifikat | Galeri — dan hanya
 * segmen yang diizinkan yang tampil. Izin dibaca ulang dari server setiap
 * dasbor dibuka, jadi perubahan dari pengelola izin langsung terasa. */
type Tab = "cert" | "gallery";
const TAB_KEY = "admin.tab";

export function Workspace({
  session,
  onSession,
  onSignOut,
  siteName,
  brand,
  cert,
}: {
  session: Session;
  onSession: (s: Session) => void;
  onSignOut: () => void;
  siteName: string;
  brand: { name: string; handle: string; avatar: ReactNode };
  cert: (perms: Perms) => ReactNode;
}) {
  const [perms, setPerms] = useState<Perms>(session.perms ?? FULL);
  const [tab, setTab] = useState<Tab>("cert");
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    try {
      const t = sessionStorage.getItem(TAB_KEY);
      if (t === "cert" || t === "gallery") setTab(t);
    } catch {
      /* tab bawaan */
    }
  }, []);

  useEffect(() => {
    let live = true;
    fetchMe(session.token)
      .then((me) => {
        if (!live) return;
        if (!me) return onSignOut();
        setPerms(me.perms);
        if (JSON.stringify(me.perms) !== JSON.stringify(session.perms) || me.role !== session.role) {
          onSession({ ...session, role: me.role, user: me.user, perms: me.perms });
        }
      })
      .catch(() => {
        /* jaringan putus: pakai izin dari sesi */
      })
      .finally(() => live && setChecked(true));
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.token]);

  if (session.role === "super") {
    return <PermissionsPanel token={session.token} siteName={siteName} onSignOut={onSignOut} />;
  }

  const tabs = [
    ...(can(perms, "cert", "post") ? [{ id: "cert" as Tab, label: "Sertifikat" }] : []),
    ...(can(perms, "gallery", "post") ? [{ id: "gallery" as Tab, label: "Galeri" }] : []),
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
      <div className="mx-auto max-w-md rounded-xl border border-[color:var(--ui-line)] p-7 text-center text-[color:var(--ui-text)]">
        <p className="text-sm">
          {checked ? "Akun ini belum diberi izin apa pun. Hubungi pengelola izin." : "Memeriksa izin…"}
        </p>
        <button
          type="button"
          onClick={onSignOut}
          className="mt-5 rounded-lg border border-[color:var(--ui-line-strong)] px-4 py-2 text-xs"
        >
          Keluar
        </button>
      </div>
    );
  }

  return (
    <div>
      {tabs.length > 1 && (
        <Segments items={tabs} value={current} onChange={choose} label="Bagian dasbor" className="mb-10 [justify-content:safe_center]" />
      )}
      {current === "cert" ? (
        cert(perms)
      ) : (
        <GalleryEditor token={session.token} perms={perms} brand={brand} onSignOut={onSignOut} />
      )}
    </div>
  );
}
