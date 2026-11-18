import { View, type ViewProps } from "react-native";

import { cn } from "@/shared/lib/utils";

export function Card({ className, ...props }: ViewProps) {
  return <View className={cn("rounded-xl bg-card p-4", className)} {...props} />;
}
