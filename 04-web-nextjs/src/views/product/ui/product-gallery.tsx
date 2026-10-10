/**
 * ProductGallery — главное фото товара.
 *
 * Товары одно-картиночные (бэк отдаёт один imageUrl), поэтому ряд миниатюр не нужен.
 * Pencil: MainImage — fill, h=540, bg=$--secondary, cornerRadius=$--radius-xl.
 */

import Image from "next/image";
import { ImageOff } from "lucide-react";

interface ProductGalleryProps {
  image: string | null;
  title: string;
  discountLabel?: string;
}

export function ProductGallery({ image, title, discountLabel }: ProductGalleryProps) {
  return (
    <div className="relative flex h-135 w-full items-center justify-center overflow-hidden rounded-xl bg-secondary">
      {image ? (
        <Image
          src={image}
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
        <span className="absolute left-6 top-6 inline-flex items-center rounded-full bg-destructive px-2 py-0.75 font-mono text-xs font-semibold text-destructive-foreground">
          {discountLabel}
        </span>
      )}
    </div>
  );
}
