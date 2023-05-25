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
exports.searchArchived = exports.search = void 0;
const logger_1 = __importDefault(require("../../../utils/logger"));
const service_1 = require("../user_logs/service");
const service_2 = require("../posts/service");
const search = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { limit, offset, location, propertyType, category, priceRange, keyword } = req.body;
    const propertyId = propertyType ? propertyType.id : undefined;
    const categoryId = category ? category.id : undefined;
    let city = [];
    let stateId;
    if (location && location.length > 1)
        city = location;
    else if (location && location.length === 1) {
        if (location[0].state_id === null)
            stateId = location[0].id;
        else
            city = location;
    }
    logger_1.default.info(`User searched for city: ${city}, property type: ${propertyType}, category: ${category}, price range: ${priceRange} and keyword: ${keyword}`);
    yield (0, service_1.saveUserLog)([
        {
            post_id: undefined,
            transaction: undefined,
            user: undefined,
            activity: `User searched for city: ${city}, property type: ${propertyType}, category: ${category}, price range: ${priceRange} and keyword: ${keyword}`,
        },
    ]);
    try {
        const { posts, count } = yield (0, service_2.searchPosts)(limit, offset, city, stateId, propertyId, categoryId, priceRange, keyword);
        logger_1.default.info(`Posts sent as the searched values successfully`);
        return res.status(200).json({ posts, count });
    }
    catch (error) {
        logger_1.default.error(`${error.name}: ${error.message}`);
        logger_1.default.error(`Failed to send posts as searched for`);
        return next(error);
    }
});
exports.search = search;
const searchArchived = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { limit, offset, location, propertyType, category, priceRange, keyword } = req.body;
    const propertyId = propertyType ? propertyType.id : undefined;
    const categoryId = category ? category.id : undefined;
    let city = [];
    let stateId;
    if (location && location.length > 1)
        city = location;
    else if (location && location.length === 1) {
        if (location[0].state_id === null)
            stateId = location[0].id;
        else
            city = location;
    }
    logger_1.default.info(`User searched for city: ${city}, property type: ${propertyType}, category: ${category}, price range: ${priceRange} and keyword: ${keyword}`);
    yield (0, service_1.saveUserLog)([
        {
            post_id: undefined,
            transaction: undefined,
            user: undefined,
            activity: `User searched for city: ${city}, property type: ${propertyType}, category: ${category}, price range: ${priceRange} and keyword: ${keyword}`,
        },
    ]);
    try {
        const { posts, count } = yield (0, service_2.searchArchivedPosts)(limit, offset, city, stateId, propertyId, categoryId, priceRange, keyword);
        logger_1.default.info(`Archived posts sent as the searched values successfully`);
        return res.status(200).json({ posts, count });
    }
    catch (error) {
        logger_1.default.error(`${error.name}: ${error.message}`);
        logger_1.default.error(`Failed to send archived posts as searched for`);
        return next(error);
    }
});
exports.searchArchived = searchArchived;
//# sourceMappingURL=controller.js.map