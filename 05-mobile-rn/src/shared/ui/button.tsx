import { cva, type VariantProps } from "class-variance-authority";
import { ActivityIndicator, Pressable, Text, type PressableProps } from "react-native";

import { cn } from "@/shared/lib/utils";

const button = cva(
  "flex-row items-center justify-center gap-2 rounded-lg active:opacity-80 disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary",
        secondary: "bg-secondary",
        outline: "border border-border bg-transparent",
        ghost: "bg-transparent",
        destructive: "bg-destructive",
      },
      size: { sm: "h-9 px-3", md: "h-11 px-4", lg: "h-12 px-6" },
    },
    defaultVariants: { variant: "default", size: "md" },
  },
);

const buttonText = cva("font-inter-semibold text-sm", {
  variants: {
    variant: {
      default: "text-primary-foreground",
      secondary: "text-secondary-foreground",
      outline: "text-foreground",
      ghost: "text-foreground",
      destructive: "text-destructive-foreground",
    },
  },
  defaultVariants: { variant: "default" },
});

export interface ButtonProps
  extends Omit<PressableProps, "children">,
    VariantProps<typeof button> {
  label: string;
  loading?: boolean;
  className?: string;
}

export function Button({ label, variant, size, loading, disabled, className, ...props }: ButtonProps) {
  return (
    <Pressable className={cn(button({ variant, size }), className)} disabled={disabled || loading} {...props}>
      {loading ? <ActivityIndicator /> : <Text className={cn(buttonText({ variant }))}>{label}</Text>}
    </Pressable>
  );
}
