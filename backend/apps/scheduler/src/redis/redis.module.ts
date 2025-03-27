import { Module } from '@nestjs/common';
import { RedisService } from 'apps/scheduler/src/redis/redis.service';

@Module({
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}
