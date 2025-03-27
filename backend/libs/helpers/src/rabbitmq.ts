import { Logger } from '@nestjs/common';
import { connect } from 'amqplib';
import { RabbitMQConnectionProps } from 'libs/constants/src/envs';
import { formatProgressMessage } from 'libs/helpers/src/formaters';
import { delay } from 'lodash';
import { defer, retry, tap } from 'rxjs';

export const connectToRabbitmq = () => {
  const action = 'Connecting to RabbitMQ';
  return defer(() => {
    Logger.log(formatProgressMessage.begin`${action}`);
    return connect(RabbitMQConnectionProps);
  }).pipe(
    tap({
      error: (err) => {
        Logger.error(`${action}`, err);
        Logger.log(`Retrying after 5 seconds...`);
      },
    }),
    retry({ count: 3, delay: 5000 }),
    tap({
      next: () => {
        Logger.log(formatProgressMessage.end`${action}`);
      },
    }),
  );
};
