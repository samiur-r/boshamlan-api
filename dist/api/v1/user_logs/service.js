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
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchLogsByUser = exports.fetchLogsByPostId = exports.saveUserLog = void 0;
/* eslint-disable no-param-reassign */
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
const fetchLogsByPostId = (postId) => __awaiter(void 0, void 0, void 0, function* () {
    const logs = yield model_1.UserLog.find({ where: { post_id: postId }, order: { created_at: 'DESC' } });
    logs === null || logs === void 0 ? void 0 : logs.forEach((log) => {
        log.publish_date = log.created_at.toISOString().slice(0, 10);
    });
    return logs;
});
exports.fetchLogsByPostId = fetchLogsByPostId;
const fetchLogsByUser = (user) => __awaiter(void 0, void 0, void 0, function* () {
    const logs = yield model_1.UserLog.find({ where: { user }, order: { created_at: 'DESC' } });
    logs === null || logs === void 0 ? void 0 : logs.forEach((log) => {
        log.publish_date = log.created_at.toISOString().slice(0, 10);
    });
    return logs;
});
exports.fetchLogsByUser = fetchLogsByUser;
//# sourceMappingURL=service.js.map