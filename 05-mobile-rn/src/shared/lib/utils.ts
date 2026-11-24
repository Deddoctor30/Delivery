import { clsx, type ClassValue } from "clsx";

/** Склейка className. (tailwind-merge не тащим — на RN редко нужен дедуп конфликтов.) */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}
