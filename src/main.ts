import {
  ClassSerializerInterceptor,
  HttpStatus,
  UnprocessableEntityException,
  ValidationError,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory, Reflector } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import * as Sentry from '@sentry/node';
import helmet from 'helmet';
import { setupGracefulShutdown } from 'nestjs-graceful-shutdown';

import { AppModule } from './app.module';
import { getConfig } from './config/app.config';
import { type AllConfigType } from './config/config.type';
import { Environment } from './constants/app.constant';
import { WebSocketAdapter } from './shared/gateway/websocket.adapter';
import { consoleLoggingConfig } from './tools/logger/logger-factory';
import { SentryInterceptor } from './tools/sentry/sentry.interceptor';
import setupSwagger from './tools/swagger/swagger.setup';

async function bootstrap() {
  const envToLogger: Record<`${Environment}`, any> = {
    local: consoleLoggingConfig(),
    development: consoleLoggingConfig(),
    production: true,
    staging: true,
    test: false,
  } as const;

  const appConfig = getConfig();

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      logger: appConfig.appLogging ? envToLogger[appConfig.nodeEnv] : false,
      trustProxy: appConfig.isHttps,
    }),
    {
      bufferLogs: true,
    },
  );
  const configService = app.get(ConfigService<AllConfigType>);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      exceptionFactory: (errors: ValidationError[]) => {
        return new UnprocessableEntityException(errors);
      },
    }),
  );
  app.enableVersioning({
    type: VersioningType.URI,
  });

  Sentry.init({
    dsn: configService.getOrThrow('sentry.dsn', { infer: true }),
    tracesSampleRate: 1.0,
    environment: configService.getOrThrow('app.nodeEnv', { infer: true }),
  });

  app.use(helmet());
  app.enableCors({
    origin: configService.getOrThrow('app.corsOrigin', {
      infer: true,
    }),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Accept',
    credentials: true,
  });

  const reflector = app.get(Reflector);
  app.useGlobalInterceptors(new ClassSerializerInterceptor(reflector));
  app.useGlobalInterceptors(new SentryInterceptor());

  const env = configService.getOrThrow('app.nodeEnv', { infer: true });

  if (env === 'development' || env === 'local') {
    setupSwagger(app);
  }

  if (env !== 'local') {
    setupGracefulShutdown({ app });
  }

  app.useWebSocketAdapter(new WebSocketAdapter(app, configService));

  await app.listen(configService.getOrThrow('app.port', { infer: true }));

  const httpUrl = await app.getUrl();
  const wsUrl = httpUrl
    .replace(/^http/, 'ws')
    .replace(
      `:${configService.get('app.port', { infer: true })}`,
      `:${configService.get('app.websocketPort', { infer: true })}`,
    );
  // eslint-disable-next-line no-console
  console.info('\x1b[36m%s\x1b[0m', `Server running at ${httpUrl}`);
  // eslint-disable-next-line no-console
  console.info('\x1b[36m%s\x1b[0m', `Websocket server running at ${wsUrl}`);

  return app;
}

void bootstrap();
