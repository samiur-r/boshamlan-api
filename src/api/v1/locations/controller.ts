import { NextFunction, Request, Response } from 'express';

import logger from '../../../utils/logger';
import { Post } from '../posts/models/Post';
import { PropertyType } from '../property_types/model';
import { Location } from './model';

const fetchAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const locationList = await Location.find({
      order: {
        count: 'DESC',
        title: 'ASC',
      },
    });

    const locations: any = [];
    const states = locationList.filter((location) => location.state_id === null);

    states.forEach((state) => {
      const cities = locationList.filter((location) => location.state_id === state.id);
      locations.push(state);
      locations.push(...cities);
    });

    const propertyTypes = await PropertyType.find({
      select: ['id', 'title'],
    });
    // const posts = await Post.find({
    //   select: ['property_id'],
    // });
    // propertyTypes.forEach((type: any) => {
    //   const count = posts.filter((post) => post.property_id === type.id).length;
    //   // eslint-disable-next-line no-param-reassign
    //   type.count = count;
    // });

    // propertyTypes.sort((a: any, b: any) => b.count - a.count);

    return res.status(200).json({ locations, propertyTypes });
  } catch (error) {
    logger.error(`${error.name}: ${error.message}`);
    return next(error);
  }
};

export { fetchAll };
