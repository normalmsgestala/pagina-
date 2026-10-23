import { handle, type Env } from '../../server/api.ts';

export const onRequest = (ctx: { request: Request; env: Env }) => handle(ctx.request, ctx.env);
