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
exports.checkIfUserHasNoCredits = exports.checkIfUserHasOnlySticky = exports.fetchFreeCredits = exports.fetchStickyCredits = void 0;
const ErrorHandler_1 = __importDefault(require("../../../utils/ErrorHandler"));
const logger_1 = __importDefault(require("../../../utils/logger"));
const service_1 = require("./service");
const fetchStickyCredits = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = res.locals.user.payload;
    try {
        const stickyCredits = yield (0, service_1.findStickyCredits)(user.id);
        return res.status(200).json({ success: stickyCredits });
    }
    catch (error) {
        logger_1.default.error(`${error.name}: ${error.message}`);
        return next(error);
    }
});
exports.fetchStickyCredits = fetchStickyCredits;
const fetchFreeCredits = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = res.locals.user.payload;
    try {
        const freeCredits = yield (0, service_1.findFreeCredits)(user.id);
        return res.status(200).json({ success: freeCredits });
    }
    catch (error) {
        logger_1.default.error(`${error.name}: ${error.message}`);
        return next(error);
    }
});
exports.fetchFreeCredits = fetchFreeCredits;
const checkIfUserHasOnlySticky = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = res.locals.user.payload;
    try {
        const credits = yield (0, service_1.findCreditByUserId)(user.id);
        if (!credits)
            throw new ErrorHandler_1.default(404, 'User credits not found');
        const isStickyOnly = credits.sticky > 0 && credits.free === 0 && credits.regular === 0 && credits.agent === 0;
        return res.status(200).json({ isStickyOnly });
    }
    catch (error) {
        logger_1.default.error(`${error.name}: ${error.message}`);
        return next(error);
    }
});
exports.checkIfUserHasOnlySticky = checkIfUserHasOnlySticky;
const checkIfUserHasNoCredits = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = res.locals.user.payload;
    try {
        const credits = yield (0, service_1.findCreditByUserId)(user.id);
        if (!credits)
            throw new ErrorHandler_1.default(404, 'User credits not found');
        const hasNoCredits = credits.sticky === 0 && credits.free === 0 && credits.regular === 0 && credits.agent === 0;
        return res.status(200).json({ hasNoCredits });
    }
    catch (error) {
        logger_1.default.error(`${error.name}: ${error.message}`);
        return next(error);
    }
});
exports.checkIfUserHasNoCredits = checkIfUserHasNoCredits;
//# sourceMappingURL=controller.js.map