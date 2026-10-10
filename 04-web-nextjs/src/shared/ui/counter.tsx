"use client";

import { cn } from "@/shared/lib/utils";
import { Minus, Plus } from "lucide-react";

interface CounterProps {
  value: number;
  onIncrement?: () => void;
  onDecrement?: () => void;
  onValueChange?: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  className?: string;
}

function Counter({
  value,
  onIncrement,
  onDecrement,
  onValueChange,
  min,
  max,
  disabled = false,
  className,
}: CounterProps) {
  const handleDecrement = () => {
    if (disabled) return;
    if (min !== undefined && value <= min) return;
    if (onDecrement) {
      onDecrement();
    } else if (onValueChange) {
      onValueChange(value - 1);
    }
  };

  const handleIncrement = () => {
    if (disabled) return;
    if (max !== undefined && value >= max) return;
    if (onIncrement) {
      onIncrement();
    } else if (onValueChange) {
      onValueChange(value + 1);
    }
  };

  const decrementDisabled = disabled || (min !== undefined && value <= min);
  const incrementDisabled = disabled || (max !== undefined && value >= max);

  return (
    <div
      className={cn(
        "inline-flex justify-center rounded-md border border-border bg-card",
        disabled && "opacity-50",
        className,
      )}
    >
      <button
        type="button"
        aria-label="Уменьшить"
        onClick={handleDecrement}
        disabled={decrementDisabled}
        className="flex h-9 w-20 items-center justify-center transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
      >
        <Minus className="size-3.5 text-foreground" />
      </button>

      <div className="flex h-9 w-11 items-center justify-center">
        <span className="font-mono text-sm font-semibold text-foreground">{value}</span>
      </div>

      <button
        type="button"
        aria-label="Увеличить"
        onClick={handleIncrement}
        disabled={incrementDisabled}
        className="flex h-9 w-20 items-center justify-center transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
      >
        <Plus className="size-3.5 text-foreground" />
      </button>
    </div>
  );
}

export { Counter };
export type { CounterProps };
