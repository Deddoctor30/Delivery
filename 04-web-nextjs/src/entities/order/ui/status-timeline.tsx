import { Check, Circle, X } from "lucide-react";

import { cn } from "@/shared/lib/utils";

import { ORDER_STATUS_LABELS, ORDER_STATUS_SEQUENCE, type OrderStatus } from "../model/types";

export interface StatusTimelineProps {
  currentStatus: OrderStatus;
  timestamps?: Partial<Record<OrderStatus, string>>;
  className?: string;
}

type StepState = "done" | "current" | "upcoming" | "cancelled";

function getStepState(step: OrderStatus, currentStatus: OrderStatus): StepState {
  // When cancelled, sequence steps go neutral (upcoming) and the cancellation is
  // shown as a separate terminal step below — so indexOf("cancelled") = -1 here.
  const currentIndex = ORDER_STATUS_SEQUENCE.indexOf(currentStatus);
  const stepIndex = ORDER_STATUS_SEQUENCE.indexOf(step);
  if (stepIndex < currentIndex) return "done";
  if (stepIndex === currentIndex) return "current";
  return "upcoming";
}

interface StepDotProps {
  state: StepState;
}

function StepDot({ state }: StepDotProps) {
  if (state === "done") {
    return (
      <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary">
        <Check className="h-2.5 w-2.5 text-primary-foreground" strokeWidth={3} />
      </span>
    );
  }

  if (state === "current") {
    return (
      <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-[3px] border-primary bg-card">
        <Circle className="h-1.5 w-1.5 fill-primary text-primary" />
      </span>
    );
  }

  if (state === "cancelled") {
    return (
      <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-destructive">
        <X className="h-2.5 w-2.5 text-destructive-foreground" strokeWidth={3} />
      </span>
    );
  }

  // upcoming
  return (
    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-border bg-muted" />
  );
}

export function StatusTimeline({ currentStatus, timestamps, className }: StatusTimelineProps) {
  const isCancelled = currentStatus === "cancelled";

  return (
    <div className={cn("flex flex-col", className)}>
      {ORDER_STATUS_SEQUENCE.map((step, index) => {
        const state = getStepState(step, currentStatus);
        const isLast = index === ORDER_STATUS_SEQUENCE.length - 1;
        const time = timestamps?.[step];

        const titleClass =
          state === "done" || state === "current" ? "text-foreground" : "text-muted-foreground";

        const titleWeight = state === "current" ? "font-semibold" : "font-medium";

        return (
          <div key={step} className="flex gap-3">
            {/* Left column: dot + connector */}
            <div className="flex flex-col items-center">
              <StepDot state={state} />
              {(!isLast || isCancelled) && (
                <div className="w-0.5 flex-1 bg-border" style={{ minHeight: "36px" }} />
              )}
            </div>

            {/* Right column: title + time */}
            <div className={cn("flex flex-col pb-8", isLast && !isCancelled && "pb-0")}>
              <span className={cn("font-sans text-sm leading-4", titleClass, titleWeight)}>
                {ORDER_STATUS_LABELS[step]}
              </span>
              <span className="mt-1 font-mono text-xs text-muted-foreground">{time ?? "—"}</span>
            </div>
          </div>
        );
      })}

      {/* Cancelled: terminal step appended after sequence */}
      {isCancelled && (
        <div className="flex gap-3">
          <div className="flex flex-col items-center">
            <StepDot state="cancelled" />
          </div>
          <div className="flex flex-col">
            <span className="font-sans text-sm font-medium leading-4 text-destructive-foreground">
              {ORDER_STATUS_LABELS.cancelled}
            </span>
            <span className="mt-1 font-mono text-xs text-muted-foreground">
              {timestamps?.cancelled ?? "—"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
