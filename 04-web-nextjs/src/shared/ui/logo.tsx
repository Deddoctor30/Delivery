import { cn } from "@/shared/lib/utils";

interface LogoProps {
  className?: string;
  size?: number;
}

/**
 * Brand logo: rounded-square mark (bg-primary) + "Delivery" wordmark (text-foreground).
 * Extracted from Pencil node qrSOa. Theme-adaptive via token classes.
 */
export function Logo({ className, size = 24 }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Mark — rectangle with cornerRadius 8, fill $--primary */}
      <span
        className="bg-primary flex-shrink-0 rounded-md"
        style={{ width: size, height: size }}
        aria-hidden="true"
      />
      {/* Wordmark — Geist 600, fill $--foreground */}
      <span
        className="font-heading text-foreground font-semibold leading-none"
        style={{ fontSize: size }}
      >
        Delivery
      </span>
    </div>
  );
}
