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
exports.fetchLogsByUser = exports.fetchLogsByPostId = exports.saveUserLog = void 0;
const ErrorHandler_1 = __importDefault(require("../../../utils/ErrorHandler"));
const service_1 = require("../users/service");
const model_1 = require("./model");
const saveUserLog = (logs) => __awaiter(void 0, void 0, void 0, function* () {
    const newPostLogs = logs.map((log) => {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        const { post_id, user, transaction, activity } = log;
        return model_1.UserLog.create({ post_id, transaction, user, activity });
    });
    yield model_1.UserLog.save(newPostLogs);
});
exports.saveUserLog = saveUserLog;
const fetchLogsByPostId = (postId, offset) => __awaiter(void 0, void 0, void 0, function* () {
    const [logs, count] = yield model_1.UserLog.findAndCount({
        where: { post_id: postId },
        order: { created_at: 'DESC' },
        skip: offset,
        take: 10,
    });
    logs === null || logs === void 0 ? void 0 : logs.forEach((log) => {
        log.publish_date = log.created_at.toISOString().slice(0, 10);
    });
    const totalPages = Math.ceil(count / 10);
    const response = { logs, totalPages, totalResults: count };
    return response;
});
exports.fetchLogsByPostId = fetchLogsByPostId;
const fetchLogsByUser = (user, offset) => __awaiter(void 0, void 0, void 0, function* () {
    let userObj;
    if (user.length < 8) {
        userObj = yield (0, service_1.findUserById)(parseInt(user, 10));
    }
    else {
        userObj = yield (0, service_1.findUserByPhone)(user);
    }
    if (!userObj)
        throw new ErrorHandler_1.default(401, 'User not found for the log');
    const [logs, count] = yield model_1.UserLog.findAndCount({
        where: [{ user: userObj.phone }, { user: userObj.id.toString() }],
        order: { created_at: 'DESC' },
        skip: offset,
        take: 10,
    });
    logs === null || logs === void 0 ? void 0 : logs.forEach((log) => {
        log.publish_date = log.created_at.toISOString().slice(0, 10);
    });
    const totalPages = Math.ceil(count / 10);
    const response = { logs, totalPages, totalResults: count };
    return response;
});
exports.fetchLogsByUser = fetchLogsByUser;
//# sourceMappingURL=service.js.map