import { Injectable } from '@nestjs/common';
import {
  CallHandler,
  ExecutionContext,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ResponseDto } from '../dto/response.dto';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ResponseDto<any>> {
    return next.handle().pipe(
      map((data) => {
        return {
          status_code: data.status_code || 200,
          result: data.result || 'success',
          detail: data.detail || {},
        };
      }),
    );
  }
}
