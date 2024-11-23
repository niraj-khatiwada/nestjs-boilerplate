import { ErrorDto } from '@/common/dto/error.dto';
import { AllConfigType } from '@/config/config.type';
import { Public } from '@/decorators/public.decorator';
import { Serialize } from '@/interceptors/serialize';
import { getURI as getRedisURI } from '@/redis/redis.config';
import { Controller, Get, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisOptions, Transport } from '@nestjs/microservices';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  HealthCheck,
  HealthCheckResult,
  HealthCheckService,
  HttpHealthIndicator,
  MicroserviceHealthIndicator,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import { parseURL } from 'ioredis/built/utils';
import { HealthCheckDto } from './dto/health.dto';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private configService: ConfigService<AllConfigType>,
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private db: TypeOrmHealthIndicator,
    private microservice: MicroserviceHealthIndicator,
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
    const environment = this.configService.get('app.nodeEnv', { infer: true });
    const redisOption = parseURL(getRedisURI()) ?? {};

    const list = [
      () => this.db.pingCheck('database'),
      () =>
        this.microservice.pingCheck<RedisOptions>('redis', {
          transport: Transport.REDIS,
          options: {
            ...redisOption,
          },
        }),
      ...(environment === 'development'
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
