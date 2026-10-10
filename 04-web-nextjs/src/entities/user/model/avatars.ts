import { mediaUrl } from "@/shared/lib/media";

/** Преднастроенные аватары (файлы в бэке: /static/avatars/{id}.webp). */
export const AVATAR_OPTIONS = [
  { id: "avatar-male", label: "Мужской" },
  { id: "avatar-female", label: "Женский" },
] as const;

export type AvatarId = (typeof AVATAR_OPTIONS)[number]["id"];

/** URL преднастроенного аватара на бэке или null, если не задан. */
export function avatarSrc(avatarId: string | null | undefined): string | null {
  if (!avatarId) return null;
  return mediaUrl(`/static/avatars/${avatarId}.webp`);
}
