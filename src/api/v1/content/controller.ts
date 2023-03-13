/* eslint-disable @typescript-eslint/naming-convention */
import { NextFunction, Request, Response } from 'express';

import logger from '../../../utils/logger';
import { findCategoryArticle } from '../categories/service';
import { findLocationArticleById, findLocationById } from '../locations/service';
import { findPropertyTypeArticle } from '../property_types/service';

const fetch = async (req: Request, res: Response, next: NextFunction) => {
  const { location, propertyType, category } = req.body;

  const articles = [];
  let meta_title = '';
  let meta_description = '';

  try {
    if (location) {
      const locationArticle = await findLocationArticleById(location.id);
      articles.push(locationArticle);
    }

    if (propertyType && location) {
      const isState = location.state_id === null;

      const { article, metaTitle, metaDescription } = await findPropertyTypeArticle(
        propertyType.id,
        isState,
        category.id,
      );

      let articleData;

      if (isState) {
        articleData = article.replace(/\$state/g, location.title);
      } else {
        const locationObj = await findLocationById(location.state_id);
        articleData = article.replace(/\$state/g, locationObj.title);
        articleData = article.replace(/\$city/g, location.title);
      }
      articles.push(articleData);
      meta_title = metaTitle;
      meta_description = metaDescription;
    } else if (propertyType && !location?.length) {
      const { article, metaTitle, metaDescription } = await findPropertyTypeArticle(
        propertyType.id,
        undefined,
        category.id,
      );
      articles.push(article);
      meta_title = metaTitle;
      meta_description = metaDescription;
    }

    if (category && !propertyType) {
      if (location) {
        const isState = location.state_id === null;

        const { article, metaTitle, metaDescription } = await findCategoryArticle(category.id, isState);
        articles.push(article);
        meta_title = metaTitle;
        meta_description = metaDescription;
      } else {
        const { article, metaTitle, metaDescription } = await findCategoryArticle(category.id, undefined);
        articles.push(article);
        meta_title = metaTitle;
        meta_description = metaDescription;
      }
    }

    return res.status(200).json({ articles, meta_title, meta_description });
  } catch (error) {
    logger.error(`${error.name}: ${error.message}`);
    return next(error);
  }
};

export { fetch };
