import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
export declare class PaginatedResult<T> {
    readonly data: T[];
    readonly totalCount: number;
    constructor(data: T[], totalCount: number);
}
export declare class ResponseInterceptor<T> implements NestInterceptor<T, any> {
    private readonly reflector;
    constructor(reflector: Reflector);
    intercept(context: ExecutionContext, next: CallHandler): Observable<any>;
}
