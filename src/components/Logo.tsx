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
      <div className="leading-none">
        <div className="font-display text-[15px] font-extrabold tracking-tight text-[color:var(--text)]">
          UKM<span className="text-crimson-glow"> E-SPORT</span>
        </div>
        <div className="text-[9px] uppercase tracking-[0.2em] text-[color:var(--faint)]">Atma Jaya Makassar</div>
      </div>
    </div>
  );
}
