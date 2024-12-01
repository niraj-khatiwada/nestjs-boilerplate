import { Environment } from '@/constants/app.constant';

export type AppConfig = {
  nodeEnv: `${Environment}`;
  isHttps: boolean;
  isWorker: boolean;
  name: string;
  appPrefix: string;
  url: string;
  port: number;
  workerPort: number;
  websocketPort: number;
  debug: boolean;
  apiPrefix: string;
  fallbackLanguage: string;
  appLogging: boolean;
  logLevel: string;
  logService: string;
  corsOrigin: boolean | string | RegExp | (string | RegExp)[];
};
