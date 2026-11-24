import { Minus, Plus } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import { cn } from "@/shared/lib/utils";

interface CounterProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  className?: string;
}

export function Counter({ value, onChange, min = 1, max = 99, className }: CounterProps) {
  return (
    <View className={cn("flex-row items-center self-start rounded-lg border border-border", className)}>
      <Pressable
        onPress={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        accessibilityRole="button"
        accessibilityLabel="Уменьшить"
        className="px-3 py-2 active:opacity-60 disabled:opacity-30"
      >
        <Minus size={16} color="#646a75" />
      </Pressable>
      <Text className="min-w-8 text-center font-inter-semibold text-foreground">{value}</Text>
      <Pressable
        onPress={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        accessibilityRole="button"
        accessibilityLabel="Увеличить"
        className="px-3 py-2 active:opacity-60 disabled:opacity-30"
      >
        <Plus size={16} color="#646a75" />
      </Pressable>
    </View>
  );
}
