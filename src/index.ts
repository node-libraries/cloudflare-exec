import { ExecutionContext } from '@cloudflare/workers-types';

export type WorkersFunction<Env = Record<string, unknown>> = (params: {
  request: Request;
  env: Env;
  ctx: ExecutionContext;
}) => Promise<void>;
