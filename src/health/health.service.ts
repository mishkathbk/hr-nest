import { Injectable } from '@nestjs/common';

@Injectable()
export class HealthService {
  check() {
    return {
      status: 'ok',
      message: 'HRMS API is running smoothly',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
}
