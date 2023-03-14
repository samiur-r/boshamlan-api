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
exports.update = exports.fetchMany = exports.fetchById = exports.fetch = void 0;
const ErrorHandler_1 = __importDefault(require("../../../utils/ErrorHandler"));
const logger_1 = __importDefault(require("../../../utils/logger"));
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
        const { posts, count } = yield (0, service_1.findPosts)(10, 0, agent.user_id);
        return res.status(200).json({ agent, posts, totalPosts: count });
    }
    catch (error) {
        logger_1.default.error(`${error.name}: ${error.message}`);
        return next(error);
    }
});
exports.fetchById = fetchById;
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
    const files = req.files;
    if (files)
        agentInfo.logo_url = files[0].filename;
    try {
        const user = yield (0, service_2.findUserById)(userId);
        if (!user || !user.is_agent)
            throw new ErrorHandler_1.default(403, 'You are not an agent');
        yield validation_1.agentSchema.validate(agentInfo);
        yield (0, service_3.updateAgent)(agentInfo, user.id);
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