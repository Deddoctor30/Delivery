import { MapPin } from "lucide-react";

import { cn } from "@/shared/lib/utils";

interface MapPlaceholderProps {
  className?: string;
  height?: number;
  children?: React.ReactNode;
}

/**
 * MapPlaceholder — презентационная обёртка под карту.
 * Отображает фон с сеткой и иконкой-пином по центру.
 * Когда children переданы — они рендерятся поверх плейсхолдера (слот под реальный SDK).
 */
export function MapPlaceholder({ className, height = 400, children }: MapPlaceholderProps) {
  return (
    <div
      className={cn("relative w-full overflow-hidden rounded-md bg-muted", className)}
      style={{ height }}
    >
      {/* Decorative grid — вертикальные и горизонтальные линии из Pencil */}
      <svg aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full">
        {/* Вертикальные линии через каждые 40px (640px / 40 = 16 линий) */}
        {Array.from({ length: 15 }, (_, i) => (i + 1) * 40).map((x) => (
          <line
            key={`v-${x}`}
            x1={`${(x / 640) * 100}%`}
            y1="0"
            x2={`${(x / 640) * 100}%`}
            y2="100%"
            className="stroke-border"
            strokeWidth="1"
            strokeOpacity="0.5"
          />
        ))}
        {/* Горизонтальные линии через каждые 40px (400px / 40 = 10 линий) */}
        {Array.from({ length: 9 }, (_, i) => (i + 1) * 40).map((y) => (
          <line
            key={`h-${y}`}
            x1="0"
            y1={`${(y / 400) * 100}%`}
            x2="100%"
            y2={`${(y / 400) * 100}%`}
            className="stroke-border"
            strokeWidth="1"
            strokeOpacity="0.5"
          />
        ))}
      </svg>

      {/* Центральный блок: иконка + подпись */}
      {!children && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
          <MapPin className="h-8 w-8 text-primary" strokeWidth={1.5} />
          <span className="text-sm font-medium text-muted-foreground">Карта</span>
        </div>
      )}

      {/* Слот под реальную карту */}
      {children && <div className="absolute inset-0">{children}</div>}
    </div>
  );
}
