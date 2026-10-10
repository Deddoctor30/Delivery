"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/shared/ui";

import type { User } from "@/entities/user";

import { authErrorMessage, type AuthMode } from "../lib/auth-error";
import { useSession } from "../model/session";

const schema = z.object({
  email: z.email("Некорректный email"),
  password: z.string().min(8, "Минимум 8 символов"),
});
type FormValues = z.infer<typeof schema>;

type Mode = AuthMode;

export function AuthModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (value: boolean) => void;
}) {
  const { setUser } = useSession();
  const [mode, setMode] = useState<Mode>("login");
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  // mode передаём на бэк: 'login' — только существующий аккаунт, 'register' — только новый.
  const onSubmit = handleSubmit(async (values) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...values, mode }),
    });
    const data = (await res.json().catch(() => ({}))) as { user?: User; code?: string };
    if (!res.ok || !data.user) {
      toast.error(authErrorMessage(res.status, data.code, mode));
      return;
    }
    setUser(data.user);
    toast.success(mode === "register" ? "Аккаунт создан!" : "Добро пожаловать!");
    reset();
    onOpenChange(false);
  });

  const isRegister = mode === "register";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-105 max-w-[calc(100%-2rem)] gap-5 rounded-xl bg-card p-10">
        <DialogHeader className="gap-1.5">
          <DialogTitle className="font-heading text-2xl font-bold text-foreground">
            {isRegister ? "Создать аккаунт" : "Войти в аккаунт"}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {isRegister
              ? "Укажите email и пароль — мы создадим аккаунт"
              : "Введите email и пароль для входа"}
          </p>
        </DialogHeader>

        <Tabs value={mode} onValueChange={(value) => setMode(value as Mode)}>
          <TabsList className="w-full rounded-md bg-muted p-1">
            <TabsTrigger value="login" className="flex-1">
              Войти
            </TabsTrigger>
            <TabsTrigger value="register" className="flex-1">
              Регистрация
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <form onSubmit={onSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="Введите email"
              aria-invalid={!!errors.email}
              {...register("email")}
            />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">Пароль</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete={isRegister ? "new-password" : "current-password"}
                placeholder="Введите пароль"
                aria-invalid={!!errors.password}
                className="pr-10"
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>

          {!isRegister && (
            <div className="flex justify-end">
              <button type="button" className="text-[13px] text-primary hover:underline">
                Забыли пароль?
              </button>
            </div>
          )}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-auto w-full py-3.5 text-base font-medium"
          >
            {isSubmitting
              ? isRegister
                ? "Создаём…"
                : "Входим…"
              : isRegister
                ? "Зарегистрироваться"
                : "Войти"}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            Продолжая, вы принимаете{" "}
            <Link
              href="/legal/privacy"
              onClick={() => onOpenChange(false)}
              className="text-primary hover:underline"
            >
              условия обработки данных
            </Link>
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
