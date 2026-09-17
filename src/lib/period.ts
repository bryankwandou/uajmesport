"use client";
import { useSyncExternalStore } from "react";

/* Periode organisasi, dihitung dari kalender — tidak pernah diketik tangan.
 *
 * Tahun kepengurusan berganti setiap 1 Agustus (WITA). Mulai Agustus tahun Y:
 *   - pendaftaran anggota  → Y/Y+1   (Agustus 2026 → 2026/2027)
 *   - kepengurusan berjalan → Y-1/Y  (Agustus 2026 → 2025/2026)
 *   - kepengurusan ke-N     → Y-2024 (2026 → ke-2)
 * Aritmetika murni, jadi berlaku untuk tahun berapa pun tanpa perlu diubah.
 *
 * Teks memakai token {REG}, {TERM} dan {TERM_NO}; Providers menggantinya di
 * seluruh kamus, dan `withPeriod` dipakai untuk string di luar kamus.
 */

export const ROLLOVER_MONTH = 7; // 0-based: Agustus
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
