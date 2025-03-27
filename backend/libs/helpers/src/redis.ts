import { Logger } from '@nestjs/common';
import { REDIS_CONNECTION } from 'libs/constants/src/envs';
import { formatProgressMessage } from 'libs/helpers/src/formaters';
import { createClient, RedisClientType } from 'redis';
import { defer, Observable, retry, tap } from 'rxjs';

export const connectToRedis = (): Observable<RedisClientType> => {
  const action = 'Connect to Redis';
  return defer(() => {
    Logger.log(formatProgressMessage.begin`${action}`);
    const client = createClient({ url: REDIS_CONNECTION });
    return client.connect();
  }).pipe(
    tap({
      error: (err) => {
        Logger.error(formatProgressMessage.error`${action}`, err);
        Logger.log('Retrying after 5 seconds...');
      },
    }),
    retry({ count: 3, delay: 5000 }),
  ) as any;
};
