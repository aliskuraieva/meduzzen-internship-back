import { Expose } from 'class-transformer';
import { IsString, IsBoolean } from 'class-validator';

export class CompanyResponseDto {
  @Expose()
  @IsString()
  name: string;

  @Expose()
  @IsString()
  description: string;

  @Expose()
  @IsBoolean()
  isVisible: boolean;

  @Expose()
  ownerId: number;
}
