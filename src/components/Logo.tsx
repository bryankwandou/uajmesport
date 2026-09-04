import Image from "next/image";

export function LogoMark({ size = 38 }: { size?: number }) {
  return (
    <Image
      src="/ukm-esport-logo.png"
      alt="Logo UKM E-Sport Universitas Atma Jaya Makassar"
      width={size}
      height={size}
      priority
      className="object-contain"
    />
  );
}

export function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <LogoMark />
      {/* Kedua baris merek tidak boleh membungkus. Bilah nav adalah baris flex
         yang padat, dan begitu lebarnya kurang, "E-SPORT" turun ke baris kedua
         lalu terpotong oleh leading-none. */}
      <div className="leading-none">
        <div className="whitespace-nowrap font-display text-sm font-extrabold tracking-tight text-[color:var(--text)]">
          UKM<span className="text-crimson-glow"> E-SPORT</span>
        </div>
        <div className="whitespace-nowrap text-[10px] uppercase tracking-[0.15em] text-[color:var(--faint)]">
          Atma Jaya Makassar
        </div>
      </div>
    </div>
  );
}
