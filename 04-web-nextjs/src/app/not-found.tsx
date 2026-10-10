import Link from "next/link";

import { buttonVariants, EmptyState, Illustration } from "@/shared/ui";

/**
 * Глобальная страница 404 (Next App Router: app/not-found.tsx).
 * Рендерится внутри RootLayout (хедер/футер на месте).
 *
 * Дизайн (02-design §5.1.9): EmptyState + иллюстрация 404 + кнопка возврата.
 */
export default function NotFound() {
  return (
    <div className="flex flex-1 items-center justify-center py-20">
      <EmptyState
        icon={<Illustration name="not-found" size={160} />}
        title="Страница не найдена"
        description="Возможно, страница была удалена или вы ошиблись адресом."
        action={
          <Link href="/" className={buttonVariants({ size: "lg" })}>
            На главную
          </Link>
        }
      />
    </div>
  );
}
