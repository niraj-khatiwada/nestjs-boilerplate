import { AllConfigType } from '@/config/config.type';
import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import { ConfigService } from '@nestjs/config';
import { ThrottlerModuleOptions } from '@nestjs/throttler';
import { Redis } from 'ioredis';

async function useThrottlerFactory(
  config: ConfigService<AllConfigType>,
): Promise<ThrottlerModuleOptions> {
  return {
    throttlers: [
      {
        ttl: config.getOrThrow('app.throttle.ttl', { infer: true }),
        limit: config.getOrThrow('app.throttle.limit', { infer: true }),
      },
    ],
    storage: new ThrottlerStorageRedisService(
      new Redis(config.getOrThrow('redis')),
    ),
  };
}

export default useThrottlerFactory;
