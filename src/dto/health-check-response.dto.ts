// src/dto/health-check-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class HealthCheckResponseDto {
  @ApiProperty({ example: 200 })
  status_code: number;

  @ApiProperty({ example: 'ok' })
  detail: string;

  @ApiProperty({ example: 'working' })
  result: string;
}
