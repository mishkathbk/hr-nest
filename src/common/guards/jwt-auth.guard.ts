import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

/**
 * JwtAuthGuard — NestJS equivalent of the Express authMiddleware.
 *
 * Mirrors the .NET ClaimTypes.NameIdentifier / ClaimTypes.PrimaryGroupSid pattern.
 * Expects:  Authorization: Bearer <token>
 *
 * On success, attaches to request:
 *   req.currentId  → logged-in user's ID   (NameIdentifier)
 *   req.companyId  → user's company ID      (PrimaryGroupSid)
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader: string = request.headers['authorization'];
    const token = authHeader?.split(' ')[1]; // "Bearer <token>"

    if (!token) {
      throw new UnauthorizedException('Access token is required');
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
        userId: number;
        companyId: number;
      };
      request.currentId = decoded.userId;    // maps to ClaimTypes.NameIdentifier
      request.companyId = decoded.companyId; // maps to ClaimTypes.PrimaryGroupSid
      return true;
    } catch {
      throw new ForbiddenException('Invalid or expired token');
    }
  }
}
