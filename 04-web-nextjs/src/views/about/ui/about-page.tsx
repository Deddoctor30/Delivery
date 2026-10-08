import Link from "next/link";
import {
  Package,
  Zap,
  ShieldCheck,
  HeartHandshake,
  Briefcase,
  Warehouse,
} from "lucide-react";

import {
  Avatar,
  AvatarFallback,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  buttonVariants,
} from "@/shared/ui";
import { cn } from "@/shared/lib/utils";

/**
 * AboutPage — экран «О нас».
 *
 * Pencil-фрейм T14Myv (Desktop/О нас).
 * RSC, нет интерактивности.
 *
 * Структура (Body g0OZq5, padding 28 170 80 170, gap 40):
 *  1. Breadcrumbs
 *  2. Hero (H1 + Lead + HeroImage-заглушка)
 *  3. Stats (4 метрики на карточке)
 *  4. Values (3 карточки ценностей)
 *  5. HowWeWork (4 шага)
 *  6. Team (4 члена + кнопка Вакансии)
 *  7. CTA (стать партнёром)
 *
 * Header и Footer рендерятся через root layout — здесь не нужны.
 */
export function AboutPage() {
  return (
    <div className="flex flex-col gap-10 py-7 pb-20">
      {/* ── 1. Breadcrumbs ─────────────────────────────────────────── */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href="/" />}>Главная</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>О нас</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* ── 2. Hero ────────────────────────────────────────────────── */}
      {/* Pencil: Hero — horizontal flex, height 300, gap 32, alignItems center */}
      <section className="flex flex-col items-center gap-8 lg:h-[300px] lg:flex-row">
        {/* L — fill_container, vertical, gap 16 */}
        <div className="flex flex-1 flex-col gap-4">
          {/* Pill — bg-secondary, rounded-full, gap 6, padding [4,10] */}
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 font-caption text-xs font-medium text-foreground">
            <Package className="size-3.5 text-primary" aria-hidden="true" />
            О компании
          </span>
          {/* H1 — font-heading 44px 600, lineHeight 1.1 */}
          <h1 className="font-heading text-[44px] font-semibold leading-[1.1] text-foreground">
            Доставляем нужное — быстро и аккуратно
          </h1>
          {/* Lead — font-body 16px, muted-foreground, lineHeight 1.5 */}
          <p className="text-base leading-[1.5] text-muted-foreground">
            Delivery — сервис доставки товаров для дома, техники и повседневных мелочей. С 2018
            года мы помогаем экономить время: собираем заказ за час и привозим его в тот же день.
          </p>
        </div>

        {/* HeroImage — w=420, fill, bg-secondary, rounded-xl, vertical, gap 10, centered */}
        <div className="flex h-[220px] w-full flex-col items-center justify-center gap-2.5 rounded-xl bg-secondary lg:h-full lg:w-[420px]">
          <Warehouse className="size-10 text-muted-foreground" aria-hidden="true" />
          <span className="font-caption text-xs text-muted-foreground">Фото склада</span>
        </div>
      </section>

      {/* ── 3. Stats ───────────────────────────────────────────────── */}
      {/* Pencil: Stats — fill_container, bg-card, rounded-xl, padding [28,8], horizontal, alignItems center */}
      <section className="flex w-full items-center rounded-xl bg-card px-2 py-7">
        {STATS.map((stat, i) => (
          <div key={stat.value} className="flex w-full items-center">
            {i > 0 && <div className="mx-0 h-11 w-px shrink-0 bg-border" />}
            <div className="flex flex-1 flex-col items-center gap-1">
              <span className="font-mono text-[30px] font-bold text-foreground">{stat.value}</span>
              <span className="font-caption text-[13px] text-muted-foreground">{stat.label}</span>
            </div>
          </div>
        ))}
      </section>

      {/* ── 4. Values ──────────────────────────────────────────────── */}
      {/* Pencil: Values — vertical, gap 20 */}
      <section className="flex flex-col gap-5">
        <SectionHead title="Что для нас важно" subtitle="Три принципа, по которым мы строим сервис" />
        {/* Row — horizontal, gap 16 */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {VALUES.map((v) => (
            <div key={v.title} className="flex flex-col gap-3 rounded-xl bg-card p-6">
              {/* IconWrap — 44×44, bg-secondary, rounded-md */}
              <div className="flex size-11 items-center justify-center rounded-md bg-secondary">
                <v.Icon className="size-5 text-primary" aria-hidden="true" />
              </div>
              <span className="font-heading text-[17px] font-semibold text-foreground">
                {v.title}
              </span>
              <p className="text-sm leading-[1.45] text-muted-foreground">{v.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 5. HowWeWork ───────────────────────────────────────────── */}
      {/* Pencil: HowWeWork — vertical, gap 20 */}
      <section className="flex flex-col gap-5">
        <SectionHead title="Как мы работаем" subtitle="От оформления до двери — четыре шага" />
        {/* Steps — horizontal, gap 16 */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step) => (
            <div key={step.num} className="flex flex-col gap-2.5 rounded-xl bg-card p-[22px]">
              <span className="font-mono text-[22px] font-bold text-primary">{step.num}</span>
              <span className="font-heading text-[15px] font-semibold text-foreground">
                {step.title}
              </span>
              <p className="font-caption text-[13px] leading-[1.45] text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 6. Team ────────────────────────────────────────────────── */}
      {/* Pencil: Team — vertical, gap 20 */}
      <section className="flex flex-col gap-5">
        {/* Head — space_between, alignItems end */}
        <div className="flex w-full items-end justify-between">
          <SectionHead
            title="Команда"
            subtitle="Более 600 человек в офисе, на складах и на маршрутах"
          />
          {/* JobsBtn — outline button с иконкой Briefcase */}
          <Link
            href="/jobs"
            className={cn(buttonVariants({ variant: "outline", size: "default" }), "shrink-0")}
          >
            <Briefcase className="size-4" aria-hidden="true" />
            Вакансии
          </Link>
        </div>
        {/* People — horizontal, gap 16 */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {TEAM.map((member) => (
            <div
              key={member.name}
              className="flex flex-col items-center gap-3 rounded-xl bg-card p-[22px]"
            >
              {/* Avatar 56×56 */}
              <Avatar className="size-14">
                <AvatarFallback className="font-heading text-lg">{member.initials}</AvatarFallback>
              </Avatar>
              <div className="flex w-full flex-col items-center gap-0.5">
                <span className="font-heading text-[15px] font-semibold text-foreground">
                  {member.name}
                </span>
                <span className="w-full text-center font-caption text-xs text-muted-foreground">
                  {member.role}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 7. CTA ─────────────────────────────────────────────────── */}
      {/* Pencil: CTA — fill_container, bg-primary, rounded-xl, padding 36, gap 32,
          space_between, alignItems center */}
      <section className="flex flex-col items-start justify-between gap-8 rounded-xl bg-primary px-9 py-9 lg:flex-row lg:items-center">
        {/* L — fill_container, vertical, gap 8 */}
        <div className="flex max-w-xl flex-col gap-2">
          <h2 className="font-heading text-[28px] font-semibold text-primary-foreground">
            Хотите продавать с нами?
          </h2>
          <p className="text-[15px] leading-[1.4] text-primary-foreground/90">
            Подключим ваш товар к витрине за неделю и возьмём логистику на себя.
          </p>
        </div>
        {/* R — horizontal, gap 12, alignItems center */}
        <div className="flex items-center gap-3">
          {/* PrimaryBtn — bg-card, rounded-md, padding [14,24] */}
          <Link
            href="/partners"
            className="inline-flex items-center justify-center rounded-md bg-card px-6 py-3.5 font-heading text-base font-medium text-primary transition-opacity hover:opacity-90"
          >
            Стать партнёром
          </Link>
          {/* GhostBtn — border primary-foreground/40, rounded-md, padding [14,24] */}
          <Link
            href="/contacts"
            className="inline-flex items-center justify-center rounded-md border border-primary-foreground/40 px-6 py-3.5 font-heading text-base font-medium text-primary-foreground transition-colors hover:bg-primary-foreground/10"
          >
            Связаться
          </Link>
        </div>
      </section>
    </div>
  );
}

/* ── Static data ─────────────────────────────────────────────────────────── */

const STATS = [
  { value: "8 лет", label: "на рынке доставки" },
  { value: "120", label: "городов присутствия" },
  { value: "1,2 млн", label: "выполненных заказов" },
  { value: "450+", label: "партнёров и брендов" },
] as const;

const VALUES = [
  {
    Icon: Zap,
    title: "Скорость",
    description:
      "Собираем заказ за час и доставляем в день оформления — в 120 городах.",
  },
  {
    Icon: ShieldCheck,
    title: "Честность",
    description:
      "Показываем реальные цены и наличие. Без скрытых комиссий и навязанных услуг.",
  },
  {
    Icon: HeartHandshake,
    title: "Забота",
    description:
      "Поддержка отвечает за 2 минуты, а возврат оформляется в пару кликов.",
  },
] as const;

const STEPS = [
  {
    num: "01",
    title: "Вы оформляете заказ",
    description: "Выбираете товары и удобный интервал доставки",
  },
  {
    num: "02",
    title: "Собираем на складе",
    description: "Проверяем комплектность и упаковываем за 60 минут",
  },
  {
    num: "03",
    title: "Везём курьером",
    description: "Отслеживаете статус на карте в реальном времени",
  },
  {
    num: "04",
    title: "Принимаете и платите",
    description: "Проверяете заказ при получении, платите как удобно",
  },
] as const;

const TEAM = [
  { name: "Мария Ковалёва", role: "CEO, сооснователь", initials: "МК" },
  { name: "Дмитрий Соколов", role: "Операции и логистика", initials: "ДС" },
  { name: "Анна Павлова", role: "Клиентский сервис", initials: "АП" },
  { name: "Игорь Лебедев", role: "Технологии", initials: "ИЛ" },
] as const;

/* ── Helper ──────────────────────────────────────────────────────────────── */

function SectionHead({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="flex flex-col gap-1">
      <h2 className="font-heading text-[26px] font-semibold text-foreground">{title}</h2>
      <p className="font-caption text-[13px] text-muted-foreground">{subtitle}</p>
    </div>
  );
}
