// Публичный cross-import API продукта для слайса favorite (FSD @x-нотация).
// entities/favorite зависит от Product и маппера — разрешаем это явно через @x.
export type { Product } from "../model/types";
export { toProduct } from "../api/products";
