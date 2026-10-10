"use client";

import { useSyncExternalStore } from "react";

/**
 * Глобальный контроллер модалки входа/регистрации.
 *
 * Открыть вход нужно из разных фич (например, гость жмёт «в избранное»), но
 * features→features в FSD запрещены, а сама модалка живёт в `features/auth`.
 * Поэтому состояние открытия держим здесь, в `shared`: публикует любой слой
 * (`openAuthModal`), а `features/auth` подписывается и рендерит модалку.
 */

let isOpen = false;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

/** Открыть модалку входа (вызывается при попытке гостя сделать защищённое действие). */
export function openAuthModal() {
  if (isOpen) return;
  isOpen = true;
  emit();
}

/** Установить состояние открытия (для onOpenChange модалки). */
export function setAuthModalOpen(value: boolean) {
  if (isOpen === value) return;
  isOpen = value;
  emit();
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

/** Подписка на состояние открытия модалки (useSyncExternalStore). */
export function useAuthModalOpen() {
  return useSyncExternalStore(
    subscribe,
    () => isOpen,
    () => false,
  );
}
