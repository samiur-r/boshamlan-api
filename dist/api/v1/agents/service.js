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
exports.fireAgentExpirationAlert = exports.findAgentById = exports.findManyAgents = exports.getExpiredAgentUserIds = exports.updateAgent = exports.findAgentByUserId = exports.initOrUpdateAgent = void 0;
/* eslint-disable no-param-reassign */
const typeorm_1 = require("typeorm");
const cloudinaryUtils_1 = require("../../../utils/cloudinaryUtils");
const ErrorHandler_1 = __importDefault(require("../../../utils/ErrorHandler"));
const logger_1 = __importDefault(require("../../../utils/logger"));
const slackUtils_1 = require("../../../utils/slackUtils");
const smsUtils_1 = require("../../../utils/smsUtils");
const model_1 = require("../users/model");
const model_2 = require("./model");
const findManyAgents = (limit, offset) => __awaiter(void 0, void 0, void 0, function* () {
    let totalRows;
    const currentDate = new Date();
    const agents = yield model_2.Agent.find({
        where: { expiry_date: (0, typeorm_1.MoreThanOrEqual)(currentDate) },
        take: limit,
        skip: offset,
    });
    if (offset === 0)
        totalRows = yield model_2.Agent.count();
    agents === null || agents === void 0 ? void 0 : agents.forEach((agent) => {
        var _a;
        agent.phone = (_a = agent.user) === null || _a === void 0 ? void 0 : _a.phone;
        agent.socialLinks = [
            {
                image: '/images/facebook-filled.svg',
                href: `https://www.facebook.com/${agent.facebook}`,
            },
            {
                image: '/images/twitter-filled.svg',
                href: `https://www.twitter.com/${agent.twitter}`,
            },
            {
                image: '/images/instagram-filled.svg',
                href: `https://www.instagram.com/${agent.instagram}`,
            },
            {
                image: '/images/email-filled.svg',
                href: `mailto:${agent.email}`,
            },
        ];
        agent === null || agent === void 0 ? true : delete agent.user;
    });
    return { agents, totalRows };
});
exports.findManyAgents = findManyAgents;
const findAgentByUserId = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const agent = yield model_2.Agent.findOne({ where: { user: { id: userId } } });
    agent === null || agent === void 0 ? true : delete agent.user;
    return agent;
});
exports.findAgentByUserId = findAgentByUserId;
const findAgentById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const agent = yield model_2.Agent.findOneBy({ id });
    if (agent) {
        agent.phone = (_a = agent === null || agent === void 0 ? void 0 : agent.user) === null || _a === void 0 ? void 0 : _a.phone;
        agent.user_id = (_b = agent === null || agent === void 0 ? void 0 : agent.user) === null || _b === void 0 ? void 0 : _b.id;
    }
    agent === null || agent === void 0 ? true : delete agent.user;
    return agent;
});
exports.findAgentById = findAgentById;
const updateAgent = (agentInfo, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const agent = yield findAgentByUserId(userId);
    if (!agent)
        throw new ErrorHandler_1.default(404, `agent doesn't exists`);
    if (agent.logo_url) {
        yield (0, cloudinaryUtils_1.deleteMediaFromCloudinary)(agent.logo_url, 'agents');
    }
    const agentData = model_2.Agent.create(Object.assign(Object.assign({}, agent), agentInfo));
    yield model_2.Agent.save(agentData);
});
exports.updateAgent = updateAgent;
const initOrUpdateAgent = (user) => __awaiter(void 0, void 0, void 0, function* () {
    const agent = yield findAgentByUserId(user.id);
    const today = new Date();
    const twoMonthsFromToday = new Date(today.getFullYear(), today.getMonth() + 2, today.getDate(), today.getHours(), today.getMinutes(), today.getSeconds());
    let agentData;
    if (agent) {
        agentData = model_2.Agent.create(Object.assign(Object.assign({}, agent), { expiry_date: twoMonthsFromToday }));
    }
    else {
        agentData = model_2.Agent.create({
            name: 'agent',
            expiry_date: twoMonthsFromToday,
            user,
        });
    }
    yield model_2.Agent.save(agentData);
});
exports.initOrUpdateAgent = initOrUpdateAgent;
const getExpiredAgentUserIds = () => __awaiter(void 0, void 0, void 0, function* () {
    const agents = yield model_2.Agent.find({
        where: { expiry_date: (0, typeorm_1.LessThan)(new Date()) },
    });
    const userIds = agents.filter((agent) => agent.user.is_agent === true).map((agent) => agent.user.id);
    return userIds;
});
exports.getExpiredAgentUserIds = getExpiredAgentUserIds;
const fireAgentExpirationAlert = (userIds) => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield model_1.User.find({
        where: { id: (0, typeorm_1.In)(userIds) },
    });
    // eslint-disable-next-line no-restricted-syntax
    for (const user of users) {
        const slackMsg = `Subscription ended.\n\n${(user === null || user === void 0 ? void 0 : user.phone) ? `User: <https://wa.me/965${user === null || user === void 0 ? void 0 : user.phone}|${user === null || user === void 0 ? void 0 : user.phone}>` : ''}`;
        try {
            // eslint-disable-next-line no-await-in-loop
            yield (0, slackUtils_1.alertOnSlack)('imp', slackMsg);
            // eslint-disable-next-line no-await-in-loop
            yield (0, smsUtils_1.sendSms)(user.phone, 'Your subscription ended');
        }
        catch (error) {
            logger_1.default.error(`${error.name}: ${error.message}`);
        }
    }
});
exports.fireAgentExpirationAlert = fireAgentExpirationAlert;
//# sourceMappingURL=service.js.map