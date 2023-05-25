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
exports.setSubscriptionNull = exports.fireAgentExpirationAlert = exports.findAgentById = exports.findManyAgents = exports.getExpiredAgentUserIds = exports.updateAgent = exports.findAgentByUserId = exports.initOrUpdateAgent = void 0;
/* eslint-disable no-param-reassign */
const typeorm_1 = require("typeorm");
const cloudinaryUtils_1 = require("../../../utils/cloudinaryUtils");
const ErrorHandler_1 = __importDefault(require("../../../utils/ErrorHandler"));
const logger_1 = __importDefault(require("../../../utils/logger"));
const slackUtils_1 = require("../../../utils/slackUtils");
const smsUtils_1 = require("../../../utils/smsUtils");
const model_1 = require("../users/model");
const service_1 = require("../user_logs/service");
const model_2 = require("./model");
const findManyAgents = (limit, offset) => __awaiter(void 0, void 0, void 0, function* () {
    let totalRows;
    const currentDate = new Date();
    const agents = yield model_2.Agent.find({
        where: { subscription_ends_date: (0, typeorm_1.MoreThanOrEqual)(currentDate) },
        order: { subscription_start_date: 'DESC' },
        take: limit,
        skip: offset,
    });
    if (offset === 0)
        totalRows = agents.length;
    agents === null || agents === void 0 ? void 0 : agents.forEach((agent) => {
        var _a;
        agent.phone = (_a = agent.user) === null || _a === void 0 ? void 0 : _a.phone;
        const socialLinks = [];
        if (agent.instagram)
            socialLinks.push({
                image: '/images/instagram-filled.svg',
                href: `https://www.instagram.com/${agent.instagram}`,
            });
        if (agent.twitter)
            socialLinks.push({
                image: '/images/twitter-filled.svg',
                href: `https://www.twitter.com/${agent.twitter}`,
            });
        if (agent.email)
            socialLinks.push({
                image: '/images/email-filled.svg',
                href: `mailto:${agent.email}`,
            });
        agent.socialLinks = socialLinks;
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
const initOrUpdateAgent = (user, packageTitle) => __awaiter(void 0, void 0, void 0, function* () {
    const agent = yield findAgentByUserId(user.id);
    const today = new Date();
    // const twoMonthsFromToday = new Date(
    //   today.getFullYear(),
    //   today.getMonth() + 2,
    //   today.getDate(),
    //   today.getHours(),
    //   today.getMinutes(),
    //   today.getSeconds(),
    // );
    const oneDayFromToday = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, today.getHours(), today.getMinutes(), today.getSeconds());
    const twoDaysFromToday = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, today.getHours(), today.getMinutes(), today.getSeconds());
    today.setMinutes(Math.ceil(today.getMinutes() / 30) * 30);
    today.setSeconds(0);
    today.setMilliseconds(0);
    oneDayFromToday.setMinutes(Math.ceil(oneDayFromToday.getMinutes() / 30) * 30);
    oneDayFromToday.setSeconds(0);
    oneDayFromToday.setMilliseconds(0);
    twoDaysFromToday.setMinutes(Math.ceil(twoDaysFromToday.getMinutes() / 30) * 30);
    twoDaysFromToday.setSeconds(0);
    twoDaysFromToday.setMilliseconds(0);
    let agentData;
    if (agent) {
        agentData = model_2.Agent.create(Object.assign(Object.assign({}, agent), { subscription_start_date: today, subscription_ends_date: packageTitle === 'agent1' ? oneDayFromToday : twoDaysFromToday }));
    }
    else {
        agentData = model_2.Agent.create({
            name: 'agent',
            subscription_start_date: today,
            subscription_ends_date: packageTitle === 'agent1' ? oneDayFromToday : twoDaysFromToday,
            user,
        });
    }
    yield model_2.Agent.save(agentData);
});
exports.initOrUpdateAgent = initOrUpdateAgent;
const getExpiredAgentUserIds = () => __awaiter(void 0, void 0, void 0, function* () {
    const currentDate = new Date();
    const agents = yield model_2.Agent.find({
        where: { subscription_ends_date: (0, typeorm_1.LessThan)(currentDate) },
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
        const slackMsg = `Subscription ended.\n\n${(user === null || user === void 0 ? void 0 : user.phone) ? `<https://wa.me/965${user === null || user === void 0 ? void 0 : user.phone}|${user === null || user === void 0 ? void 0 : user.phone}>` : ''} - ${(user === null || user === void 0 ? void 0 : user.admin_comment) || ''}`;
        try {
            // eslint-disable-next-line no-await-in-loop
            yield (0, slackUtils_1.alertOnSlack)('imp', slackMsg);
            // eslint-disable-next-line no-await-in-loop
            yield (0, smsUtils_1.sendSms)(user.phone, 'Your subscription ended');
            logger_1.default.info(`Agent ${user.phone} subscription has ended`);
            // eslint-disable-next-line no-await-in-loop
            yield (0, service_1.saveUserLog)([
                {
                    post_id: undefined,
                    transaction: undefined,
                    user: user === null || user === void 0 ? void 0 : user.phone,
                    activity: `Agent ${user.phone} subscription has ended`,
                },
            ]);
        }
        catch (error) {
            logger_1.default.error(`${error.name}: ${error.message}`);
        }
    }
});
exports.fireAgentExpirationAlert = fireAgentExpirationAlert;
const setSubscriptionNull = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const agent = yield findAgentByUserId(userId);
    if (!agent)
        return;
    const agentData = model_2.Agent.create(Object.assign(Object.assign({}, agent), { 
        // @ts-ignore
        subscription_start_date: null, subscription_ends_date: null }));
    yield model_2.Agent.save(agentData);
});
exports.setSubscriptionNull = setSubscriptionNull;
//# sourceMappingURL=service.js.map