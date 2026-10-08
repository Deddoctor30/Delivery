"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  Bell,
  ChevronRight,
  CreditCard,
  Gift,
  Heart,
  LifeBuoy,
  Lock,
  LogOut,
  MapPin,
  Package,
  Pencil,
  Phone,
  Mail,
  User,
  Check,
  ArrowRight,
} from "lucide-react";

import {
  Avatar,
  AvatarFallback,
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  buttonVariants,
} from "@/shared/ui";
import { cn } from "@/shared/lib/utils";
import { ProductCard } from "@/entities/product";
import { OrderCard } from "@/entities/order";
import type { Product } from "@/entities/product";
import type { Order } from "@/entities/order";
import { useSession } from "@/features/auth";
import { updateProfileAction } from "@/features/profile";

/* ── Mock data ──────────────────────────────────────────────────────────── */

const MOCK_FAVORITES: Product[] = [
  {
    id: "fav-1",
    title: "Наушники Sound X3",
    price: 4990,
    oldPrice: 6100,
    discountPercent: 18,
    inStock: true,
  },
  {
    id: "fav-2",
    title: "Кофемашина CremaOne",
    price: 32900,
    inStock: true,
  },
  {
    id: "fav-3",
    title: "Часы Move 2",
    price: 11400,
    oldPrice: 13900,
    discountPercent: 18,
    inStock: true,
  },
  {
    id: "fav-4",
    title: "Смартфон Pixel 9",
    price: 58900,
    inStock: true,
  },
  {
    id: "fav-5",
    title: "Колонка Boom 5",
    price: 6490,
    oldPrice: 7200,
    discountPercent: 10,
    inStock: true,
  },
  {
    id: "fav-6",
    title: "Чайник Smart 1.7л",
    price: 2490,
    inStock: true,
  },
];

/* ── Sidebar menu items ─────────────────────────────────────────────────── */

type MenuItem = {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
  active?: boolean;
  badge?: string;
};

const MENU_ITEMS: MenuItem[] = [
  { icon: User, label: "Профиль", href: "/account" },
  { icon: Package, label: "Мои заказы", href: "/orders" },
  { icon: Heart, label: "Избранное", href: "/account/favorites", active: true, badge: "6" },
  { icon: MapPin, label: "Адреса доставки", href: "/account/addresses" },
  { icon: CreditCard, label: "Способы оплаты", href: "/account/payments" },
  { icon: Bell, label: "Уведомления", href: "/account/notifications" },
];

/* ── Component ──────────────────────────────────────────────────────────── */

/**
 * AccountPage — экран «Личный кабинет».
 *
 * Pencil-фрейм FJsOk (Desktop/Личный кабинет).
 *
 * Структура (Body fWNW5, padding 28 170 80 170, gap 24):
 *  1. Breadcrumbs — Главная / Личный кабинет
 *  2. TitleRow — h1 + subtitle + кнопки Поддержка / Выйти
 *  3. Cols (gap 24):
 *     — Sidebar (280px): ProfileCard + Menu (6 пунктов)
 *     — Main: Stats (3 карточки) + Избранное (табы + 6 ProductCard) +
 *       Последние заказы (2 OrderCard) + Личные данные (форма)
 *
 * «use client» — из-за Tabs и сессии (профиль/выход).
 * Профиль/выход — из useSession; заказы — пропсами с сервера.
 * Избранное/бонусы пока mock (подключим отдельным этапом).
 */
interface AccountPageProps {
  recentOrders: Order[];
  ordersCount: number;
}

export function AccountPage({ recentOrders, ordersCount }: AccountPageProps) {
  const router = useRouter();
  const { user, setUser, logout } = useSession();

  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ");
  const displayName = fullName || user?.email || "Профиль";
  const initials = (
    [user?.firstName?.[0], user?.lastName?.[0]].filter(Boolean).join("") ||
    user?.email?.[0] ||
    "?"
  ).toUpperCase();
  const memberSince = user
    ? new Date(user.createdAt).toLocaleDateString("ru-RU", { month: "long", year: "numeric" })
    : "";

  /* ── Форма «Личные данные» ── */
  const [editing, setEditing] = useState(false);
  const [nameValue, setNameValue] = useState(fullName);
  const [phoneValue, setPhoneValue] = useState(user?.phone ?? "");
  const [saving, startSaving] = useTransition();

  function startEditing() {
    setNameValue(fullName);
    setPhoneValue(user?.phone ?? "");
    setEditing(true);
  }

  function cancelEditing() {
    setEditing(false);
  }

  function handleSave() {
    const trimmed = nameValue.trim();
    const parts = trimmed ? trimmed.split(/\s+/) : [];
    const firstName = parts[0] ?? "";
    const lastName = parts.slice(1).join(" ");
    const phone = phoneValue.trim();

    startSaving(() => {
      void updateProfileAction({
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        phone: phone || undefined,
      }).then((res) => {
        if (res.ok) {
          setUser(res.user);
          setEditing(false);
          toast.success("Данные сохранены");
        } else {
          toast.error(res.error);
        }
      });
    });
  }

  const stats = [
    { icon: Package, value: ordersCount.toLocaleString("ru-RU"), label: "заказов за всё время" },
    { icon: Heart, value: "6", label: "товаров в избранном" },
    { icon: Gift, value: "1 240", label: "бонусов на счёте" },
  ];

  function handleLogout() {
    void logout().then(() => router.push("/"));
  }

  return (
    <div className="flex flex-col gap-6 py-7 pb-20">
      {/* ── 1. Breadcrumbs ─────────────────────────────────────────── */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href="/" />}>Главная</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Личный кабинет</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* ── 2. TitleRow ────────────────────────────────────────────── */}
      {/* Pencil: TitleRow — fill_container, space_between, alignItems end */}
      <div className="flex w-full items-end justify-between">
        {/* L — vertical, gap 6 */}
        <div className="flex flex-col gap-1.5">
          {/* font-heading 36px 600 */}
          <h1 className="font-heading text-[36px] font-semibold leading-[1.1] text-foreground">
            Личный кабинет
          </h1>
          {/* font-mono 13px muted-foreground */}
          <p className="font-mono text-[13px] text-muted-foreground">
            {displayName}
            {memberSince && ` · с нами с ${memberSince}`}
          </p>
        </div>
        {/* R — horizontal, gap 8, alignItems center */}
        <div className="flex items-center gap-2">
          {/* SupportBtn — outline */}
          <Link
            href="/support"
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            <LifeBuoy className="size-4" aria-hidden="true" />
            Поддержка
          </Link>
          {/* LogoutBtn — реальный выход из сессии */}
          <Button variant="outline" onClick={handleLogout} aria-label="Выйти">
            <LogOut className="size-4" aria-hidden="true" />
            Выйти
          </Button>
        </div>
      </div>

      {/* ── 3. Cols ────────────────────────────────────────────────── */}
      {/* Pencil: Cols — fill_container, horizontal, gap 24 */}
      <div className="flex w-full items-start gap-6">
        {/* ── Sidebar ── */}
        {/* Pencil: Sidebar — width 280, vertical, gap 16 */}
        <aside className="flex w-70 shrink-0 flex-col gap-4">
          {/* ProfileCard — bg-card, rounded-xl, shadow-sm, p 20, vertical, gap 14, alignItems center */}
          <div className="flex flex-col items-center gap-3.5 rounded-xl bg-card p-5 shadow-sm">
            {/* Avatar 64×64 */}
            <Avatar className="size-16">
              <AvatarFallback variant="primary" className="text-[22px]">
                {initials}
              </AvatarFallback>
            </Avatar>
            {/* Info — vertical, gap 3, alignItems center */}
            <div className="flex w-full flex-col items-center gap-0.5">
              {/* Name — font-heading 17px 600 */}
              <span className="font-heading text-[17px] font-semibold text-foreground">
                {displayName}
              </span>
              {/* Email — font-body 13px muted */}
              <span className="font-sans text-[13px] text-muted-foreground">{user?.email}</span>
            </div>
            {/* Tier badge — Label/Primary */}
            <Badge variant="primary">Постоянный покупатель</Badge>
            {/* EditBtn — outline, fill_container */}
            <Button variant="outline" className="w-full" onClick={startEditing}>
              <Pencil className="size-4" aria-hidden="true" />
              Редактировать профиль
            </Button>
          </div>

          {/* Menu — bg-card, rounded-xl, shadow-sm, vertical, clip */}
          <nav className="overflow-hidden rounded-xl bg-card shadow-sm">
            {MENU_ITEMS.map((item, idx) => (
              <div key={item.href}>
                {idx > 0 && <div className="h-px w-full bg-border" />}
                <Link
                  href={item.href}
                  className={cn(
                    "flex w-full items-center gap-3 px-4 py-3.25 transition-colors hover:bg-secondary",
                    item.active && "bg-secondary",
                  )}
                >
                  <item.icon
                    className={cn(
                      "size-5 shrink-0",
                      item.active ? "text-primary" : "text-muted-foreground",
                    )}
                    aria-hidden="true"
                  />
                  <span
                    className={cn(
                      "flex-1 font-sans text-[15px] text-foreground",
                      item.active && "font-semibold",
                    )}
                  >
                    {item.label}
                  </span>
                  {item.badge ? (
                    <Badge variant="primary">{item.badge}</Badge>
                  ) : (
                    <ChevronRight
                      className="size-4 shrink-0 text-muted-foreground"
                      aria-hidden="true"
                    />
                  )}
                </Link>
              </div>
            ))}
          </nav>
        </aside>

        {/* ── Main ── */}
        {/* Pencil: Main — fill_container, vertical, gap 24 */}
        <main className="flex min-w-0 flex-1 flex-col gap-6">
          {/* ── Stats ── */}
          {/* Pencil: Stats — fill_container, horizontal, gap 16 */}
          <div className="flex w-full gap-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="flex flex-1 items-center gap-3.5 rounded-xl bg-card p-4.5 shadow-sm"
              >
                {/* IconWrap — 40×40, bg-secondary, rounded-md */}
                <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-secondary">
                  <stat.icon className="size-4.5 text-primary" aria-hidden="true" />
                </div>
                {/* Txt — vertical, gap 2 */}
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  {/* Val — font-mono 22px 700 */}
                  <span className="font-mono text-[22px] font-bold leading-none text-foreground">
                    {stat.value}
                  </span>
                  {/* Lbl — font-caption 12px muted */}
                  <span className="font-caption text-[12px] text-muted-foreground">
                    {stat.label}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* ── Favorites ── */}
          {/* Pencil: Favorites — vertical, gap 16 */}
          <section className="flex flex-col gap-4">
            {/* FavHead — fill_container, space_between, alignItems end */}
            <div className="flex w-full items-end justify-between">
              {/* L — vertical, gap 4 */}
              <div className="flex flex-col gap-1">
                {/* font-heading 22px 600 */}
                <h2 className="font-heading text-[22px] font-semibold text-foreground">
                  Избранное
                </h2>
                {/* font-caption 13px muted */}
                <p className="font-caption text-[13px] text-muted-foreground">
                  6 товаров · 2 подешевели за неделю
                </p>
              </div>
              {/* FavTabs — bg-muted, rounded-md, gap 1, p 1 */}
              <Tabs defaultValue="all">
                <TabsList variant="default">
                  <TabsTrigger value="all">Все</TabsTrigger>
                  <TabsTrigger value="instock">В наличии</TabsTrigger>
                  <TabsTrigger value="discount">Со скидкой</TabsTrigger>
                </TabsList>
                {/* TabsContent is decorative — all products shown regardless */}
                <TabsContent value="all" />
                <TabsContent value="instock" />
                <TabsContent value="discount" />
              </Tabs>
            </div>
            {/* FavRow0 — horizontal, gap 16 */}
            <div className="grid grid-cols-3 gap-4">
              {MOCK_FAVORITES.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>

          {/* ── Recent Orders ── */}
          {/* Pencil: RecentOrders — vertical, gap 16 */}
          <section className="flex flex-col gap-4">
            {/* OrdHead — fill_container, space_between, alignItems center */}
            <div className="flex w-full items-center justify-between">
              {/* font-heading 22px 600 */}
              <h2 className="font-heading text-[22px] font-semibold text-foreground">
                Последние заказы
              </h2>
              {/* AllOrdersBtn — ghost, icon arrow-right, text primary */}
              <Link
                href="/orders"
                className={cn(
                  buttonVariants({ variant: "ghost" }),
                  "text-primary hover:text-primary",
                )}
              >
                Все заказы
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
            {/* OrdRow — horizontal, gap 16 */}
            {recentOrders.length === 0 ? (
              <p className="rounded-xl bg-card p-6 font-caption text-[13px] text-muted-foreground shadow-sm">
                У вас пока нет заказов.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {recentOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onDetails={(id) => router.push(`/orders/${id}`)}
                  />
                ))}
              </div>
            )}
          </section>

          {/* ── Personal Data ── */}
          {/* Pencil: PersonalData — bg-card, rounded-xl, shadow-sm, p 24, vertical, gap 18 */}
          <section className="flex flex-col gap-4.5 rounded-xl bg-card p-6 shadow-sm">
            {/* PDHead — vertical, gap 4 */}
            <div className="flex flex-col gap-1">
              {/* font-heading 17px 600 */}
              <h2 className="font-heading text-[17px] font-semibold text-foreground">
                Личные данные
              </h2>
              {/* font-caption 13px muted */}
              <p className="font-caption text-[13px] text-muted-foreground">
                Используются для оформления заказов и уведомлений
              </p>
            </div>

            {/* PDRow 1 — horizontal, gap 16 */}
            <div className="flex w-full gap-4">
              {/* F Имя и фамилия */}
              <div className="flex flex-1 flex-col gap-1.5">
                <Label htmlFor="pd-name">Имя и фамилия</Label>
                <div className="relative flex items-center">
                  <User
                    className="absolute left-2.5 size-4 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <Input
                    id="pd-name"
                    value={nameValue}
                    onChange={(e) => setNameValue(e.target.value)}
                    placeholder="Не указано"
                    className="pl-8"
                    readOnly={!editing}
                  />
                </div>
              </div>
              {/* F Телефон */}
              <div className="flex flex-1 flex-col gap-1.5">
                <Label htmlFor="pd-phone">Телефон</Label>
                <div className="relative flex items-center">
                  <Phone
                    className="absolute left-2.5 size-4 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <Input
                    id="pd-phone"
                    type="tel"
                    value={phoneValue}
                    onChange={(e) => setPhoneValue(e.target.value)}
                    placeholder="Не указан"
                    className="pl-8"
                    readOnly={!editing}
                  />
                </div>
              </div>
            </div>

            {/* PDRow 2 — horizontal, gap 16 */}
            <div className="flex w-full gap-4">
              {/* F E-mail */}
              <div className="flex flex-1 flex-col gap-1.5">
                <Label htmlFor="pd-email">E-mail</Label>
                <div className="relative flex items-center">
                  <Mail
                    className="absolute left-2.5 size-4 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <Input
                    id="pd-email"
                    defaultValue={user?.email ?? ""}
                    className="pl-8"
                    readOnly
                  />
                </div>
              </div>
              {/* F Город */}
              <div className="flex flex-1 flex-col gap-1.5">
                <Label htmlFor="pd-city">Город</Label>
                <div className="relative flex items-center">
                  <MapPin
                    className="absolute left-2.5 size-4 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <Input
                    id="pd-city"
                    defaultValue=""
                    placeholder="Не указан"
                    className="pl-8"
                    readOnly
                  />
                </div>
              </div>
            </div>

            {/* PDActions — horizontal, gap 10, alignItems center */}
            <div className="flex items-center gap-2.5">
              {editing ? (
                <>
                  {/* SaveBtn — primary */}
                  <Button variant="default" onClick={handleSave} disabled={saving}>
                    <Check className="size-4" aria-hidden="true" />
                    {saving ? "Сохранение…" : "Сохранить изменения"}
                  </Button>
                  {/* CancelBtn — ghost */}
                  <Button variant="ghost" onClick={cancelEditing} disabled={saving}>
                    Отмена
                  </Button>
                </>
              ) : (
                <Button variant="default" onClick={startEditing}>
                  <Pencil className="size-4" aria-hidden="true" />
                  Редактировать
                </Button>
              )}
              {/* PwdBtn — ghost (смена пароля пока не реализована на бэке) */}
              <Button
                variant="ghost"
                onClick={() => toast("Смена пароля скоро будет доступна")}
              >
                <Lock className="size-4" aria-hidden="true" />
                Сменить пароль
              </Button>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
