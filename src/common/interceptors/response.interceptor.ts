import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RESPONSE_MESSAGE_KEY } from '../decorators/response-message.decorator';
import { randomUUID } from 'crypto';

/**
 * Marker class for paginated service results.
 * The interceptor detects this and builds the paginated response shape.
 *
 * Usage in a service:
 *   return new PaginatedResult(records, totalCount);
 */
export class PaginatedResult<T> {
  constructor(
    public readonly data: T[],
    public readonly totalCount: number,
  ) {}
}

/**
 * ResponseInterceptor — global interceptor that wraps every successful
 * controller response into the standard envelope used across the project:
 *
 * {
 *   success: true,
 *   message: "Operation completed successfully" | <custom via @ResponseMessage()>,
 *   data: <data>,
 *   meta: { totalCount: N },
 *   timestamp: "...",
 *   requestId: "..."
 * }
 *
 * Paginated responses use PaginatedResult<T> and include the real totalCount.
 */
@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, any> {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // Read optional custom message from @ResponseMessage() decorator
    const customMessage =
      this.reflector.get<string>(RESPONSE_MESSAGE_KEY, context.getHandler()) ??
      'Operation completed successfully';

    const req = context.switchToHttp().getRequest();
    // Use an existing request ID if available, otherwise generate a new one
    const requestId = req.headers['x-request-id'] || req.id || randomUUID();

    return next.handle().pipe(
      map((value) => {
        const timestamp = new Date().toISOString();

        // Paginated result — use actual totalCount from the DB
        if (value instanceof PaginatedResult) {
          return {
            success: true,
            message: customMessage,
            data: value.data,
            meta: { totalCount: value.totalCount },
            timestamp,
            requestId,
          };
        }

        // Standard result
        return {
          success: true,
          message: customMessage,
          data: value,
          meta: {
            totalCount: Array.isArray(value) ? value.length : value ? 1 : 0,
          },
          timestamp,
          requestId,
        };
      }),
    );
  }
}
