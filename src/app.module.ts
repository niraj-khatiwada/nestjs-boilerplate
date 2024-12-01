import authConfig from '@/api/auth/config/auth.config';
import appConfig from '@/config/app.config';
import databaseConfig from '@/database/config/database.config';
import mailConfig from '@/mail/config/mail.config';
import redisConfig from '@/redis/redis.config';
import { BullBoardModule } from '@bull-board/nestjs';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { BullModule } from '@nestjs/bullmq';
import { CacheModule } from '@nestjs/cache-manager';
import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { GraphQLModule } from '@nestjs/graphql';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import {
  AcceptLanguageResolver,
  HeaderResolver,
  I18nModule,
  QueryResolver,
} from 'nestjs-i18n';
import { LoggerModule } from 'nestjs-pino';

import { FastifyAdapter } from '@bull-board/fastify';
import { GracefulShutdownModule } from 'nestjs-graceful-shutdown';
import { ApiModule } from './api/api.module';
import { default as useGraphqlFactory } from './graphql/graphql.factory';
import { default as useI18nFactory } from './i18n/i18n.factory';
import { default as awsConfig } from './libs/aws/aws.config';
import { MailModule } from './mail/mail.module';
import { GatewayModule } from './shared/gateway/gateway.module';
import useCacheFactory from './tools/cache/cache.factory';
import { default as useLoggerFactory } from './tools/logger/logger-factory';
import { default as sentryConfig } from './tools/sentry/sentry.config';
import { default as throttlerConfig } from './tools/throttler/throttler.config';
import { default as useThrottlerFactory } from './tools/throttler/throttler.factory';
import { default as bullConfig } from './worker/queues/bull.config';
import { default as useBullFactory } from './worker/queues/bull.factory';
import { WorkerModule } from './worker/worker.module';

@Module({})
export class AppModule {
  private static common(): DynamicModule {
    return {
      module: AppModule,
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [
            appConfig,
            databaseConfig,
            redisConfig,
            authConfig,
            mailConfig,
            bullConfig,
            sentryConfig,
            throttlerConfig,
            awsConfig,
          ],
          envFilePath: ['.env'],
        }),
        GracefulShutdownModule.forRoot({
          cleanup: (...args) => {
            // eslint-disable-next-line no-console
            console.log('App shutting down...', args);
          },
        }),
        LoggerModule.forRootAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: useLoggerFactory,
        }),
        CacheModule.registerAsync({
          isGlobal: true,
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: useCacheFactory,
        }),
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: databaseConfig,
        }),
        BullModule.forRootAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: useBullFactory,
        }),
        PrometheusModule.register(),
        MailModule,
      ],
    };
  }
  static main(): DynamicModule {
    return {
      module: AppModule,
      imports: [
        ...AppModule.common().imports,
        I18nModule.forRootAsync({
          resolvers: [
            { use: QueryResolver, options: ['lang'] },
            AcceptLanguageResolver,
            new HeaderResolver(['x-lang']),
          ],
          inject: [ConfigService],
          useFactory: useI18nFactory,
        }),
        GraphQLModule.forRootAsync<ApolloDriverConfig>({
          driver: ApolloDriver,
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: useGraphqlFactory,
        }),
        ThrottlerModule.forRootAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: useThrottlerFactory,
        }),
        BullBoardModule.forRoot({
          route: '/queues',
          adapter: FastifyAdapter,
        }),
        GatewayModule,
        ApiModule,
      ],
      providers: [
        {
          provide: APP_GUARD,
          useClass: ThrottlerGuard,
        },
      ],
    };
  }

  static worker(): DynamicModule {
    return {
      module: AppModule,
      imports: [...AppModule.common().imports, WorkerModule],
    };
  }
}
