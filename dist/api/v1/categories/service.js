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
exports.findCategoryArticle = void 0;
const ErrorHandler_1 = __importDefault(require("../../../utils/ErrorHandler"));
const model_1 = require("./model");
const findCategoryArticle = (id, isState) => __awaiter(void 0, void 0, void 0, function* () {
    const category = yield model_1.Category.findOneBy({ id });
    if (!category)
        throw new ErrorHandler_1.default(500, 'Something went wrong');
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
});
exports.findCategoryArticle = findCategoryArticle;
//# sourceMappingURL=service.js.map