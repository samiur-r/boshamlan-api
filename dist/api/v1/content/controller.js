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
exports.fetch = void 0;
const logger_1 = __importDefault(require("../../../utils/logger"));
const service_1 = require("../categories/service");
const service_2 = require("../locations/service");
const service_3 = require("../property_types/service");
const fetch = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { location, propertyType, category } = req.body;
    const articles = [];
    let meta_title = '';
    let meta_description = '';
    try {
        if (location) {
            const locationArticle = yield (0, service_2.findLocationArticleById)(location.id);
            articles.push(locationArticle);
        }
        if (propertyType && location) {
            const isState = location.state_id === null;
            const { article, metaTitle, metaDescription } = yield (0, service_3.findPropertyTypeArticle)(propertyType.id, isState, category.id);
            let articleData;
            if (isState) {
                articleData = article.replace(/\$state/g, location.title);
            }
            else {
                const locationObj = yield (0, service_2.findLocationById)(location.state_id);
                articleData = article.replace(/\$state/g, locationObj.title);
                articleData = article.replace(/\$city/g, location.title);
            }
            articles.push(articleData);
            meta_title = metaTitle;
            meta_description = metaDescription;
        }
        else if (propertyType && !(location === null || location === void 0 ? void 0 : location.length)) {
            const { article, metaTitle, metaDescription } = yield (0, service_3.findPropertyTypeArticle)(propertyType.id, undefined, category.id);
            articles.push(article);
            meta_title = metaTitle;
            meta_description = metaDescription;
        }
        if (category && !propertyType) {
            if (location) {
                const isState = location.state_id === null;
                const { article, metaTitle, metaDescription } = yield (0, service_1.findCategoryArticle)(category.id, isState);
                articles.push(article);
                meta_title = metaTitle;
                meta_description = metaDescription;
            }
            else {
                const { article, metaTitle, metaDescription } = yield (0, service_1.findCategoryArticle)(category.id, undefined);
                articles.push(article);
                meta_title = metaTitle;
                meta_description = metaDescription;
            }
        }
        return res.status(200).json({ articles, meta_title, meta_description });
    }
    catch (error) {
        logger_1.default.error(`${error.name}: ${error.message}`);
        return next(error);
    }
});
exports.fetch = fetch;
//# sourceMappingURL=controller.js.map