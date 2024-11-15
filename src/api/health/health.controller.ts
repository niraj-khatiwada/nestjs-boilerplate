import { ErrorDto } from '@/common/dto/error.dto';
import { AllConfigType } from '@/config/config.type';
import { Environment } from '@/constants/app.constant';
import { Public } from '@/decorators/public.decorator';
import { Serialize } from '@/interceptors/serialize';
import { Controller, Get, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  HealthCheck,
  HealthCheckResult,
  HealthCheckService,
  HttpHealthIndicator,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import { SkipThrottle } from '@nestjs/throttler';
import { HealthCheckDto } from './dto/health.dto';

@SkipThrottle()
@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private configService: ConfigService<AllConfigType>,
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private db: TypeOrmHealthIndicator,
  ) {}

  @Public()
  @ApiOperation({ summary: 'Health check' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: HealthCheckDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    type: ErrorDto,
  })
  @Serialize(HealthCheckDto)
  @Get()
  @HealthCheck()
  async check(): Promise<HealthCheckResult> {
    const list = [
      () => this.db.pingCheck('database'),
      ...(this.configService.get('app.nodeEnv', { infer: true }) ===
      Environment.DEVELOPMENT
        ? [
            () =>
              this.http.pingCheck(
                'api-docs',
                `${this.configService.get('app.url', { infer: true })}/api-docs`,
              ),
          ]
        : []),
    ];
    return this.health.check(list);
  }
}
