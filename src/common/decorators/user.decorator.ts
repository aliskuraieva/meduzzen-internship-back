import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestWithUser } from "../../auth/interfaces/request-with-user.interface"

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): RequestWithUser['user'] => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    return request.user;
  },
);