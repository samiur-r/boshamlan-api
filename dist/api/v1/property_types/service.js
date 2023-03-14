"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findPropertyTypeArticle = void 0;
const ErrorHandler_1 = __importDefault(require("../../../utils/ErrorHandler"));
const model_1 = require("./model");
const findPropertyTypeArticle = (id, isState, categoryId) => __awaiter(void 0, void 0, void 0, function* () {
    const propertyType = yield model_1.PropertyType.findOneBy({ id });
    if (!propertyType)
        throw new ErrorHandler_1.default(500, 'Something went wrong');
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
    }
    else if (isState === undefined) {
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
    }
    else {
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
});
exports.findPropertyTypeArticle = findPropertyTypeArticle;
//# sourceMappingURL=service.js.map