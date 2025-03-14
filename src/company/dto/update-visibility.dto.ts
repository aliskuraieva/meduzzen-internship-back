import { IsBoolean } from 'class-validator';

export class UpdateVisibilityDto {
  @IsBoolean()
  isVisible: boolean;
}
