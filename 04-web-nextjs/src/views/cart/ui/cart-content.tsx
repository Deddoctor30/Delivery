"use client";

/**
 * CartContent — client-остров корзины.
 *
 * Берёт позиции из стора корзины (features/cart): гость — localStorage,
 * авторизованный — бэкенд. Меняет количество (Counter) и удаляет позицию (Trash2).
 * Пересчитывает подытог, доставку и итого.
 *
 * Раскладка (десктоп):
 *   [список строк (flex-1)] | [sticky-панель итого (w=340)]
 * Мобайл: стек (flex-col).
 *
 * Ссылки на товар: /product/{id} — с фото и названия строки.
 */

import Image from "next/image";
import Link from "next/link";
import { Trash2, ShoppingBag, ArrowRight } from "lucide-react";

import type { CartItem } from "@/entities/cart";
import { useCart } from "@/features/cart";

import { Counter, Badge, EmptyState, Illustration, buttonVariants } from "@/shared/ui";
import { cn } from "@/shared/lib/utils";

/* ── Константы ───────────────────────────────────────────────────── */
const FREE_DELIVERY_THRESHOLD = 2_000;
const DELIVERY_COST = 299;

/* ── Компонент ───────────────────────────────────────────────────── */
export function CartContent() {
  const { lines, setQuantity, removeItem } = useCart();

  /* Обновить количество позиции */
  function handleQtyChange(productId: string, qty: number) {
    setQuantity(productId, Math.max(1, qty));
  }

  /* Удалить позицию */
  function handleRemove(productId: string) {
    removeItem(productId);
  }

  /* Пересчёт суммы */
  const subtotal = lines.reduce((acc, l) => acc + l.product.price * l.quantity, 0);
  const delivery = subtotal >= FREE_DELIVERY_THRESHOLD || subtotal === 0 ? 0 : DELIVERY_COST;
  const total = subtotal + delivery;

  const itemsWord = getItemsWord(lines.reduce((acc, l) => acc + l.quantity, 0));

  /* ── Пустая корзина ──────────────────────────────────────────── */
  if (lines.length === 0) {
    return (
      <EmptyState
        icon={<Illustration name="empty-cart" size={120} />}
        title="Корзина пуста"
        description="Добавьте товары, чтобы оформить заказ"
        action={
          <Link href="/catalog" className={buttonVariants({ variant: "default", size: "lg" })}>
            В каталог <ArrowRight className="ml-2 size-4" />
          </Link>
        }
        className="py-16"
      />
    );
  }

  /* ── Корзина с позициями ─────────────────────────────────────── */
  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
      {/* ── Список строк ─────────────────────────────────────── */}
      {/* Pencil: список gap=12, строка bg=$--card rounded-xl p=16 */}
      <div className="flex flex-1 flex-col gap-3">
        {lines.map((line) => (
          <CartLineRow
            key={line.product.id}
            line={line}
            onQtyChange={handleQtyChange}
            onRemove={handleRemove}
          />
        ))}
      </div>

      {/* ── Панель-итого ─────────────────────────────────────── */}
      {/*
       * Pencil: Summary w=340, bg=$--card, rounded-xl, p=24, gap=20
       * sticky top-6 — прилипает при скролле списка
       */}
      <aside className="flex w-full flex-col gap-5 rounded-xl bg-card p-6 lg:sticky lg:top-6 lg:w-85 lg:shrink-0">
        {/* Заголовок */}
        <h2 className="font-heading text-base font-semibold text-foreground">Итого</h2>

        {/* Строки итога */}
        <div className="flex flex-col gap-3">
          {/* Подытог */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Товары ({itemsWord})</span>
            <span className="font-mono text-sm font-medium text-foreground">
              {subtotal.toLocaleString("ru-RU")} ₽
            </span>
          </div>

          {/* Доставка */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Доставка</span>
            {delivery === 0 ? (
              <Badge variant="success">Бесплатно</Badge>
            ) : (
              <span className="font-mono text-sm font-medium text-foreground">
                {delivery.toLocaleString("ru-RU")} ₽
              </span>
            )}
          </div>

          {/* Подсказка о бесплатной доставке */}
          {delivery > 0 && (
            <p className="font-caption text-xs text-muted-foreground">
              Бесплатно от {FREE_DELIVERY_THRESHOLD.toLocaleString("ru-RU")} ₽
            </p>
          )}

          {/* Разделитель */}
          <div className="h-px bg-border" />

          {/* Итого */}
          <div className="flex items-center justify-between">
            <span className="font-heading text-base font-semibold text-foreground">К оплате</span>
            <span className="font-mono text-lg font-bold text-foreground">
              {total.toLocaleString("ru-RU")} ₽
            </span>
          </div>
        </div>

        {/* Кнопка оформить */}
        {/* Pencil: Button/Primary-Large fill_container «Оформить заказ» */}
        <Link
          href="/checkout"
          className={buttonVariants({ variant: "default", size: "lg", className: "w-full gap-2" })}
        >
          Оформить заказ <ArrowRight className="size-4" />
        </Link>
      </aside>
    </div>
  );
}

/* ── CartLineRow ─────────────────────────────────────────────────── */
/**
 * Одна горизонтальная строка корзины:
 *   [фото 80×80] | [название + бренд + цена | Counter + удалить | подытог строки]
 *
 * Pencil: CartLine bg=$--card, rounded-xl, p=16, gap=14, horizontal
 * Фото: 80×80 rounded-lg bg=$--secondary
 * Цена: font-mono 16px 600
 * Старая цена: font-mono 12px muted-foreground line-through
 */
interface CartLineRowProps {
  line: CartItem;
  onQtyChange: (productId: string, qty: number) => void;
  onRemove: (productId: string) => void;
}

function CartLineRow({ line, onQtyChange, onRemove }: CartLineRowProps) {
  const { product, quantity } = line;
  const lineTotal = product.price * quantity;

  return (
    <article
      className={cn(
        "flex gap-3 rounded-xl bg-card p-4 sm:gap-4",
        "transition-shadow hover:shadow-sm",
      )}
    >
      {/* Фото товара */}
      {/* Pencil: Image 80×80 rounded-lg bg=$--secondary */}
      <Link
        href={`/product/${product.id}`}
        className="relative block size-20 shrink-0 overflow-hidden rounded-lg bg-secondary"
        aria-label={`Перейти к товару ${product.title}`}
      >
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.title}
            fill
            sizes="80px"
            className="object-cover"
          />
        ) : (
          /* Placeholder: иконка корзины когда нет фото */
          <div className="flex size-full items-center justify-center">
            <ShoppingBag className="size-8 text-muted-foreground" aria-hidden="true" />
          </div>
        )}
      </Link>

      {/* Содержимое строки */}
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        {/* Верхняя часть: название + цены */}
        <div className="flex flex-col gap-0.5">
          {/* Название — ссылка */}
          {/* Pencil: Title font-body 14px 500 foreground, textGrowth=fixed-width */}
          <Link
            href={`/product/${product.id}`}
            className="line-clamp-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
          >
            {product.title}
          </Link>

          {/* Бренд */}
          {product.brand && (
            <span className="font-caption text-xs text-muted-foreground">{product.brand}</span>
          )}

          {/* Цены */}
          {/* Pencil: PriceRow gap=8, alignItems=center */}
          <div className="mt-1 flex items-center gap-2">
            {/* Текущая цена */}
            <span className="font-mono text-base font-semibold text-foreground">
              {product.price.toLocaleString("ru-RU")} ₽
            </span>
            {/* Старая цена */}
            {product.oldPrice && (
              <span className="font-mono text-xs text-muted-foreground line-through">
                {product.oldPrice.toLocaleString("ru-RU")} ₽
              </span>
            )}
            {/* Скидка */}
            {product.discountPercent && (
              <Badge variant="discount">−{product.discountPercent}%</Badge>
            )}
          </div>
        </div>

        {/* Нижняя часть: Counter + удалить + подытог строки */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Counter */}
          <Counter
            value={quantity}
            onValueChange={(qty) => onQtyChange(product.id, qty)}
            min={1}
            max={99}
          />

          {/* Удалить */}
          {/* Pencil: IconButton/Ghost, icon=trash-2 */}
          <button
            type="button"
            aria-label={`Удалить ${product.title} из корзины`}
            onClick={() => onRemove(product.id)}
            className="flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-destructive"
          >
            <Trash2 className="size-4" aria-hidden="true" />
          </button>

          {/* Подытог строки */}
          {/* Pencil: LineTotal font-mono 14px 600 foreground */}
          <span className="ml-auto font-mono text-sm font-semibold text-foreground">
            {lineTotal.toLocaleString("ru-RU")} ₽
          </span>
        </div>
      </div>
    </article>
  );
}

/* ── Вспомогательная функция ─────────────────────────────────────── */
function getItemsWord(count: number): string {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod100 >= 11 && mod100 <= 14) return `${count} товаров`;
  if (mod10 === 1) return `${count} товар`;
  if (mod10 >= 2 && mod10 <= 4) return `${count} товара`;
  return `${count} товаров`;
}
