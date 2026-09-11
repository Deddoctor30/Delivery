import { Role } from '@prisma/client';

// то, что JwtStrategy положит в request.user — «принципал» текущего запроса
export interface AuthUser {
  userId: string;
  role: Role;
  jti: string; // id токена — для logout (denylist)
  sid: string; // id сессии — для logout (удалить refresh)
  exp: number; // когда истекает access — для TTL denylist
}
