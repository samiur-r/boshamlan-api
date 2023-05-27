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
exports.fetchCreditAndAgentInfo = exports.fetch = void 0;
const ErrorHandler_1 = __importDefault(require("../../../utils/ErrorHandler"));
const logger_1 = __importDefault(require("../../../utils/logger"));
const service_1 = require("../agents/service");
const service_2 = require("../credits/service");
const service_3 = require("../posts/service");
const service_4 = require("../users/service");
const fetch = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = res.locals.user.payload;
    let agent = null;
    try {
        const userInfo = yield (0, service_4.findUserById)(user.id);
        if (!userInfo)
            throw new ErrorHandler_1.default(500, 'Something went wrong');
        const credits = yield (0, service_2.findCreditByUserId)(userInfo.id);
        const { posts, count } = yield (0, service_3.findPosts)(10, 0, userInfo.id);
        const { archivePosts, archiveCount } = yield (0, service_3.findArchivedPostByUserId)(10, 0, userInfo.id);
        if (userInfo.is_agent)
            agent = yield (0, service_1.findAgentByUserId)(userInfo.id);
        return res
            .status(200)
            .json({ success: { agent, credits, posts, archivePosts, totalPosts: count, totalArchivePosts: archiveCount } });
    }
    catch (error) {
        logger_1.default.error(`${error.name}: ${error.message}`);
        return next(error);
    }
});
exports.fetch = fetch;
const fetchCreditAndAgentInfo = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = res.locals.user.payload;
    let agent = null;
    try {
        const userInfo = yield (0, service_4.findUserById)(user.id);
        if (!userInfo)
            throw new ErrorHandler_1.default(500, 'Something went wrong');
        const credits = yield (0, service_2.findCreditByUserId)(userInfo.id);
        if (userInfo.is_agent)
            agent = yield (0, service_1.findAgentByUserId)(userInfo.id);
        return res.status(200).json({ success: { agent, credits } });
    }
    catch (error) {
        logger_1.default.error(`${error.name}: ${error.message}`);
        return next(error);
    }
});
exports.fetchCreditAndAgentInfo = fetchCreditAndAgentInfo;
//# sourceMappingURL=controller.js.map