import ErrorHandler from '../../../utils/ErrorHandler';
import { Location } from './model';

const updateLocationCountValue = async (id: number, opt: string) => {
  const location = await Location.findOneBy({ id });

  if (!location) throw new ErrorHandler(500, 'Something went wrong');

  await Location.update(id, { count: () => (opt === 'increment' ? 'count + 1' : 'count - 1') });
  await Location.update({ id: location?.state_id }, { count: () => (opt === 'increment' ? 'count + 1' : 'count - 1') });
};

const findLocationArticleById = async (id: number) => {
  const location = await Location.findOneBy({ id });

  if (!location) throw new ErrorHandler(500, 'Something went wrong');

  return location.article;
};

const findLocationById = async (id: number) => {
  const location = await Location.findOneBy({ id });

  if (!location) throw new ErrorHandler(500, 'Something went wrong');

  return location;
};

export { findLocationById, updateLocationCountValue, findLocationArticleById };
