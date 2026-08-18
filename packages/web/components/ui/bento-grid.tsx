import * as React from "react";
import { type ComponentPropsWithoutRef, type ReactNode } from "react";
import { ArrowRightIcon } from "@radix-ui/react-icons";

import { cn } from "@/lib/utils";

/**
 * Свойства компонента BentoGrid.
 */
export interface BentoGridProps extends ComponentPropsWithoutRef<"div"> {
  /** Дочерние элементы сетки (обычно BentoCard). */
  children: ReactNode;
  /** Дополнительные CSS-классы. */
  className?: string;
}

/**
 * Свойства компонента BentoCard.
 */
export interface BentoCardProps extends ComponentPropsWithoutRef<"div"> {
  /** Название карточки (заголовок). */
  name: string;
  /** CSS-классы карточки. */
  className: string;
  /** Фоновый контент (градиент, изображение, SVG). */
  background: ReactNode;
  /** Компонент иконки (например, из lucide-react). */
  Icon: React.ElementType;
  /** Краткое описание карточки. */
  description: string;
  /** URL, на который ведёт CTA-ссылка. */
  href: string;
  /** Текст CTA-кнопки/ссылки. */
  cta: string;
}

/**
 * Сетка в стиле bento-box для размещения карточек.
 * @param props - Свойства компонента.
 * @param props.children - Дочерние элементы (BentoCard).
 * @param props.className - Дополнительные CSS-классы.
 * @returns Отрендеренный контейнер сетки.
 */
export const BentoGrid = ({
  children,
  className,
  ...props
}: BentoGridProps): React.ReactElement => {
  return (
    <div className={cn("grid w-full auto-rows-88 grid-cols-3 gap-4", className)} {...props}>
      {children}
    </div>
  );
};

/**
 * Отдельная карточка bento-сетки с hover-эффектами и CTA-ссылкой.
 * @param props - Свойства компонента.
 * @param props.name - Заголовок карточки.
 * @param props.className - CSS-классы карточки.
 * @param props.background - Фоновый контент (градиент/изображение).
 * @param props.Icon - Компонент иконки.
 * @param props.description - Описание карточки.
 * @param props.href - URL CTA-ссылки.
 * @param props.cta - Текст CTA-ссылки.
 * @returns Отрендеренная карточка.
 */
export const BentoCard = ({
  name,
  className,
  background,
  Icon,
  description,
  href,
  cta,
  ...props
}: BentoCardProps): React.ReactElement => {
  return (
    <div
      key={name}
      className={cn(
        "group relative col-span-3 flex flex-col",
        "justify-between overflow-hidden rounded-xl",
        "bg-background",
        "[box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_2px_4px_rgba(0,0,0,.05)]",
        "[box-shadow:0_12px_24px_rgba(0,0,0,.05)]",
        "transform-gpu dark:bg-background",
        "dark:[box-shadow:0_-20px_80px_-20px_#ffffff1f_inset]",
        "dark:[border:1px_solid_rgba(255,255,255,.1)]",
        className,
      )}
      {...props}
    >
      <div>{background}</div>
      <div className="p-4">
        <div
          className={cn(
            "pointer-events-none z-10 flex transform-gpu",
            "flex-col gap-1 transition-all duration-300",
            "lg:group-hover:-translate-y-10",
          )}
        >
          <Icon
            className={cn(
              "h-12 w-12 origin-left transform-gpu",
              "text-neutral-700 transition-all duration-300",
              "ease-in-out group-hover:scale-75",
              "dark:text-neutral-100",
            )}
          />
          <h3 className="text-xl font-semibold text-neutral-700 dark:text-neutral-100">{name}</h3>
          <p className="max-w-lg text-neutral-400">{description}</p>
        </div>

        <div
          className={cn(
            "pointer-events-none flex w-full translate-y-0",
            "transform-gpu flex-row items-center",
            "transition-all duration-300",
            "group-hover:translate-y-0 group-hover:opacity-100",
            "lg:hidden",
          )}
        >
          <a
            href={href}
            className={cn(
              "pointer-events-auto p-0 text-sm font-medium",
              "underline-offset-4 hover:underline",
            )}
          >
            {cta}
            <ArrowRightIcon className="ms-2 h-4 w-4 rtl:rotate-180" />
          </a>
        </div>
      </div>

      <div
        className={cn(
          "pointer-events-none absolute bottom-0 hidden w-full",
          "translate-y-10 transform-gpu flex-row items-center p-4",
          "opacity-0 transition-all duration-300",
          "group-hover:translate-y-0 group-hover:opacity-100 lg:flex",
        )}
      >
        <a
          href={href}
          className={cn(
            "pointer-events-auto p-0 text-sm font-medium",
            "underline-offset-4 hover:underline",
          )}
        >
          {cta}
          <ArrowRightIcon className="ms-2 h-4 w-4 rtl:rotate-180" />
        </a>
      </div>

      <div
        className={cn(
          "pointer-events-none absolute inset-0 transform-gpu",
          "transition-all duration-300",
          "group-hover:bg-black/3 group-hover:dark:bg-neutral-800/10",
        )}
      />
    </div>
  );
};
