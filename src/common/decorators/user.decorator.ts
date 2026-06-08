import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * @CurrentUser() — extracts currentId or companyId from the request
 * (populated by JwtAuthGuard after verifying the JWT token).
 *
 * Usage:
 *   @CurrentUser('currentId') currentId: number
 *   @CurrentUser('companyId') companyId: number
 *   @CurrentUser()            user: { currentId, companyId }
 */
export const CurrentUser = createParamDecorator(
  (data: 'currentId' | 'companyId' | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();

    // -- Mock auth for testing purposes --
    request.currentId = request.currentId || 1;
    request.companyId = request.companyId || 1;
    // ------------------------------------

    if (data) return request[data];
    return { currentId: request.currentId, companyId: request.companyId };
  },
);
