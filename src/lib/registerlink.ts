"use client";
import { useSyncExternalStore } from "react";

/* Link pendaftaran yang berlaku, untuk tombol "Daftar" di seluruh situs.
 *
 * Halaman dirender dengan link bawaan (src/lib/content.ts), lalu menanyakan
 * /api/settings sekali per kunjungan. Bila pengurus sudah menggantinya dari
 * dasbor, semua tombol ikut berganti tanpa build ulang. */
let current: string | null = null;
let started = false;
const listeners = new Set<() => void>();

function load() {
  if (started) return;
  started = true;
  fetch("/api/settings")
    .then((r) => (r.ok ? r.json() : null))
    .then((b: { registerUrl?: string | null } | null) => {
      if (b?.registerUrl && /^https:\/\//.test(b.registerUrl)) {
        current = b.registerUrl;
        listeners.forEach((l) => l());
      }
    })
    .catch(() => {
      /* link bawaan tetap dipakai */
    });
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  load();
  return () => listeners.delete(cb);
}

/** Dipanggil dasbor setelah link disimpan, supaya halaman ini ikut berganti. */
export function announceRegisterUrl(url: string | null) {
  current = url;
  listeners.forEach((l) => l());
}

export function useRegisterUrl(fallback: string): string {
  const v = useSyncExternalStore(
    subscribe,
    () => current,
    () => null,
  );
  return v ?? fallback;
}
