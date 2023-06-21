import ErrorHandler from '../../../utils/ErrorHandler';
import { PropertyType } from './model';

const findPropertyTypeArticle = async (
  id: number,
  isState: boolean | undefined,
  categoryId: number,
): Promise<{ article: string; metaTitle: string; metaDescription: string }> => {
  const propertyType = await PropertyType.findOneBy({ id });

  if (!propertyType) throw new ErrorHandler(500, 'Something went wrong');

  if (isState) {
    switch (categoryId) {
      case 1:
        return {
          article: propertyType.article_exchange_state,
          metaTitle: propertyType.meta_title_exchange_state,
          metaDescription: propertyType.meta_description_exchange_state,
        };
      case 2:
        return {
          article: propertyType.article_sale_state,
          metaTitle: propertyType.meta_title_sale_state,
          metaDescription: propertyType.meta_description_sale_state,
        };
      case 3:
        return {
          article: propertyType.article_rent_state,
          metaTitle: propertyType.meta_title_rent_state,
          metaDescription: propertyType.meta_description_rent_state,
        };
      default:
        break;
    }
  } else if (isState === undefined) {
    switch (categoryId) {
      case 1:
        return {
          article: propertyType.article_exchange,
          metaTitle: propertyType.meta_title_exchange,
          metaDescription: propertyType.meta_description_exchange,
        };
      case 2:
        return {
          article: propertyType.article_sale,
          metaTitle: propertyType.meta_title_sale,
          metaDescription: propertyType.meta_description_sale,
        };
      case 3:
        return {
          article: propertyType.article_rent,
          metaTitle: propertyType.meta_title_rent,
          metaDescription: propertyType.meta_description_rent,
        };
      default:
        break;
    }
  } else {
    switch (categoryId) {
      case 1:
        return {
          article: propertyType.article_exchange_city,
          metaTitle: propertyType.meta_title_exchange_city,
          metaDescription: propertyType.meta_description_exchange_city,
        };
      case 2:
        return {
          article: propertyType.article_sale_city,
          metaTitle: propertyType.meta_title_sale_city,
          metaDescription: propertyType.meta_description_sale_city,
        };
      case 3:
        return {
          article: propertyType.article_rent_city,
          metaTitle: propertyType.meta_title_rent_city,
          metaDescription: propertyType.meta_description_rent_city,
        };
      default:
        break;
    }
  }
  return { article: '', metaTitle: '', metaDescription: '' };
};

export { findPropertyTypeArticle };
