import { Injectable, Logger } from '@nestjs/common';
import {
  MONITOR_CHECK_PER_TIME_WINDOW,
  MONITOR_CHECKED_COUNT,
} from 'libs/constants/src/keys';
import { connectToRedis } from 'libs/helpers/src/redis';
import { RedisClientType } from 'redis';
import { catchError, mergeMap, Observable, throwError } from 'rxjs';

@Injectable()
export class RedisService {
  _redisClient: RedisClientType;

  get isClientReady() {
    return !!this._redisClient;
  }

  connectToRedis(): Observable<any> {
    return connectToRedis().pipe(
      mergeMap(async (v) => {
        this._redisClient = v;
        await this._redisClient.select(1);
      }),
      catchError((error) => {
        console.error('Failed to connect to Redis:', error);
        return throwError(() => new Error('Redis connection failed'));
      }),
    );
  }

  async getMonitorCheckedCount() {
    if (!this.isClientReady) {
      Logger.error(`Redis client is not ready, can't get checked count`);
      return null;
    }
    const res = await this._redisClient.get(MONITOR_CHECKED_COUNT);
    if (res === null) {
      return null;
    }
    return parseInt(res);
  }

  setMonitorCheckedCount(count: number) {
    if (!this.isClientReady) {
      Logger.error(`Redis client is not ready, can't set checked count`);
      return null;
    }
    return this._redisClient.set(MONITOR_CHECKED_COUNT, count);
  }

  setMonitorToCheckPerTimeWindow(count: number) {
    if (!this.isClientReady) {
      Logger.error(`Redis client is not ready, can't set checked count`);
      return null;
    }
    return this._redisClient.set(MONITOR_CHECK_PER_TIME_WINDOW, count);
  }

  async getMonitorToCheckPerTimeWindow() {
    if (!this.isClientReady) {
      Logger.error(
        `Redis client is not ready, can't get monitor to check per time window`,
      );
      return null;
    }
    const res = await this._redisClient.get(MONITOR_CHECK_PER_TIME_WINDOW);
    if (res === null) {
      return null;
    }
    return parseInt(res);
  }
}
