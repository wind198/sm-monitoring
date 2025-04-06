import { faker } from '@faker-js/faker';

export const randomPassword = (count: number = 8) => {
  return faker.internet.password({ length: count });
};

export const randomActivationKey = () => {
  return faker.string.uuid();
};
