import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * HttpExceptionFilter — global catch-all exception filter.
 *
 * Converts every thrown exception into the standardised response envelope:
 * {
 *   status: false,
 *   message: "...",
 *   result: null,
 *   responseDetails: { totalCount: 0 }
 * }
 *
 * Handles:
 *   - HttpException subclasses (NotFoundException, BadRequestException, etc.)
 *   - ValidationPipe errors (returns message array joined as string)
 *   - Unexpected errors (generic 500)
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx      = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request  = ctx.getRequest<Request>();

    let status  = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const body = exception.getResponse();

      if (typeof body === 'string') {
        message = body;
      } else if (typeof body === 'object' && body !== null) {
        const raw = (body as any).message;
        // ValidationPipe produces an array of messages
        message = Array.isArray(raw) ? raw.join(', ') : raw ?? message;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      this.logger.error(
        `Unhandled error on [${request.method} ${request.url}]: ${message}`,
        exception.stack,
      );
    }

    response.status(status).json({
      status: false,
      message,
      result: null,
      responseDetails: { totalCount: 0 },
    });
  }
}
