"use client";
import { useSyncExternalStore } from "react";

/* Periode organisasi, dihitung dari kalender — tidak pernah diketik tangan.
 *
 * Tahun ajaran berganti setiap 1 September pukul 00:00 WITA. Mulai
 * September tahun Y:
 *   - pendaftaran anggota  → Y/Y+1   (Sep 2026 → 2026/2027, Sep 2510 → 2510/2511)
 *   - kepengurusan berjalan → Y-1/Y  (Sep 2026 → 2025/2026)
 *   - kepengurusan ke-N     → Y-2024 (2026 → ke-2)
 * Aritmetika murni tanpa tabel dan tanpa batas tahun: berlaku selama situs
 * ini hidup (Date JavaScript sah sampai tahun 275760). Untuk memindahkan hari
 * pergantian, ubah ROLLOVER_MONTH saja.
 *
 * Teks memakai token {REG}, {TERM} dan {TERM_NO}; Providers menggantinya di
 * seluruh kamus, dan `withPeriod` dipakai untuk string di luar kamus.
 */

export const ROLLOVER_MONTH = 8; // 0-based: September
const TZ_OFFSET_MS = 8 * 3600 * 1000; // Asia/Makassar, tanpa DST
const FIRST_TERM_START = 2024; // kepengurusan ke-1 = periode 2024/2025

/** Tahun awal periode pendaftaran yang berlaku pada waktu `ms`. */
export function periodStart(ms: number): number {
  const d = new Date(ms + TZ_OFFSET_MS);
  const y = d.getUTCFullYear();
  return d.getUTCMonth() >= ROLLOVER_MONTH ? y : y - 1;
}

export type Period = { reg: string; term: string; termNo: number; start: number };

export function periodFrom(start: number): Period {
  return {
    start,
    reg: `${start}/${start + 1}`,
    term: `${start - 1}/${start}`,
    termNo: start - FIRST_TERM_START,
  };
}

export function withPeriod(text: string, p: Period): string {
  return text
    .replace(/\{REG\}/g, p.reg)
    .replace(/\{TERM\}/g, p.term)
    .replace(/\{TERM_NO\}/g, String(p.termNo));
}

/* Halaman di-prerender saat build. Selama hidrasi dipakai tahun build (sama
   persis di server dan browser, jadi tidak ada mismatch), lalu langsung
   berpindah ke kalender pengunjung dan diperiksa ulang tiap jam. */
const BUILD_MS = Date.parse(process.env.NEXT_PUBLIC_BUILD_TIME ?? "") || 0;

function subscribe(cb: () => void) {
  const t = window.setInterval(cb, 60 * 60 * 1000);
  const onFocus = () => cb();
  window.addEventListener("focus", onFocus);
  return () => {
    window.clearInterval(t);
    window.removeEventListener("focus", onFocus);
  };
}

export function usePeriodStart(): number {
  return useSyncExternalStore(
    subscribe,
    () => periodStart(Date.now()),
    () => periodStart(BUILD_MS || Date.now()),
  );
}
