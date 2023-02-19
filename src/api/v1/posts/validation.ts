import { mixed, object, number, string } from 'yup';

export const postSchema = object({
  cityId: number().required(),
  propertyId: number().required(),
  purposeId: number().required(),
  price: number(),
  description: string(),
  images: mixed(),
});
