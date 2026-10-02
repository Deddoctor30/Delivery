import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/shared/lib/utils";

const alertVariants = cva("flex w-full items-start gap-3 rounded-lg p-3.5", {
  variants: {
    variant: {
      default: "bg-muted text-foreground",
      success: "bg-success text-success-foreground",
      warning: "bg-warning text-warning-foreground",
      error: "bg-error text-error-foreground",
      info: "bg-info text-info-foreground",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

type AlertProps = React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>;

function Alert({ className, variant, ...props }: AlertProps) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  );
}

function AlertIcon({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="alert-icon"
      className={cn("mt-0.5 shrink-0 [&_svg]:size-[18px]", className)}
      {...props}
    />
  );
}

function AlertTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h5
      data-slot="alert-title"
      className={cn("font-heading text-sm font-semibold leading-tight", className)}
      {...props}
    />
  );
}

function AlertDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      data-slot="alert-description"
      className={cn("font-sans text-[13px] leading-snug opacity-85", className)}
      {...props}
    />
  );
}

function AlertBody({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="alert-body"
      className={cn("flex flex-1 flex-col gap-0.5", className)}
      {...props}
    />
  );
}

export { Alert, AlertIcon, AlertBody, AlertTitle, AlertDescription, alertVariants };
export type { AlertProps };
