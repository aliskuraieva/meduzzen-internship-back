import { IsInt, IsNotEmpty, IsEnum } from 'class-validator';
import { RequestStatus } from '../enum/request-status.enum';

export class RequestDto {
  @IsInt()
  @IsNotEmpty()
  companyId: number;

  @IsInt()
  @IsNotEmpty()
  userId: number;

  @IsEnum(RequestStatus)
  status: RequestStatus;
}