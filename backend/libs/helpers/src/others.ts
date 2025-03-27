import { faker } from '@faker-js/faker';

export const sleepRandom = () => {
  const randomDuration = faker.number.int({ min: 5, max: 100 });
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, randomDuration * 100);
  });
};

export const sleep = (durationMiliseconds: number) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, durationMiliseconds);
  });
};
