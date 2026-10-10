import { cn } from "@/shared/lib/utils";

export type IllustrationName = "empty-cart" | "no-orders" | "not-found";

interface IllustrationProps {
  name: IllustrationName;
  size?: number;
  className?: string;
}

/* ─────────────────────────────────────────────
   Empty Cart (LV0Zw)
   160×160 canvas, shapes absolute-positioned:
   – Bag body: rect 64×64 at (48,64), r=8, stroke muted-foreground
   – Handle:   path at (48,36), 64×32, stroke muted-foreground
   – Accent:   ellipse 10×10 at (104,32), fill primary
───────────────────────────────────────────── */
function EmptyCartSVG({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 160 160" width={size} height={size} fill="none" aria-hidden="true">
      {/* Handle */}
      <path
        d="M60 68c0-24 40-24 40 0"
        className="stroke-muted-foreground"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Bag Body */}
      <rect
        x="48"
        y="64"
        width="64"
        height="64"
        rx="8"
        className="stroke-muted-foreground"
        strokeWidth="2.5"
      />
      {/* Accent dot */}
      <ellipse cx="109" cy="37" rx="5" ry="5" className="fill-primary" />
    </svg>
  );
}

/* ─────────────────────────────────────────────
   No Orders (YyUTA)
   160×160 canvas:
   – Box body: rect 80×68 at (40,54), r=6, stroke muted-foreground
   – Tape:     path at (40,54), lines across top + flaps, stroke muted-foreground
   – Accent:   ellipse 10×10 at (114,38), fill primary
───────────────────────────────────────────── */
function NoOrdersSVG({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 160 160" width={size} height={size} fill="none" aria-hidden="true">
      {/* Tape lines: horizontal strip + two vertical flaps */}
      <path
        d="M40 72l80 0m-48-18l0 18m16-18l0 18"
        className="stroke-muted-foreground"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Box body */}
      <rect
        x="40"
        y="54"
        width="80"
        height="68"
        rx="6"
        className="stroke-muted-foreground"
        strokeWidth="2.5"
      />
      {/* Accent dot */}
      <ellipse cx="119" cy="43" rx="5" ry="5" className="fill-primary" />
    </svg>
  );
}

/* ─────────────────────────────────────────────
   404 (PYFVv)
   160×160 canvas, vertical layout centred:
   – "404" text: 56px Geist bold, fill muted-foreground
   – Accent line: rect 40×3, r=2, fill primary, below text
   Rendered as SVG text so it scales with the container.
───────────────────────────────────────────── */
function NotFoundSVG({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 160 160" width={size} height={size} fill="none" aria-hidden="true">
      <text
        x="80"
        y="92"
        textAnchor="middle"
        fontFamily="Geist, sans-serif"
        fontSize="56"
        fontWeight="700"
        className="fill-muted-foreground"
      >
        404
      </text>
      {/* Accent underline */}
      <rect x="60" y="104" width="40" height="3" rx="2" className="fill-primary" />
    </svg>
  );
}

const illustrations: Record<IllustrationName, (props: { size: number }) => React.ReactElement> = {
  "empty-cart": EmptyCartSVG,
  "no-orders": NoOrdersSVG,
  "not-found": NotFoundSVG,
};

/**
 * Illustration — набор тематических inline-SVG иллюстраций.
 * Цвета через токены (fill-primary, stroke-muted-foreground) — работает в обеих темах.
 *
 * @param name     "empty-cart" | "no-orders" | "not-found"
 * @param size     ширина/высота в px (квадрат), по умолчанию 160
 * @param className дополнительные Tailwind-классы на обёртке
 */
export function Illustration({ name, size = 160, className }: IllustrationProps) {
  const SVG = illustrations[name];

  return (
    <div className={cn("inline-flex items-center justify-center", className)}>
      <SVG size={size} />
    </div>
  );
}
