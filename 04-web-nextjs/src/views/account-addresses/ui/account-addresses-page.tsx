"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Check, MapPin, Pencil, Plus, Star, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import {
  Badge,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Button,
  Input,
  Label,
  MapPicker,
  type MapPickerCoords,
} from "@/shared/ui";
import { cn } from "@/shared/lib/utils";
import { formatAddress, type Address } from "@/entities/address";
import {
  createAddressAction,
  deleteAddressAction,
  setDefaultAddressAction,
  updateAddressAction,
  type AddressActionResult,
  type AddressInput,
} from "@/features/address";

const DEFAULT_COORDS: MapPickerCoords = { lat: 55.7558, lng: 37.6173 }; // Москва

type FormState = {
  label: string;
  city: string;
  street: string;
  apt: string;
  zip: string;
  comment: string;
  coords: MapPickerCoords;
  isDefault: boolean;
};

const emptyForm = (): FormState => ({
  label: "",
  city: "",
  street: "",
  apt: "",
  zip: "",
  comment: "",
  coords: DEFAULT_COORDS,
  isDefault: false,
});

const formFromAddress = (a: Address): FormState => ({
  label: a.label ?? "",
  city: a.city,
  street: a.street,
  apt: a.apt ?? "",
  zip: a.zip ?? "",
  comment: a.comment ?? "",
  coords: { lat: a.lat, lng: a.lng },
  isDefault: a.isDefault,
});

type Mode = null | { type: "new" } | { type: "edit"; id: string };

/**
 * AccountAddressesPage — экран «Адреса доставки» (/account/addresses).
 * Список сохранённых адресов + inline-форма добавления/редактирования с картой.
 * Данные приходят пропсом из RSC-роута; мутации — server actions (возвращают
 * актуальный список целиком → заменяем локальный стор).
 */
export function AccountAddressesPage({ initialAddresses }: { initialAddresses: Address[] }) {
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses);
  const [mode, setMode] = useState<Mode>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [pending, start] = useTransition();

  function openNew() {
    setForm(emptyForm());
    setMode({ type: "new" });
  }

  function openEdit(a: Address) {
    setForm(formFromAddress(a));
    setMode({ type: "edit", id: a.id });
  }

  function apply(res: AddressActionResult, successMsg: string) {
    if (res.ok) {
      setAddresses(res.addresses);
      toast.success(successMsg);
      setMode(null);
    } else {
      toast.error(res.error);
    }
  }

  function handleSave() {
    if (form.city.trim().length < 2 || form.street.trim().length < 3) {
      toast.error("Укажите город и улицу");
      return;
    }
    const input: AddressInput = {
      label: form.label.trim() || undefined,
      city: form.city.trim(),
      street: form.street.trim(),
      apt: form.apt.trim() || undefined,
      zip: form.zip.trim() || undefined,
      comment: form.comment.trim() || undefined,
      lat: form.coords.lat,
      lng: form.coords.lng,
      isDefault: form.isDefault,
    };
    start(async () => {
      const res =
        mode?.type === "edit"
          ? await updateAddressAction(mode.id, input)
          : await createAddressAction(input);
      apply(res, "Адрес сохранён");
    });
  }

  function handleDelete(id: string) {
    start(async () => {
      const res = await deleteAddressAction(id);
      if (res.ok) {
        setAddresses(res.addresses);
        toast.success("Адрес удалён");
      } else {
        toast.error(res.error);
      }
    });
  }

  function handleSetDefault(id: string) {
    start(async () => {
      const res = await setDefaultAddressAction(id);
      if (res.ok) setAddresses(res.addresses);
      else toast.error(res.error);
    });
  }

  const setField = (patch: Partial<FormState>) => setForm((prev) => ({ ...prev, ...patch }));

  return (
    <div className="flex flex-col gap-6 py-7 pb-20">
      {/* Breadcrumbs */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href="/" />}>Главная</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href="/account" />}>Личный кабинет</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Адреса доставки</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Title + add */}
      <div className="flex w-full items-end justify-between">
        <div className="flex flex-col gap-1.5">
          <h1 className="font-heading text-[28px] font-semibold leading-[1.2] text-foreground">
            Адреса доставки
          </h1>
          <p className="font-mono text-[13px] text-muted-foreground">
            {addresses.length === 0
              ? "Нет сохранённых адресов"
              : `Сохранено адресов: ${addresses.length}`}
          </p>
        </div>
        {mode === null && (
          <Button onClick={openNew}>
            <Plus className="size-4" aria-hidden="true" />
            Добавить адрес
          </Button>
        )}
      </div>

      {/* Форма (new/edit) */}
      {mode !== null && (
        <section className="flex flex-col gap-4 rounded-xl bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-[17px] font-semibold text-foreground">
              {mode.type === "edit" ? "Редактирование адреса" : "Новый адрес"}
            </h2>
            <Button variant="ghost" size="icon" aria-label="Закрыть" onClick={() => setMode(null)}>
              <X className="size-5" aria-hidden="true" />
            </Button>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="addr-label">Название (необязательно)</Label>
            <Input
              id="addr-label"
              placeholder="Дом, Работа…"
              value={form.label}
              onChange={(e) => setField({ label: e.target.value })}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="addr-street">Улица, дом</Label>
            <Input
              id="addr-street"
              placeholder="ул. Ленина, д. 10"
              value={form.street}
              onChange={(e) => setField({ street: e.target.value })}
            />
          </div>

          <div className="flex gap-4">
            <div className="flex flex-[2] flex-col gap-1.5">
              <Label htmlFor="addr-city">Город</Label>
              <Input
                id="addr-city"
                placeholder="Москва"
                value={form.city}
                onChange={(e) => setField({ city: e.target.value })}
              />
            </div>
            <div className="flex flex-1 flex-col gap-1.5">
              <Label htmlFor="addr-apt">Кв./офис</Label>
              <Input
                id="addr-apt"
                placeholder="42"
                value={form.apt}
                onChange={(e) => setField({ apt: e.target.value })}
              />
            </div>
            <div className="flex flex-1 flex-col gap-1.5">
              <Label htmlFor="addr-zip">Индекс</Label>
              <Input
                id="addr-zip"
                placeholder="101000"
                value={form.zip}
                onChange={(e) => setField({ zip: e.target.value })}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="addr-comment">Комментарий курьеру</Label>
            <Input
              id="addr-comment"
              placeholder="Код домофона, этаж, пожелания"
              value={form.comment}
              onChange={(e) => setField({ comment: e.target.value })}
            />
          </div>

          {/* Карта: точка на карте */}
          <div className="flex flex-col gap-1.5">
            <Label>Точка на карте</Label>
            <div className="overflow-hidden rounded-xl bg-card">
              <MapPicker
                value={form.coords}
                onChange={(coords) => setField({ coords })}
                height={260}
                className="rounded-none"
              />
            </div>
          </div>

          {/* Сделать основным */}
          <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={(e) => setField({ isDefault: e.target.checked })}
              className="size-4 accent-primary"
            />
            Сделать основным адресом
          </label>

          <div className="flex items-center gap-2.5">
            <Button onClick={handleSave} disabled={pending}>
              <Check className="size-4" aria-hidden="true" />
              {pending ? "Сохранение…" : "Сохранить адрес"}
            </Button>
            <Button variant="ghost" onClick={() => setMode(null)} disabled={pending}>
              Отмена
            </Button>
          </div>
        </section>
      )}

      {/* Список адресов */}
      {addresses.length === 0 && mode === null ? (
        <div className="flex flex-col items-center gap-3 rounded-xl bg-card p-10 text-center shadow-sm">
          <MapPin className="size-8 text-muted-foreground" aria-hidden="true" />
          <p className="font-caption text-sm text-muted-foreground">
            У вас пока нет сохранённых адресов. Добавьте первый — он будет подставляться при
            оформлении заказа.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {addresses.map((a) => (
            <div
              key={a.id}
              className={cn(
                "flex flex-col gap-3 rounded-xl bg-card p-5 shadow-sm",
                a.isDefault && "ring-1 ring-primary",
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex min-w-0 flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-heading text-[15px] font-semibold text-foreground">
                      {a.label || "Адрес"}
                    </span>
                    {a.isDefault && <Badge variant="primary">Основной</Badge>}
                  </div>
                  <p className="font-sans text-sm text-muted-foreground">{formatAddress(a)}</p>
                  {a.comment && (
                    <p className="font-caption text-xs text-muted-foreground">{a.comment}</p>
                  )}
                </div>
                <MapPin className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
              </div>

              <div className="flex items-center gap-2">
                {!a.isDefault && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSetDefault(a.id)}
                    disabled={pending}
                  >
                    <Star className="size-4" aria-hidden="true" />
                    Сделать основным
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openEdit(a)}
                  disabled={pending}
                  aria-label="Редактировать"
                >
                  <Pencil className="size-4" aria-hidden="true" />
                  Изменить
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(a.id)}
                  disabled={pending}
                  aria-label="Удалить"
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                  Удалить
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
