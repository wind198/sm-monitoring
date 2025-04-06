import { Options } from 'amqplib';

export const NODE_ENV = process.env.NODE_ENV || 'development';
export const IS_DEV = NODE_ENV === 'development';
export const LOG_LEVEL = process.env.LOG_LEVEL || (IS_DEV ? 'debug' : 'log');

/** CENTRAL WEB API */
export const WEBAPI_PORT = process.env.PORT || 3000;
export const JWT_SECRET = process.env.JWT_SECRET || 'jwt-secret';
export const AUTH_TOKEN_EXPIRATION = process.env.AUTH_TOKEN_EXPIRATION || '5m';
export const REFRESH_TOKEN_EXPIRATION =
  process.env.REFRESH_TOKEN_EXPIRATION || '7d';

export const FRONTEND_URL = process.env.FRONTEND_URL || /http:\/\/localhost:.*/;

export const DEFAULT_SP_ADMIN_EMAIL =
  process.env.DEFAULT_SP_ADMIN_EMAIL || 'tuanbk1908@gmail.com';
export const DEFAULT_SP_ADMIN_PASSWORD =
  process.env.DEFAULT_SP_ADMIN_PASSWORD || 'password';

export const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || 'jwt-secret';
export const AUTH_TOKEN_EXPIRATION_TIME =
  process.env.AUTH_TOKEN_EXPIRATION_TIME || '7d';

export const DEFAULT_SUPER_USER_EMAIL =
  process.env.DEFAULT_SUPER_USER_EMAIL || 'tuanbk1908@gmail.com';
export const DEFAULT_SUPER_USER_PASSWORD =
  process.env.DEFAULT_SUPER_USER_PASSWORD || 'password';
/** CENTRAL WEB API */

/** SCHEDULER */
const MONITOR_JOB_EXP = 1800000; // 30 minutes
const MONITOR_JOB_RESULT_EXP = 1800000; // 30 minutes
const MANUAL_MONITOR_JOB_RESULT_EXP = 1800000; // 30 minutes
export const DELARE_MONITOR_JOB_QUEUE_ARGS: Options.AssertQueue = {
  durable: true,
  expires: MONITOR_JOB_EXP,
};
export const DELARE_MONITOR_JOB_RESULT_QUEUE_ARGS: Options.AssertQueue = {
  durable: true,
  expires: MONITOR_JOB_RESULT_EXP,
};
export const DELARE_MANUAL_MONITOR_JOB_RESULT_QUEUE_ARGS: Options.AssertQueue =
  {
    durable: true,
    expires: MANUAL_MONITOR_JOB_RESULT_EXP,
  };

export const CHECK_TIME_WINDOW = 5; // minutes

/** SCHEDULER */

/** CHECK AGENT */
export const LOCATION = process.env.LOCATION || 'us_east';

/** CHECK AGENT */

/** MONGO DB */
export const MONGO_DB_NAME =
  process.env.MONGO_DB_NAME || 'small_performance_monitoring';

export const MONGO_URL =
  process.env.MONGO_URL || `mongodb://localhost:27017/${MONGO_DB_NAME}`;
/** MONGO DB */

/** RABBITMQ */
export const RabbitMQConnectionProps: Options.Connect = {
  hostname: process.env.RABBITMQ_HOST || 'localhost', // IP address of the RabbitMQ server
  port: parseInt(process.env.RABBITMQ_PORT || '5672'),
  username: process.env.RABBITMQ_USER || 'guest', // username and password of for authentication
  password: process.env.RABBITMQ_PASSWORD || 'guest',
  //add vhost if default vhost is not desired
};
/** RABBITMQ */

/** REDIS */
export const REDIS_CONNECTION =
  process.env.REDIS_CONNECTION || 'redis://localhost:6379';
/** REDIS */
