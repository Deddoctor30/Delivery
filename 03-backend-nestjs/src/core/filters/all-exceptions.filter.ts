import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { FastifyReply } from 'fastify';

interface ErrorBody {
  statusCode: number;
  code: string;
  message: string;
  details: Record<string, unknown>;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const reply = host.switchToHttp().getResponse<FastifyReply>();
    const body = this.buildBody(exception);

    // стек-трейс логируем на сервере, клиенту его НЕ отдаём (security)
    if (body.statusCode >= 500) {
      this.logger.error(
        `${body.code} ${body.message}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    } else {
      this.logger.warn(`${body.code} ${body.message}`);
    }

    reply.status(body.statusCode).send(body);
  }

  private buildBody(exception: unknown): ErrorBody {
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const response = exception.getResponse();

      if (typeof response === 'string') {
        return {
          statusCode: status,
          code: this.defaultCode(status),
          message: response,
          details: {},
        };
      }

      const res = response as Record<string, unknown>;
      const rawMessage = res.message;

      // ValidationPipe кидает message массивом — собираем в details
      if (Array.isArray(rawMessage)) {
        return {
          statusCode: status,
          code: (res.code as string) ?? 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: { validation: rawMessage },
        };
      }

      return {
        statusCode: status,
        code: (res.code as string) ?? this.defaultCode(status),
        message: (rawMessage as string) ?? exception.message,
        details: (res.details as Record<string, unknown>) ?? {},
      };
    }

    // неизвестная ошибка → 500, деталей клиенту не раскрываем
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      code: 'INTERNAL_ERROR',
      message: 'Internal server error',
      details: {},
    };
  }

  private defaultCode(status: number): string {
    const map: Record<number, string> = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      422: 'UNPROCESSABLE_ENTITY',
      429: 'TOO_MANY_REQUESTS',
    };
    return map[status] ?? 'HTTP_ERROR';
  }
}
