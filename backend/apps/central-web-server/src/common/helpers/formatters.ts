import { ISort } from 'apps/central-web-server/src/common/types/sort';
import { isEmpty } from 'lodash';
import { SortOrder } from 'mongoose';

export const formatSortForMongoose = (i: ISort) => {
  if (isEmpty(i)) {
    return {};
  }
  const { field, order } = i;
  return {
    [field]: (order === 'ASC' ? 1 : -1) as SortOrder,
  };
};
