import { IsInt, IsNotEmpty, IsEnum } from 'class-validator';

export class RequestDto {
  @IsInt()
  @IsNotEmpty()
  companyId: number;

  @IsInt()
  @IsNotEmpty()
  userId: number;

  @IsEnum(['pending', 'accepted', 'declined'])
  status: 'pending' | 'accepted' | 'declined';
}
