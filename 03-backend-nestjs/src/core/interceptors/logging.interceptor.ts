import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import { randomUUID } from 'node:crypto';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<FastifyRequest>();
    const reply = context.switchToHttp().getResponse<FastifyReply>();

    // requestId: берём из входящего заголовка или генерим новый,
    // и сразу возвращаем клиенту в ответе — для сквозной трассировки
    const requestId = (req.headers['x-request-id'] as string) ?? randomUUID();
    reply.header('x-request-id', requestId);

    const { method, url } = req;
    const start = Date.now();

    return next.handle().pipe(
      tap({
        next: () => this.write(method, url, reply.statusCode, start, requestId),
        error: () => this.write(method, url, reply.statusCode, start, requestId),
      }),
    );
  }

  private write(
    method: string,
    url: string,
    status: number,
    start: number,
    requestId: string,
  ) {
    const ms = Date.now() - start;
    this.logger.log(`${method} ${url} ${status} ${ms}ms [${requestId}]`);
  }
}
