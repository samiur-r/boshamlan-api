import ErrorHandler from '../../../utils/ErrorHandler';
import { ICategory } from './interfaces';
import { Category } from './model';

const findCategoryArticle = async (
  id: number,
  isState: boolean | undefined,
): Promise<{ article: string; metaTitle: string; metaDescription: string }> => {
  const category: ICategory | null = await Category.findOneBy({ id });
  if (!category) throw new ErrorHandler(500, 'Something went wrong');

  switch (isState) {
    case true:
      return {
        article: category.article_state,
        metaTitle: category.meta_title_state,
        metaDescription: category.meta_description_state,
      };
    case false:
      return {
        article: category.article_city,
        metaTitle: category.meta_title_city,
        metaDescription: category.meta_description_city,
      };
    case undefined:
      return {
        article: category.article,
        metaTitle: category.meta_title,
        metaDescription: category.meta_description,
      };
    default:
      break;
  }

  return { article: '', metaTitle: '', metaDescription: '' };
};

export { findCategoryArticle };
