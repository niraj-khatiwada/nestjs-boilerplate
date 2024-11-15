import { getConfig as getAppConfig } from '@/config/app.config';
import { ContextType, ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class AppThrottlerGuard extends ThrottlerGuard {
  // Throttler adjustment for GraphQL
  getRequestResponse(context: ExecutionContext) {
    const type: ContextType | 'graphql' = context.getType();
    if (type === 'graphql') {
      const gqlCtx = GqlExecutionContext.create(context);
      const ctx = gqlCtx.getContext();
      return { req: ctx.request, res: ctx.reply };
    }
    return super.getRequestResponse(context);
  }

  // Valid ip address when app is running behind the proxy servers like nginx
  protected getTracker(req: Record<string, any>): Promise<string> {
    const appConfig = getAppConfig();
    if (appConfig.isHttps) {
      return new Promise<string>((resolve, _reject) => {
        const tracker =
          (req.headers['X-Forwarded-For'] ??
          req.headers['x-forwarded-for'] ??
          req.ips.length > 0)
            ? req.ips[0]
            : req.ip;
        resolve(tracker);
      });
    }
    return super.getTracker(req);
  }
}
