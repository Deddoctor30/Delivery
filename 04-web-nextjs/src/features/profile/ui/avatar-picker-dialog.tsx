"use client";

import { Camera, Check } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { AVATAR_OPTIONS, avatarSrc, type AvatarId, type User } from "@/entities/user";
import { cn } from "@/shared/lib/utils";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui";

import { updateProfileAction } from "../api/actions";

interface AvatarPickerDialogProps {
  currentAvatarId: string | null;
  /** Вызывается с обновлённым пользователем после успешного сохранения. */
  onUpdated: (user: User) => void;
}

/** Кнопка «Сменить фото» + модалка выбора преднастроенного аватара. */
export function AvatarPickerDialog({ currentAvatarId, onUpdated }: AvatarPickerDialogProps) {
  const [open, setOpen] = useState(false);
  const [saving, startSaving] = useTransition();

  function choose(avatarId: AvatarId) {
    if (avatarId === currentAvatarId) {
      setOpen(false);
      return;
    }
    startSaving(() => {
      void updateProfileAction({ avatarId }).then((res) => {
        if (res.ok) {
          onUpdated(res.user);
          toast.success("Аватар обновлён");
          setOpen(false);
        } else {
          toast.error(res.error);
        }
      });
    });
  }

  return (
    <>
      <Button variant="ghost" className="w-full" onClick={() => setOpen(true)}>
        <Camera className="size-4" aria-hidden="true" />
        Сменить фото
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Выбор аватара</DialogTitle>
            <DialogDescription>Выберите один из преднастроенных аватаров.</DialogDescription>
          </DialogHeader>
          <div className="flex justify-center gap-6 py-2">
            {AVATAR_OPTIONS.map((opt) => {
              const selected = opt.id === currentAvatarId;
              return (
                <button
                  key={opt.id}
                  type="button"
                  disabled={saving}
                  onClick={() => choose(opt.id)}
                  className="flex flex-col items-center gap-2 disabled:opacity-60"
                >
                  <div className="relative">
                    <Avatar
                      size="lg"
                      className={cn(
                        "size-20 ring-2 ring-transparent transition-shadow",
                        selected && "ring-primary",
                      )}
                    >
                      <AvatarImage src={avatarSrc(opt.id) ?? undefined} alt={opt.label} />
                      <AvatarFallback variant="muted">{opt.label[0]}</AvatarFallback>
                    </Avatar>
                    {selected && (
                      <span className="absolute -right-1 -bottom-1 flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <Check className="size-3.5" aria-hidden="true" />
                      </span>
                    )}
                  </div>
                  <span className="font-sans text-[13px] text-foreground">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
