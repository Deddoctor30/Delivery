export type UserRole = "CLIENT" | "ADMIN";

export interface AdminUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  avatarId: string | null;
  role: UserRole;
  createdAt: string;
}

export interface UsersListParams {
  search?: string;
  page?: number;
  limit?: number;
}

export interface UsersListResult {
  items: AdminUser[];
  total: number;
  page: number;
  limit: number;
}
