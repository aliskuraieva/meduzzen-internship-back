import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { CompanyService } from 'src/company/company.service';
import { ForbiddenException } from '@nestjs/common';

export const IsCompanyOwner = createParamDecorator(
  async (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const { user, params } = request;
    const companyService = request.companyService as CompanyService;

    const company = await companyService.findCompanyById(+params.companyId);

    if (company.owner.id !== user.id) {
      throw new ForbiddenException('You are not the owner of this company');
    }
    return company;
  },
);
