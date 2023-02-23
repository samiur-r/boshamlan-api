import { mixed, object, number, string } from 'yup';

export const postSchema = object({
  title: string().required(),
  cityId: number().required(),
  cityTitle: string().required(),
  stateId: number().required(),
  stateTitle: string().required(),
  propertyId: number().required(),
  propertyTitle: string().required(),
  categoryId: number().required(),
  categoryTitle: string().required(),
  price: number(),
  description: string().required(),
  media: mixed(),
});
