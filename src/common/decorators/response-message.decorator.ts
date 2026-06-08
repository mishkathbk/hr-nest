import { SetMetadata } from '@nestjs/common';

export const RESPONSE_MESSAGE_KEY = 'responseMessage';

/**
 * @ResponseMessage('Created successfully')
 *
 * Sets a custom message on the response body.
 * Read by ResponseInterceptor via Reflector.
 *
 * Usage:
 *   @Post()
 *   @ResponseMessage('Created successfully')
 */
export const ResponseMessage = (message: string) =>
  SetMetadata(RESPONSE_MESSAGE_KEY, message);
