"use client";
import Image from "next/image";
import { Reveal, Stagger, StaggerItem } from "./Reveal";
import { IG_HANDLE, IG_URL, POSTS, type IgPost } from "@/lib/posts";

/* Instagram-styled archive. Renders nothing until real posts are supplied, so
   the section never ships with fabricated captions. Each card mimics the native
   Instagram post chrome: header, media, action row, caption. */
export function InstagramFeed() {
  if (POSTS.length === 0) return null;
  return (
    <section id="galeri" className="mx-auto max-w-6xl px-5 py-24">
      <div className="mx-auto max-w-2xl text-center">
        <span className="chip clip-corner inline-block px-3 py-1 text-xs uppercase tracking-wider text-white/60">
          Galeri
        </span>
        <h2 className="mt-4 font-display text-3xl font-extrabold uppercase tracking-tight text-white md:text-4xl">
          Arsip <span className="gradient-text">Instagram</span>
        </h2>
        <p className="mt-4 normal-case text-white/55">
          Dokumentasi kegiatan, event, dan prestasi langsung dari{" "}
          <a href={IG_URL} target="_blank" rel="noopener noreferrer" className="text-crimson-glow/90 hover:text-white">
            @{IG_HANDLE}
          </a>
          .
        </p>
      </div>

      <Stagger className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {POSTS.map((post) => (
          <StaggerItem key={post.id}>
            <PostCard post={post} />
          </StaggerItem>
        ))}
      </Stagger>

      <Reveal className="mt-10 text-center">
        <a href={IG_URL} target="_blank" rel="noopener noreferrer" className="btn-primary clip-corner inline-block px-6 py-3 text-sm">
          Lihat semua di Instagram
        </a>
      </Reveal>
    </section>
  );
}

function PostCard({ post }: { post: IgPost }) {
  const permalink = post.href ?? `${IG_URL.replace(/\/$/, "")}/`;
  return (
    <article className="glass overflow-hidden rounded-xl border border-white/8">
      <header className="flex items-center gap-3 px-4 py-3">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-crimson-glow to-ember-glow p-[2px]">
          <span className="grid h-full w-full place-items-center rounded-full bg-ink-950">
            <Image src="/ukm-esport-logo.png" alt="" width={22} height={22} className="rounded-full object-contain" />
          </span>
        </span>
        <div className="min-w-0 flex-1 leading-tight">
          <div className="truncate font-display text-sm font-bold text-white">{IG_HANDLE}</div>
          {post.category && <div className="text-[10px] uppercase tracking-wide text-white/40">{post.category}</div>}
        </div>
        <a href={permalink} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-crimson-glow/90 hover:text-white">
          Buka
        </a>
      </header>

      <a href={permalink} target="_blank" rel="noopener noreferrer" className="relative block aspect-square w-full overflow-hidden bg-white/5">
        <Image src={post.image} alt={post.caption.slice(0, 80)} fill className="object-cover" sizes="(max-width: 640px) 100vw, 33vw" />
      </a>

      <div className="flex items-center gap-4 px-4 pt-3 text-white/70">
        <HeartIcon />
        <CommentIcon />
        <ShareIcon />
        <span className="ml-auto font-mono text-[11px] text-white/40">{post.date}</span>
      </div>

      <div className="px-4 pb-4 pt-2">
        <p className="text-sm leading-relaxed text-white/75">
          <span className="font-bold text-white">{IG_HANDLE}</span>{" "}
          <span className="whitespace-pre-line">{post.caption}</span>
        </p>
      </div>
    </article>
  );
}

function HeartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1 7.8 7.8 7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8Z" />
    </svg>
  );
}
function CommentIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M21 11.5a8.4 8.4 0 0 1-11.9 7.6L3 21l1.9-6.1A8.4 8.4 0 1 1 21 11.5Z" />
    </svg>
  );
}
function ShareIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z" />
    </svg>
  );
}
