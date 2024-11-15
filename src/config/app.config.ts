import { Environment, LogService } from '@/constants/app.constant';
import { registerAs } from '@nestjs/config';
import { seconds } from '@nestjs/throttler';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  Max,
  Min,
} from 'class-validator';
import kebabCase from 'lodash/kebabCase';
import process from 'node:process';
import validateConfig from '../utils/validate-config';
import { AppConfig } from './app-config.type';

class EnvironmentVariablesValidator {
  @IsEnum(Environment)
  @IsOptional()
  NODE_ENV: typeof Environment;

  @IsBoolean()
  @IsOptional()
  IS_HTTPS: boolean;

  @IsString()
  @IsNotEmpty()
  APP_NAME: string;

  @IsUrl({ require_tld: false })
  @IsOptional()
  APP_URL: string;

  @IsInt()
  @Min(0)
  @Max(65535)
  @IsOptional()
  APP_PORT: number;

  @IsInt()
  @Min(0)
  @Max(65535)
  @IsOptional()
  WEBSOCKET_PORT: number;

  @IsInt()
  @Min(0)
  @Max(65535)
  @IsOptional()
  PORT: number;

  @IsBoolean()
  @IsOptional()
  APP_DEBUG: boolean;

  @IsString()
  @IsOptional()
  API_PREFIX: string;

  @IsString()
  @IsOptional()
  APP_FALLBACK_LANGUAGE: string;

  @IsBoolean()
  @IsOptional()
  APP_LOGGING: boolean;

  @IsString()
  @IsOptional()
  APP_LOG_LEVEL: string;

  @IsString()
  @IsEnum(LogService)
  @IsOptional()
  APP_LOG_SERVICE: string;

  @IsString()
  @Matches(
    /^(true|false|\*|([\w]+:\/\/)?([\w.-]+)(:[0-9]+)?)?(,([\w]+:\/\/)?([\w.-]+)(:[0-9]+)?)*$/,
  )
  @IsOptional()
  APP_CORS_ORIGIN: string;

  @IsBoolean()
  @IsOptional()
  THROTTLER_ENABLED: boolean;

  @IsNumber()
  @IsOptional()
  THROTTLE_LIMIT: number;

  @IsNumber()
  @IsOptional()
  THROTTLE_TTL: number;
}

export function getConfig(): AppConfig {
  const port = process.env.APP_PORT ? parseInt(process.env.APP_PORT, 10) : 3000;

  const websocketPort = process.env.WEBSOCKET_PORT
    ? parseInt(process.env.WEBSOCKET_PORT, 10)
    : port - 1;

  const isThrottlingEnabled = process.env.THROTTLER_ENABLED === 'true';
  return {
    nodeEnv: (process.env.NODE_ENV || Environment.DEVELOPMENT) as Environment,
    isHttps: process.env.IS_HTTPS === 'true',
    name: process.env.APP_NAME,
    appPrefix: kebabCase(process.env.APP_NAME),
    url: process.env.APP_URL || `http://localhost:${port}`,
    port,
    websocketPort,
    debug: process.env.APP_DEBUG === 'true',
    apiPrefix: process.env.API_PREFIX || 'api',
    fallbackLanguage: process.env.APP_FALLBACK_LANGUAGE || 'en',
    appLogging: process.env.APP_LOGGING === 'true',
    logLevel: process.env.APP_LOG_LEVEL || 'warn',
    logService: process.env.APP_LOG_SERVICE || LogService.CONSOLE,
    corsOrigin: getCorsOrigin(),
    throttle: {
      enabled: isThrottlingEnabled,
      limit: isThrottlingEnabled
        ? Number.parseInt(process.env.THROTTLE_LIMIT)
        : Infinity,
      ttl: isThrottlingEnabled
        ? seconds(Number.parseInt(process.env.THROTTLE_TTL))
        : 0,
    },
  };
}

export default registerAs<AppConfig>('app', () => {
  // eslint-disable-next-line no-console
  console.info(`Registering AppConfig from environment variables`);
  validateConfig(process.env, EnvironmentVariablesValidator);
  return getConfig();
});

function getCorsOrigin() {
  const corsOrigin = process.env.APP_CORS_ORIGIN;
  if (corsOrigin === 'true') return true;
  if (corsOrigin === '*') return '*';
  if (!corsOrigin || corsOrigin === 'false') return false;

  return corsOrigin.split(',').map((origin) => origin.trim());
}
