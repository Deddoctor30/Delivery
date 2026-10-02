"use client";

import { LogOut, User as UserIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/shared/ui";

import { useSession } from "../model/session";
import { AuthModal } from "./auth-modal";

export function AuthButton() {
  const { user, logout } = useSession();
  const [open, setOpen] = useState(false);

  if (user) {
    return (
      <div className="flex items-center gap-2">
        <span className="max-sm:hidden text-sm text-muted-foreground">{user.email}</span>
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
