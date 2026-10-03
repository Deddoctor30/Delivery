"use client";

/**
 * ProductGallery — client-остров: выбор активного фото из набора миниатюр.
 *
 * Pencil: MainImage — fill, h=540, bg=$--secondary, cornerRadius=$--radius-xl.
 * Thumbs — горизонтальный flex, gap=12, высота 96, cornerRadius=$--radius-lg.
 * Активная миниатюра: stroke=$--primary, strokeWidth=2.
 */

import { useState } from "react";
import Image from "next/image";
import { ImageOff } from "lucide-react";

import { cn } from "@/shared/lib/utils";

interface ProductGalleryProps {
  images: string[];
  title: string;
  discountLabel?: string;
}

export function ProductGallery({ images, title, discountLabel }: ProductGalleryProps) {
  const [activeIdx, setActiveIdx] = useState(0);

  const hasImages = images.length > 0;
  const activeImage = hasImages ? images[activeIdx] : null;

  return (
    <div className="flex w-full flex-col gap-3">
      {/* ── Главное фото ──────────────────────────────────────────────── */}
      {/* Pencil: MainImage h=540 bg=$--secondary rounded-xl centered */}
      <div className="relative flex h-[540px] w-full items-center justify-center overflow-hidden rounded-xl bg-secondary">
        {activeImage ? (
          <Image
            src={activeImage}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, 600px"
            className="object-contain"
            priority
          />
        ) : (
          <ImageOff className="size-36 text-muted-foreground" />
        )}

        {/* Pencil: Discount badge — layoutPosition absolute, x=24 y=24 */}
        {discountLabel && (
          <span className="absolute left-6 top-6 inline-flex items-center rounded-full bg-destructive px-2 py-[3px] font-mono text-xs font-semibold text-destructive-foreground">
            {discountLabel}
          </span>
        )}
      </div>

      {/* ── Миниатюры ─────────────────────────────────────────────────── */}
      {/* Pencil: Thumbs gap=12, 5 ячеек fill_container, h=96, rounded-lg */}
      {hasImages && (
        <div className="grid grid-cols-5 gap-3">
          {images.map((src, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Фото ${i + 1}`}
              onClick={() => setActiveIdx(i)}
              className={cn(
                "relative flex h-24 items-center justify-center overflow-hidden rounded-lg bg-secondary transition-shadow",
                activeIdx === i
                  ? "ring-2 ring-primary ring-offset-0"
                  : "hover:ring-1 hover:ring-border",
              )}
            >
              <Image
                src={src}
                alt={`${title} — фото ${i + 1}`}
                fill
                sizes="120px"
                className="object-contain"
              />
            </button>
          ))}
        </div>
      )}

      {/* Плейсхолдер миниатюр если нет изображений — 5 серых ячеек */}
      {!hasImages && (
        <div className="grid grid-cols-5 gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-24 rounded-lg bg-secondary" />
          ))}
        </div>
      )}
    </div>
  );
}
