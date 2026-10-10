"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Lock } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
} from "@/shared/ui";

import { changePasswordAction } from "../api/actions";

const schema = z
  .object({
    currentPassword: z.string().min(8, "Минимум 8 символов"),
    newPassword: z.string().min(8, "Минимум 8 символов"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Пароли не совпадают",
  });
type FormValues = z.infer<typeof schema>;

/** Кнопка «Сменить пароль» + модалка смены (features/profile). */
export function ChangePasswordDialog() {
  const [open, setOpen] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = handleSubmit(async (values) => {
    const res = await changePasswordAction({
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
    });
    if (res.ok) {
      toast.success("Пароль изменён");
      reset();
      setOpen(false);
    } else {
      toast.error(res.error);
    }
  });

  return (
    <>
      <Button variant="ghost" onClick={() => setOpen(true)}>
        <Lock className="size-4" aria-hidden="true" />
        Сменить пароль
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Смена пароля</DialogTitle>
            <DialogDescription>
              Введите текущий пароль и новый (минимум 8 символов).
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="cp-current">Текущий пароль</Label>
              <Input
                id="cp-current"
                type="password"
                autoComplete="current-password"
                {...register("currentPassword")}
              />
              {errors.currentPassword && (
                <p className="text-sm text-destructive">{errors.currentPassword.message}</p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="cp-new">Новый пароль</Label>
              <Input
                id="cp-new"
                type="password"
                autoComplete="new-password"
                {...register("newPassword")}
              />
              {errors.newPassword && (
                <p className="text-sm text-destructive">{errors.newPassword.message}</p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="cp-confirm">Повторите новый пароль</Label>
              <Input
                id="cp-confirm"
                type="password"
                autoComplete="new-password"
                {...register("confirmPassword")}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Сохраняем…" : "Сменить пароль"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
