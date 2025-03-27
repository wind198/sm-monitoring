import { Logger } from '@nestjs/common';

// allow WithLogger to receive an optional string argument server as Logger name
export function WithLogger(server?: string) {
  return function (constructor: Function) {
    constructor.prototype.logger = new Logger(server || constructor.name);
  };
}
