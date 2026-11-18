import { cva, type VariantProps } from "class-variance-authority";
import { Text, View } from "react-native";

import { cn } from "@/shared/lib/utils";

const badge = cva("self-start rounded-full px-2 py-0.5", {
  variants: {
    variant: {
      default: "bg-primary",
      secondary: "bg-secondary",
      success: "bg-success",
      warning: "bg-warning",
      destructive: "bg-destructive",
      discount: "bg-destructive",
    },
  },
  defaultVariants: { variant: "default" },
});

const badgeText = cva("font-inter-semibold text-xs", {
  variants: {
    variant: {
      default: "text-primary-foreground",
      secondary: "text-secondary-foreground",
      success: "text-success-foreground",
      warning: "text-warning-foreground",
      destructive: "text-destructive-foreground",
      discount: "text-destructive-foreground",
    },
  },
  defaultVariants: { variant: "default" },
});

export interface BadgeProps extends VariantProps<typeof badge> {
  label: string;
  className?: string;
}

export function Badge({ label, variant, className }: BadgeProps) {
  return (
    <View className={cn(badge({ variant }), className)}>
      <Text className={cn(badgeText({ variant }))}>{label}</Text>
    </View>
  );
}
