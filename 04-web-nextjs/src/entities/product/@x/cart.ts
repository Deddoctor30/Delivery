// Публичный cross-import API продукта для слайса cart (FSD @x-нотация).
// entities/cart зависит от Product и маппера — разрешаем это явно через @x.
export type { Product } from "../model/types";
export { toProduct } from "../api/products";
