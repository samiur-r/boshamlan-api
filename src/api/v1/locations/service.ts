import ErrorHandler from '../../../utils/ErrorHandler';
import { Location } from './model';

const updateLocationCountValue = async (cityId: number, opt: string) => {
  const city = await Location.findOneBy({ id: cityId });
  if (!city) throw new ErrorHandler(500, 'Something went wrong');

  const state = await Location.findOneBy({ id: city.state_id });
  if (!state) throw new ErrorHandler(500, 'Something went wrong');

  const cityCountVal = opt === 'increment' ? city.count + 1 : city.count - 1;
  const stateCountVal = opt === 'increment' ? state.count + 1 : state.count - 1;

  const newCity = Location.create({
    ...city,
    count: cityCountVal,
  });

  const newState = Location.create({
    ...state,
    count: stateCountVal,
  });

  await Location.save(newCity);
  await Location.save(newState);
};

export { updateLocationCountValue };
