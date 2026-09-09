import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { AuthUser } from '../types';

export const CurrentUser = createParamDecorator((data: keyof AuthUser | undefined, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest<FastifyRequest & { user: AuthUser }>();
  const user = request.user;
  return data ? user[data] : user; // @CurrentUser() → весь объект; @CurrentUser('userId') → одно поле
});
