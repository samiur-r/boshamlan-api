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
exports.fetchAll = void 0;
const logger_1 = __importDefault(require("../../../utils/logger"));
const Post_1 = require("../posts/models/Post");
const model_1 = require("../property_types/model");
const model_2 = require("./model");
const fetchAll = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const locationList = yield model_2.Location.find({
            order: {
                count: 'DESC',
                title: 'ASC',
            },
        });
        const locations = [];
        const states = locationList.filter((location) => location.state_id === null);
        states.forEach((state) => {
            const cities = locationList.filter((location) => location.state_id === state.id);
            locations.push(state);
            locations.push(...cities);
        });
        const propertyTypes = yield model_1.PropertyType.find({
            select: ['id', 'title'],
        });
        const posts = yield Post_1.Post.find({
            select: ['property_id'],
        });
        propertyTypes.forEach((type) => {
            const count = posts.filter((post) => post.property_id === type.id).length;
            // eslint-disable-next-line no-param-reassign
            type.count = count;
        });
        propertyTypes.sort((a, b) => b.count - a.count);
        return res.status(200).json({ locations, propertyTypes });
    }
    catch (error) {
        logger_1.default.error(`${error.name}: ${error.message}`);
        return next(error);
    }
});
exports.fetchAll = fetchAll;
//# sourceMappingURL=controller.js.map