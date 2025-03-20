import { IsOptional, IsString, MinLength, MaxLength, IsBoolean } from 'class-validator';

export class UpdateCompanyDto {
  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(100)
  name?: string;

  @IsString()
  @IsOptional()
  @MinLength(10)
  @MaxLength(500)
  description?: string;

  @IsBoolean()
  @IsOptional()
  isVisible?: boolean;
}
