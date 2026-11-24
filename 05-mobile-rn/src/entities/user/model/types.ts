export type UserRole = "CLIENT" | "ADMIN";

export type User = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  avatarId: string | null;
  role: UserRole;
  createdAt: string;
};
