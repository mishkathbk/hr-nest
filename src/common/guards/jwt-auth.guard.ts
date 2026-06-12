// import {
//   Injectable,
//   CanActivate,
//   ExecutionContext,
//   UnauthorizedException,
//   ForbiddenException,
// } from '@nestjs/common';
// import * as jwt from 'jsonwebtoken';

// @Injectable()
// export class JwtAuthGuard implements CanActivate {
//   canActivate(context: ExecutionContext): boolean {
//     const request = context.switchToHttp().getRequest();
//     const authHeader: string = request.headers['authorization'];
//     const token = authHeader?.split(' ')[1]; // "Bearer <token>"

//     if (!token) {
//       throw new UnauthorizedException('Access token is required');
//     }

//     try {
//       const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
//         userId: number;
//         companyId: number;
//       };
//       request.currentId = decoded.userId;    // maps to ClaimTypes.NameIdentifier
//       request.companyId = decoded.companyId; // maps to ClaimTypes.PrimaryGroupSid
//       return true;
//     } catch {
//       throw new ForbiddenException('Invalid or expired token');
//     }
//   }
// }
// src/guards/jwt-auth.guard.ts

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
  InternalServerErrorException,
} from "@nestjs/common";
import * as jwt from "jsonwebtoken";

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const secret = process.env.JWT_SECRET;
    const issuer = process.env.JWT_ISSUER;
    const audience = process.env.JWT_AUDIENCE;

    if (!secret) {
      throw new InternalServerErrorException("JWT_SECRET is not configured");
    }

    const request = context.switchToHttp().getRequest();
    const authHeader: string = request.headers["authorization"];
    const token = authHeader?.split(" ")[1];

    if (!token) {
      throw new UnauthorizedException("Access token is required");
    }

    try {
      const decoded = jwt.verify(token, secret, {
        issuer,
        audience,
      }) as Record<string, any>;

      request.currentId = Number(decoded["userid"]);
      request.companyId = Number(decoded["companyid"]);
      request.branchId = Number(decoded["branchid"]);
      request.username = String(decoded["username"]);

      return true;
    } catch (err) {
      if (err instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedException("Access token has expired");
      }
      if (err instanceof jwt.JsonWebTokenError) {
        throw new ForbiddenException("Invalid access token");
      }
      throw err;
    }
  }
}
