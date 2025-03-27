import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { parse } from 'qs';
import { Request } from 'express';
import { parseObject } from 'query-types';

export const QsQuery = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request: Request = ctx.switchToHttp().getRequest();
    const originalUrl = request.originalUrl;
    const queryString = originalUrl.split('?')[1];
    const parsed = parse(queryString);
    const output = parseObject(parsed);
    return output;
  },
);
