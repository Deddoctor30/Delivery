"use client";

import { Cookie } from "lucide-react";
import Link from "next/link";
import { useSyncExternalStore, useState } from "react";

import { Button, buttonVariants } from "@/shared/ui";
import { cn } from "@/shared/lib/utils";

const CONSENT_KEY = "cookie-consent";

function getSnapshot() {
  return !localStorage.getItem(CONSENT_KEY);
}

function getServerSnapshot() {
  return false;
}

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

export function CookieBanner({ className }: { className?: string }) {
  const shouldShow = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [dismissed, setDismissed] = useState(false);

  const visible = shouldShow && !dismissed;

  function accept() {
    localStorage.setItem(CONSENT_KEY, "accepted");
    setDismissed(true);
  }

  if (!visible) return null;

  return (
    <div
      className={cn("fixed bottom-0 left-0 right-0 z-50 flex justify-center px-4 pb-4", className)}
    >
      <div
        className={cn(
          "flex w-full max-w-[1280px] items-center justify-between gap-6",
          "rounded-lg border border-border bg-card py-5 px-6",
          "shadow-lg",
        )}
      >
        {/* Text column */}
        <div className="flex flex-1 flex-col gap-1.5">
          {/* Header */}
          <div className="flex items-center gap-2">
            <Cookie className="size-[18px] shrink-0 text-primary" />
            <span className="font-heading text-[15px] font-semibold text-foreground">
              Мы используем cookie
            </span>
          </div>
          {/* Description */}
          <p className="text-[13px] leading-[1.45] text-muted-foreground">
            Мы используем файлы cookie, чтобы улучшить работу сайта и персонализировать ваш опыт
            покупок. Продолжая, вы соглашаетесь с нашей{" "}
            <Link
              href="/legal/cookies"
              className="underline underline-offset-2 hover:text-foreground transition-colors"
            >
              политикой
            </Link>
            .
          </p>
        </div>

        {/* Buttons */}
        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/legal/cookies"
            className={buttonVariants({
              variant: "outline",
              size: "default",
              className: "h-9 px-4",
            })}
          >
            Подробнее
          </Link>
          <Button variant="default" size="default" onClick={accept} className="h-9 px-5">
            Принять
          </Button>
        </div>
      </div>
    </div>
  );
}
