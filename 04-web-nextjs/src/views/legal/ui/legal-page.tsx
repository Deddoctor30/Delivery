import type { ReactNode } from "react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/shared/ui";

export interface LegalPageProps {
  title: string;
  /** Дата последнего обновления (человекочитаемая). */
  updatedAt?: string;
  children: ReactNode;
}

/**
 * LegalPage — единый типографский шаблон юридических страниц (02-design §5.1.8).
 *
 * RSC. Контент передаётся как children (обычные h2/p/ul); стилизация — через
 * вложенные селекторы, без плагина typography. Крошки: Главная / <title>.
 */
export function LegalPage({ title, updatedAt, children }: LegalPageProps) {
  return (
    <div className="flex flex-col gap-6 py-7 pb-20">
      {/* Breadcrumbs */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Главная</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Заголовок */}
      <div className="flex flex-col gap-1.5">
        <h1 className="font-heading text-[32px] font-semibold leading-tight text-foreground">
          {title}
        </h1>
        {updatedAt && (
          <span className="font-caption text-[13px] text-muted-foreground">
            Обновлено: {updatedAt}
          </span>
        )}
      </div>

      {/* Контент */}
      <article className="flex max-w-[760px] flex-col gap-4 text-[15px] leading-relaxed text-foreground [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2 [&_h2]:mt-4 [&_h2]:font-heading [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-foreground [&_li]:ml-4 [&_li]:list-disc [&_p]:text-muted-foreground [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-2 [&_ul]:pl-4">
        {children}
      </article>
    </div>
  );
}
