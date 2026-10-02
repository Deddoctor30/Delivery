import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/shared/lib/utils";

export const badgeVariants = cva(
  "inline-flex items-center rounded-full font-caption text-xs font-medium",
  {
    variants: {
      variant: {
        /** Label/Default — neutral grey chip */
        default: "bg-secondary text-secondary-foreground px-[10px] py-[3px]",
        /** Label/Primary — brand blue */
        primary: "bg-primary text-primary-foreground px-[10px] py-[3px]",
        /** Label/Success — tinted green bg, dark green text */
        success: "bg-success text-success-foreground px-[10px] py-[3px]",
        /** Label/Warning — tinted amber bg, dark amber text */
        warning: "bg-warning text-warning-foreground px-[10px] py-[3px]",
        /** Label/Error — tinted red bg, dark red text */
        error: "bg-error text-error-foreground px-[10px] py-[3px]",
        /** Label/Info — tinted blue bg, medium blue text */
        info: "bg-info text-info-foreground px-[10px] py-[3px]",
        /** Label/Discount — solid red, white Geist Mono, tighter padding */
        discount:
          "bg-destructive text-destructive-foreground font-mono font-semibold px-2 py-[3px]",
        /** Label/CartBadge — 18×18 circle counter, Geist Mono bold */
        cartBadge:
          "bg-destructive text-destructive-foreground font-mono font-bold w-[18px] h-[18px] p-0 justify-center text-[10px] leading-none",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}
