import { IsInt, IsNotEmpty, IsEnum } from 'class-validator';

export class MembershipDto {
  @IsInt()
  @IsNotEmpty()
  companyId: number;

  @IsInt()
  @IsNotEmpty()
  userId: number;

  @IsEnum(['owner', 'member'])
  role: 'owner' | 'member';
}
