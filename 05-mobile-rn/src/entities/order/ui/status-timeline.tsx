import { Check, X } from "lucide-react-native";
import { Text, View } from "react-native";

import { cn } from "@/shared/lib/utils";

import { ORDER_STATUS_LABELS, ORDER_STATUS_SEQUENCE, type OrderStatus } from "../model/types";

type StepState = "done" | "current" | "upcoming" | "cancelled";

function stepState(step: OrderStatus, current: OrderStatus): StepState {
  const ci = ORDER_STATUS_SEQUENCE.indexOf(current);
  const si = ORDER_STATUS_SEQUENCE.indexOf(step);
  if (si < ci) return "done";
  if (si === ci) return "current";
  return "upcoming";
}

function Dot({ state }: { state: StepState }) {
  if (state === "done")
    return (
      <View className="h-4 w-4 items-center justify-center rounded-full bg-primary">
        <Check size={10} color="#ffffff" strokeWidth={3} />
      </View>
    );
  if (state === "current")
    return (
      <View className="h-4 w-4 items-center justify-center rounded-full border-[3px] border-primary bg-card">
        <View className="h-1.5 w-1.5 rounded-full bg-primary" />
      </View>
    );
  if (state === "cancelled")
    return (
      <View className="h-4 w-4 items-center justify-center rounded-full bg-destructive">
        <X size={10} color="#ffffff" strokeWidth={3} />
      </View>
    );
  return <View className="h-4 w-4 rounded-full border border-border bg-muted" />;
}

export function StatusTimeline({
  currentStatus,
  timestamps,
  className,
}: {
  currentStatus: OrderStatus;
  timestamps?: Partial<Record<OrderStatus, string>>;
  className?: string;
}) {
  const isCancelled = currentStatus === "cancelled";

  return (
    <View className={cn("", className)}>
      {ORDER_STATUS_SEQUENCE.map((step, i) => {
        const state = stepState(step, currentStatus);
        const isLast = i === ORDER_STATUS_SEQUENCE.length - 1;
        const active = state === "done" || state === "current";
        return (
          <View key={step} className="flex-row gap-3">
            <View className="items-center">
              <Dot state={state} />
              {(!isLast || isCancelled) && (
                <View className="w-0.5 flex-1 bg-border" style={{ minHeight: 32 }} />
              )}
            </View>
            <View className={cn("pb-6", isLast && !isCancelled && "pb-0")}>
              <Text
                className={cn(
                  "text-sm",
                  active ? "text-foreground" : "text-muted-foreground",
                  state === "current" ? "font-inter-bold" : "font-inter-medium",
                )}
              >
                {ORDER_STATUS_LABELS[step]}
              </Text>
              <Text className="mt-0.5 font-sans text-xs text-muted-foreground">
                {timestamps?.[step] ?? "—"}
              </Text>
            </View>
          </View>
        );
      })}

      {isCancelled && (
        <View className="flex-row gap-3">
          <View className="items-center">
            <Dot state="cancelled" />
          </View>
          <View>
            <Text className="font-inter-medium text-sm text-destructive">
              {ORDER_STATUS_LABELS.cancelled}
            </Text>
            <Text className="mt-0.5 font-sans text-xs text-muted-foreground">
              {timestamps?.cancelled ?? "—"}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}
