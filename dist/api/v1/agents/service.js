"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.findAgentById = exports.findManyAgents = exports.getExpiredAgentUserIds = exports.updateAgent = exports.findAgentByUserId = exports.initOrUpdateAgent = void 0;
/* eslint-disable no-param-reassign */
const dayjs_1 = __importDefault(require("dayjs"));
const path = __importStar(require("path"));
const typeorm_1 = require("typeorm");
const deleteFile_1 = require("../../../utils/deleteFile");
const ErrorHandler_1 = __importDefault(require("../../../utils/ErrorHandler"));
const model_1 = require("./model");
const findManyAgents = (limit, offset) => __awaiter(void 0, void 0, void 0, function* () {
    let totalRows;
    const currentDate = new Date();
    const agents = yield model_1.Agent.find({
        where: { expiry_date: (0, typeorm_1.MoreThanOrEqual)(currentDate) },
        take: limit,
        skip: offset,
    });
    if (offset === 0)
        totalRows = yield model_1.Agent.count();
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
    const agent = yield model_1.Agent.findOne({ where: { user: { id: userId } } });
    agent === null || agent === void 0 ? true : delete agent.user;
    return agent;
});
exports.findAgentByUserId = findAgentByUserId;
const findAgentById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const agent = yield model_1.Agent.findOneBy({ id });
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
        const currentDirectory = __dirname;
        const filePath = path.resolve(currentDirectory, '../../../../../boshamlan-frontend/public/images/agents');
        (0, deleteFile_1.deleteFile)(`${filePath}/${agent.logo_url}`);
    }
    const agentData = model_1.Agent.create(Object.assign(Object.assign({}, agent), agentInfo));
    yield model_1.Agent.save(agentData);
});
exports.updateAgent = updateAgent;
const initOrUpdateAgent = (user) => __awaiter(void 0, void 0, void 0, function* () {
    const agent = yield findAgentByUserId(user.id);
    let agentData;
    if (agent) {
        agentData = model_1.Agent.create(Object.assign(Object.assign({}, agent), { expiry_date: (0, dayjs_1.default)().month(3) }));
    }
    else {
        agentData = model_1.Agent.create({
            name: 'agent',
            expiry_date: (0, dayjs_1.default)().month(3),
            user,
        });
    }
    yield model_1.Agent.save(agentData);
});
exports.initOrUpdateAgent = initOrUpdateAgent;
const getExpiredAgentUserIds = () => __awaiter(void 0, void 0, void 0, function* () {
    const agents = yield model_1.Agent.find({
        where: { expiry_date: (0, typeorm_1.LessThan)(new Date()) },
    });
    const userIds = agents.map((agent) => agent.user.id);
    return userIds;
});
exports.getExpiredAgentUserIds = getExpiredAgentUserIds;
//# sourceMappingURL=service.js.map