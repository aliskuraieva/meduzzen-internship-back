import { IsInt, IsNotEmpty, IsEnum } from 'class-validator';
import { Role } from '../enum/role.enum';

export class MembershipDto {
  @IsInt()
  @IsNotEmpty()
  companyId: number;

  @IsInt()
  @IsNotEmpty()
  userId: number;

  @IsEnum(Role)
  role: Role;
}
