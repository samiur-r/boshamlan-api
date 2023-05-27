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
exports.update = exports.fetchMany = exports.fetchByPhone = exports.fetchById = exports.fetch = void 0;
const cloudinaryUtils_1 = require("../../../utils/cloudinaryUtils");
const ErrorHandler_1 = __importDefault(require("../../../utils/ErrorHandler"));
const logger_1 = __importDefault(require("../../../utils/logger"));
const slackUtils_1 = require("../../../utils/slackUtils");
const service_1 = require("../posts/service");
const service_2 = require("../users/service");
const service_3 = require("./service");
const validation_1 = require("./validation");
const fetchMany = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
    const offset = req.query.offset ? parseInt(req.query.offset, 10) : undefined;
    try {
        const { agents, totalRows } = yield (0, service_3.findManyAgents)(limit, offset);
        return res.status(200).json({ agents, totalRows });
    }
    catch (error) {
        logger_1.default.error(`${error.name}: ${error.message}`);
        return next(error);
    }
});
exports.fetchMany = fetchMany;
const fetchById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const agent = yield (0, service_3.findAgentById)(parseInt(req.params.id, 10));
        if (!agent || !agent.user_id)
            throw new ErrorHandler_1.default(500, 'Something went wrong');
        const socialLinks = [];
        if (agent.instagram)
            socialLinks.push({
                image: '/images/instagram-white.svg',
                href: `https://www.instagram.com/${agent.instagram}`,
            });
        if (agent.twitter)
            socialLinks.push({
                image: '/images/twitter-white.svg',
                href: `https://www.twitter.com/${agent.twitter}`,
            });
        if (agent.email)
            socialLinks.push({
                image: '/images/email-white.svg',
                href: `mailto:${agent.email}`,
            });
        agent.socialLinks = socialLinks;
        const { posts, count } = yield (0, service_1.findPosts)(10, 0, agent.user_id);
        return res.status(200).json({ agent, posts, totalPosts: count });
    }
    catch (error) {
        logger_1.default.error(`${error.name}: ${error.message}`);
        return next(error);
    }
});
exports.fetchById = fetchById;
const fetchByPhone = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const agent = yield (0, service_3.findAgentByUserPhone)(req.params.phone);
        if (!agent || !agent.user_id)
            throw new ErrorHandler_1.default(500, 'Something went wrong');
        const socialLinks = [];
        if (agent.instagram)
            socialLinks.push({
                image: '/images/instagram-white.svg',
                href: `https://www.instagram.com/${agent.instagram}`,
            });
        if (agent.twitter)
            socialLinks.push({
                image: '/images/twitter-white.svg',
                href: `https://www.twitter.com/${agent.twitter}`,
            });
        if (agent.email)
            socialLinks.push({
                image: '/images/email-white.svg',
                href: `mailto:${agent.email}`,
            });
        agent.socialLinks = socialLinks;
        const { posts, count } = yield (0, service_1.findPosts)(10, 0, agent.user_id);
        return res.status(200).json({ agent, posts, totalPosts: count });
    }
    catch (error) {
        logger_1.default.error(`${error.name}: ${error.message}`);
        return next(error);
    }
});
exports.fetchByPhone = fetchByPhone;
const fetch = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = res.locals.user.payload;
    try {
        const agent = yield (0, service_3.findAgentByUserId)(user.id);
        return res.status(200).json({ agent });
    }
    catch (error) {
        logger_1.default.error(`${error.name}: ${error.message}`);
        return next(error);
    }
});
exports.fetch = fetch;
const update = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { agentInfo } = req.body;
    const userId = res.locals.user.payload.id;
    try {
        const { files } = req;
        const user = yield (0, service_2.findUserById)(userId);
        if (!user || !user.is_agent)
            throw new ErrorHandler_1.default(403, 'You are not an agent');
        yield validation_1.agentSchema.validate(agentInfo);
        if (files && files.length) {
            const url = yield (0, cloudinaryUtils_1.uploadMediaToCloudinary)(files[0], 'agents');
            agentInfo.logo_url = url;
        }
        else
            agentInfo.logo_url = null;
        yield (0, service_3.updateAgent)(agentInfo, user.id);
        const slackMsg = `Agent details edited\n${(user === null || user === void 0 ? void 0 : user.phone) ? `<https://wa.me/965${user === null || user === void 0 ? void 0 : user.phone}|${user === null || user === void 0 ? void 0 : user.phone}>` : ''} - ${(user === null || user === void 0 ? void 0 : user.admin_comment) || ''}`;
        yield (0, slackUtils_1.alertOnSlack)('imp', slackMsg);
        return res.status(200).json({ success: 'Your info is updated successfully' });
    }
    catch (error) {
        logger_1.default.error(`${error.name}: ${error.message}`);
        if (error.name === 'ValidationError') {
            error.message = 'Invalid payload passed';
        }
        return next(error);
    }
});
exports.update = update;
//# sourceMappingURL=controller.js.map