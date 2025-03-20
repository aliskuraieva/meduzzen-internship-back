import { IsBoolean, IsInt, IsNotEmpty, IsOptional } from 'class-validator';

export class InvitationDto {
  @IsInt()
  @IsNotEmpty()
  companyId: number;

  @IsInt()
  @IsNotEmpty()
  userId: number;

  @IsInt()
  @IsNotEmpty()
  senderId: number;

  @IsBoolean()
  @IsOptional()
  isAccepted?: boolean;
}
