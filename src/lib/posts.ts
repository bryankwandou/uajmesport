// Instagram post archive for @uajm_esport. Captions are transcribed verbatim
// from the real posts; images are stored locally under /public/ig so nothing
// depends on Instagram CDN URLs that expire. Motivational-quote posts
// ("kata motivasi") are intentionally excluded per the brief.
//
// Every entry here must correspond to a real post. Do not invent captions or
// images. Populate `POSTS` from the account owner's own exported content.

export type IgPost = {
  id: string;          // Instagram shortcode, e.g. "C1a2b3c4d5e"
  image: string;       // local path under /public, e.g. "/ig/esport-01.jpg"
  caption: string;     // verbatim caption text
  date: string;        // human date, e.g. "12 Apr 2024"
  category?: "event" | "prestasi" | "kegiatan" | "pengumuman" | "dokumentasi";
  href?: string;       // canonical permalink, https://instagram.com/p/<id>/
};

export const IG_HANDLE = "uajm_esport";
export const IG_URL = "https://instagram.com/uajm_esport";

export const POSTS: IgPost[] = [];
