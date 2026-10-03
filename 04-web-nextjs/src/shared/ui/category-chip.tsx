import { type LucideIcon } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/shared/lib/utils";

export const categoryChipVariants = cva(
  "inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-[13px] font-medium transition-colors select-none",
  {
    variants: {
      variant: {
        /** Default — card background with border (PmkqR) */
        default: "bg-card text-foreground border border-border hover:bg-secondary",
        /** Active / selected — primary fill chip (DERZW) */
        active: "bg-primary text-primary-foreground hover:bg-primary/90",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface CategoryChipProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof categoryChipVariants> {
  /** Lucide icon to display on the left */
  icon?: LucideIcon;
  /** Label text shown next to the icon */
  label: string;
  /** Whether the chip is in the active/selected state */
  isActive?: boolean;
}

export function CategoryChip({
  icon: Icon,
  label,
  isActive = false,
  variant,
  className,
  ...props
}: CategoryChipProps) {
  const resolvedVariant = variant ?? (isActive ? "active" : "default");

  return (
    <button
      type="button"
      aria-pressed={isActive}
      className={cn(categoryChipVariants({ variant: resolvedVariant }), className)}
      {...props}
    >
      {Icon && (
        <Icon
          className={cn(
            "size-3.5 shrink-0",
            resolvedVariant === "active" ? "text-primary-foreground" : "text-muted-foreground",
          )}
        />
      )}
      <span>{label}</span>
    </button>
  );
}
