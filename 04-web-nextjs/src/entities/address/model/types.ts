export type Address = {
  id: string;
  label: string | null;
  city: string;
  street: string;
  apt: string | null;
  zip: string | null;
  comment: string | null;
  lat: number;
  lng: number;
  isDefault: boolean;
};

/** Человекочитаемая строка адреса (город, улица, кв., индекс). */
export function formatAddress(a: Address): string {
  return [a.city, a.street, a.apt && `кв./оф. ${a.apt}`, a.zip].filter(Boolean).join(", ");
}
