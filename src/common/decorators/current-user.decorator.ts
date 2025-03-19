import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from 'src/entities/user.entity';

export const CurrentUser = createParamDecorator(
  (data: keyof User | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    console.log('User from request:', request.user);

    return data ? request.user?.[data] : request.user;
  },
);
