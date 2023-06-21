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
exports.findLocationArticleById = exports.updateLocationCountValue = exports.findLocationById = void 0;
const ErrorHandler_1 = __importDefault(require("../../../utils/ErrorHandler"));
const model_1 = require("./model");
const updateLocationCountValue = (id, opt) => __awaiter(void 0, void 0, void 0, function* () {
    const location = yield model_1.Location.findOneBy({ id });
    if (!location)
        throw new ErrorHandler_1.default(500, 'Something went wrong');
    yield model_1.Location.update(id, { count: () => (opt === 'increment' ? 'count + 1' : 'count - 1') });
    yield model_1.Location.update({ id: location === null || location === void 0 ? void 0 : location.state_id }, { count: () => (opt === 'increment' ? 'count + 1' : 'count - 1') });
});
exports.updateLocationCountValue = updateLocationCountValue;
const findLocationArticleById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const location = yield model_1.Location.findOneBy({ id });
    if (!location)
        throw new ErrorHandler_1.default(500, 'Something went wrong');
    return location.article;
});
exports.findLocationArticleById = findLocationArticleById;
const findLocationById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const location = yield model_1.Location.findOneBy({ id });
    if (!location)
        throw new ErrorHandler_1.default(500, 'Something went wrong');
    return location;
});
exports.findLocationById = findLocationById;
//# sourceMappingURL=service.js.map