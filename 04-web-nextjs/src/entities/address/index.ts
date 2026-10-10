// Клиентобезопасный публичный API сущности address.
// Серверные фетчеры (apiServerAuth, server-only) — отдельный вход: @/entities/address/api
export type { Address } from "./model/types";
export { formatAddress } from "./model/types";
