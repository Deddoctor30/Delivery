"use client";

import Link from "next/link";
import { LogOut, Shield, User as UserIcon } from "lucide-react";
import { useState } from "react";

import { Button, buttonVariants } from "@/shared/ui";
import { cn } from "@/shared/lib/utils";

import { useSession } from "../model/session";
import { AuthModal } from "./auth-modal";

export function AuthButton() {
  const { user, logout } = useSession();
  const [open, setOpen] = useState(false);

  if (user) {
    return (
      <div className="flex items-center gap-1">
        {user.role === "ADMIN" && (
          <Link
            href="/admin/users"
            aria-label="Админка"
            className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
          >
            <Shield className="size-5" />
          </Link>
        )}
        <Link
          href="/account"
          aria-label="Личный кабинет"
          className={cn(buttonVariants({ variant: "ghost" }), "gap-2")}
        >
          <UserIcon className="size-5" />
          <span className="max-sm:hidden text-sm text-muted-foreground">{user.email}</span>
        </Link>
        <Button variant="ghost" size="icon" aria-label="Выйти" onClick={() => logout()}>
          <LogOut className="size-5" />
        </Button>
      </div>
    );
  }

  return (
    <>
      <Button variant="ghost" size="icon" aria-label="Войти" onClick={() => setOpen(true)}>
        <UserIcon className="size-5" />
      </Button>
      <AuthModal open={open} onOpenChange={setOpen} />
    </>
  );
}
