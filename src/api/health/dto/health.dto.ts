import { ApiProperty } from '@nestjs/swagger';
import {
  HealthCheckResult,
  HealthCheckStatus,
  HealthIndicatorResult,
} from '@nestjs/terminus';
import { Expose } from 'class-transformer';
import { IsString } from 'class-validator';

export class HealthCheckDto implements HealthCheckResult {
  @Expose()
  @ApiProperty()
  @IsString()
  status: HealthCheckStatus;

  @Expose()
  @ApiProperty()
  details: HealthIndicatorResult;
}
