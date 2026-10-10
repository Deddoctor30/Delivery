"use client";

import { cn } from "@/shared/lib/utils";
import { Badge, Button, Card, CardContent, CardFooter, CardHeader } from "@/shared/ui";

import { ORDER_STATUS_BADGE_VARIANT, ORDER_STATUS_LABELS, type Order } from "../model/types";

export interface OrderCardProps {
  order: Order;
  onDetails?: (id: string) => void;
  onRepeat?: (id: string) => void;
  onCancel?: (id: string) => void;
  className?: string;
}

export function OrderCard({ order, onDetails, onRepeat, onCancel, className }: OrderCardProps) {
  const {
    id,
    number,
    createdAt,
    status,
    items,
    subtotal,
    deliveryPrice,
    total,
    address,
    addressComment,
    paymentMethod,
  } = order;

  const statusLabel = ORDER_STATUS_LABELS[status];
  const badgeVariant = ORDER_STATUS_BADGE_VARIANT[status];

  const formattedDate = new Date(createdAt).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const formatPrice = (value: number) => value.toLocaleString("ru-RU") + " ₽";

  const canCancel = status === "created" || status === "processing";
  const canRepeat = status === "completed" || status === "cancelled";

  return (
    <Card className={cn("w-full", className)}>
      {/* Header: order number + status badge */}
      <CardHeader className="flex-row items-center justify-between gap-3 pb-3">
        <h3 className="font-heading text-lg font-semibold text-card-foreground">Заказ #{number}</h3>
        <Badge variant={badgeVariant}>{statusLabel}</Badge>
      </CardHeader>

      {/* Items list */}
      <CardContent className="gap-4 pt-0">
        <ul className="flex flex-col gap-2">
          {items.map((item) => (
            <li key={item.id} className="flex items-center gap-2">
              <span className="flex-1 text-sm text-foreground">{item.title}</span>
              <span className="text-xs text-muted-foreground">×{item.quantity}</span>
              <span className="font-mono text-sm font-medium text-foreground">
                {formatPrice(item.price)}
              </span>
            </li>
          ))}
        </ul>

        {/* Summary rows */}
        <div className="mt-1 flex flex-col gap-2 border-t border-border pt-3">
          <div className="flex items-center gap-2">
            <span className="flex-1 text-sm text-muted-foreground">Дата</span>
            <span className="text-sm font-medium text-foreground">{formattedDate}</span>
          </div>

          {paymentMethod && (
            <div className="flex items-center gap-2">
              <span className="flex-1 text-sm text-muted-foreground">Оплата</span>
              <span className="text-sm font-medium text-foreground">{paymentMethod}</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <span className="flex-1 text-sm text-muted-foreground">Товары</span>
            <span className="text-sm font-medium text-foreground">{formatPrice(subtotal)}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex-1 text-sm text-muted-foreground">Доставка</span>
            <span className="text-sm font-medium text-foreground">
              {deliveryPrice === 0 ? "Бесплатно" : formatPrice(deliveryPrice)}
            </span>
          </div>

          {address && (
            <div className="flex items-start gap-2">
              <span className="flex-1 text-sm text-muted-foreground">Адрес</span>
              <span className="max-w-[55%] text-right text-sm font-medium text-foreground">
                {address}
                {addressComment && (
                  <>
                    <br />
                    <span className="text-xs font-normal text-muted-foreground">
                      {addressComment}
                    </span>
                  </>
                )}
              </span>
            </div>
          )}

          {/* Divider + total */}
          <div className="h-px w-full bg-border" />
          <div className="flex items-center gap-2">
            <span className="flex-1 font-heading text-base font-semibold text-foreground">
              Итого
            </span>
            <span className="font-mono text-lg font-bold text-foreground">
              {formatPrice(total)}
            </span>
          </div>
        </div>
      </CardContent>

      {/* Actions */}
      <CardFooter className="flex-wrap gap-2 pt-2">
        {canRepeat && onRepeat && (
          <Button variant="outline" size="sm" onClick={() => onRepeat(id)}>
            Повторить заказ
          </Button>
        )}
        {onDetails && (
          <Button variant="secondary" size="sm" onClick={() => onDetails(id)}>
            Подробнее
          </Button>
        )}
        {canCancel && onCancel && (
          <Button variant="destructive" size="sm" onClick={() => onCancel(id)}>
            Отменить заказ
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
