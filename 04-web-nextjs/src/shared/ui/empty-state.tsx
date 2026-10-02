import { type ReactNode } from "react";

import { cn } from "@/shared/lib/utils";

interface EmptyStateProps {
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "bg-card border-border flex flex-col items-center justify-center gap-4 rounded-lg border p-6 text-center",
        className,
      )}
    >
      {icon && <div className="flex size-40 items-center justify-center">{icon}</div>}
      <p className="font-heading text-foreground w-full text-center text-lg font-semibold">
        {title}
      </p>
      {description && (
        <p className="text-muted-foreground w-full text-center text-sm leading-[1.4]">
          {description}
        </p>
      )}
      {action && <div className="flex items-center justify-center gap-2">{action}</div>}
    </div>
  );
}
