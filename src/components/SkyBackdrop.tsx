/**
 * Purely decorative backdrop: a soft sky gradient (set on <body> in styles.css),
 * drifting clouds and glossy four-petal pastel balloons. Fixed behind every page,
 * hidden from assistive tech and never catches pointer events.
 */

type Tint = "yellow" | "mint" | "blue" | "pink";

const TINTS: Record<Tint, { light: string; base: string; shade: string }> = {
  yellow: { light: "#fffdf0", base: "#f6f0bf", shade: "#ddd28f" },
  mint: { light: "#f4fff7", base: "#c6ecd2", shade: "#97cfaa" },
  blue: { light: "#f2fbff", base: "#a9d9ea", shade: "#76b6cf" },
  pink: { light: "#fff6f3", base: "#f7c5bd", shade: "#e19a90" },
};

function BalloonDefs() {
  return (
    <defs>
      {(Object.keys(TINTS) as Tint[]).map((t) => (
        <radialGradient key={t} id={`balloon-${t}`} cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor={TINTS[t].light} />
          <stop offset="45%" stopColor={TINTS[t].base} />
          <stop offset="100%" stopColor={TINTS[t].shade} />
        </radialGradient>
      ))}
    </defs>
  );
}

/** One four-petal balloon, drawn in a 200x200 box centred on (100,100). */
function Clover({ tint }: { tint: Tint }) {
  const fill = `url(#balloon-${tint})`;
  const petals = [
    { cx: 62, cy: 62, r: 0 },
    { cx: 138, cy: 62, r: 90 },
    { cx: 138, cy: 138, r: 180 },
    { cx: 62, cy: 138, r: 270 },
  ];
  return (
    <g>
      {petals.map((p) => (
        <g key={p.r} transform={`rotate(${p.r} ${p.cx} ${p.cy})`}>
          <ellipse cx={p.cx} cy={p.cy} rx="46" ry="42" fill={fill} />
          <ellipse cx={p.cx - 14} cy={p.cy - 16} rx="13" ry="7" fill="#fff" opacity="0.55"
            transform={`rotate(-30 ${p.cx - 14} ${p.cy - 16})`} />
        </g>
      ))}
      <circle cx="100" cy="100" r="22" fill={fill} />
      <ellipse cx="93" cy="92" rx="7" ry="4" fill="#fff" opacity="0.6" transform="rotate(-30 93 92)" />
    </g>
  );
}

function Cloud({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 90" className={className} aria-hidden="true">
      <g fill="#fff">
        <ellipse cx="60" cy="58" rx="48" ry="26" />
        <ellipse cx="105" cy="40" rx="44" ry="34" />
        <ellipse cx="155" cy="56" rx="50" ry="26" />
        <ellipse cx="110" cy="66" rx="80" ry="20" />
      </g>
    </svg>
  );
}

export function SkyBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* clouds */}
      <Cloud className="cloud-drift absolute -left-10 top-6 w-72 opacity-70 blur-[6px]" />
      <Cloud className="cloud-drift absolute right-[-3rem] top-24 w-96 opacity-60 blur-[8px] [animation-delay:-14s]" />
      <Cloud className="cloud-drift absolute left-1/3 bottom-24 hidden w-80 opacity-40 blur-[10px] [animation-delay:-28s] md:block" />

      {/* balloon bouquet, bottom-right; strings gather to one point */}
      <svg viewBox="0 0 400 620" className="absolute -right-20 bottom-[-4rem] h-[52vh] max-h-[760px] opacity-35 md:right-6 md:h-[78vh] md:opacity-90">
        <BalloonDefs />
        <g stroke="#cdb38a" strokeWidth="1.2" fill="none" opacity="0.8">
          <path d="M130 170 C 150 330, 190 460, 215 600" />
          <path d="M270 220 C 255 360, 235 470, 215 600" />
          <path d="M185 330 C 195 430, 205 520, 215 600" />
          <path d="M320 360 C 290 450, 245 530, 215 600" />
        </g>
        <g className="balloon-bob">
          <g transform="translate(30 70) scale(1)"><Clover tint="yellow" /></g>
        </g>
        <g className="balloon-bob [animation-delay:-2s]">
          <g transform="translate(190 130) scale(0.85)"><Clover tint="mint" /></g>
        </g>
        <g className="balloon-bob [animation-delay:-4s]">
          <g transform="translate(250 270) scale(0.8)"><Clover tint="pink" /></g>
        </g>
        <g className="balloon-bob [animation-delay:-1s]">
          <g transform="translate(95 235) scale(0.95)"><Clover tint="blue" /></g>
        </g>
      </svg>

      {/* a single small balloon top-left for balance */}
      <svg viewBox="0 0 200 330" className="balloon-bob absolute left-4 top-28 hidden w-24 opacity-80 [animation-delay:-3s] lg:block">
        <BalloonDefs />
        <path d="M100 160 C 95 220, 110 270, 100 330" stroke="#cdb38a" strokeWidth="1.5" fill="none" />
        <Clover tint="pink" />
      </svg>

      {/* soft white horizon */}
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white/70 to-transparent" />
    </div>
  );
}
