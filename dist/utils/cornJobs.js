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
exports.cronJobPerFiveMins = exports.cronJobPerHour = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const service_1 = require("../api/v1/agents/service");
const service_2 = require("../api/v1/credits/service");
const service_3 = require("../api/v1/posts/service");
const service_4 = require("../api/v1/users/service");
const logger_1 = __importDefault(require("./logger"));
const slackUtils_1 = require("./slackUtils");
function scheduledTaskPerHour() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            logger_1.default.info('Running hourly cron job');
            const ids = yield (0, service_1.getExpiredAgentUserIds)();
            yield (0, service_4.updateBulkIsUserAnAgent)(ids, false);
            yield (0, service_2.updateAgentCredit)(ids, 0);
            yield (0, service_1.fireAgentExpirationAlert)(ids);
            yield (0, service_3.moveExpiredPosts)();
        }
        catch (error) {
            logger_1.default.error(error.message);
        }
    });
}
function scheduledTaskPerFiveMins() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            logger_1.default.info('Running per 5 mins cron job');
            const users = yield (0, service_4.findUnVerifiedUsers)();
            let slackMsg = `Unverified users: `;
            users.forEach((user) => {
                slackMsg = `${slackMsg} \n\n ${(user === null || user === void 0 ? void 0 : user.phone) ? `User: <https://wa.me/965${user === null || user === void 0 ? void 0 : user.phone}|${user === null || user === void 0 ? void 0 : user.phone}>` : ''}`;
            });
            if (users && users.length)
                yield (0, slackUtils_1.alertOnSlack)('imp', slackMsg);
        }
        catch (error) {
            logger_1.default.error(error.message);
        }
    });
}
const cronJobPerHour = node_cron_1.default.schedule('0 * * * *', scheduledTaskPerHour);
exports.cronJobPerHour = cronJobPerHour;
const cronJobPerFiveMins = node_cron_1.default.schedule('*/5 * * * *', scheduledTaskPerFiveMins);
exports.cronJobPerFiveMins = cronJobPerFiveMins;
cronJobPerHour.on('error', (err) => {
    logger_1.default.info('Cron job error:', err.message);
});
cronJobPerFiveMins.on('error', (err) => {
    logger_1.default.info('Cron job error:', err.message);
});
//# sourceMappingURL=cornJobs.js.map