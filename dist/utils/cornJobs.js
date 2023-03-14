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
const node_cron_1 = __importDefault(require("node-cron"));
const service_1 = require("../api/v1/agents/service");
const service_2 = require("../api/v1/credits/service");
const service_3 = require("../api/v1/posts/service");
const service_4 = require("../api/v1/users/service");
const logger_1 = __importDefault(require("./logger"));
function scheduledTask() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const ids = yield (0, service_1.getExpiredAgentUserIds)();
            yield (0, service_4.updateBulkIsUserAnAgent)(ids, false);
            yield (0, service_2.updateAgentCredit)(ids, 0);
            yield (0, service_3.moveExpiredPosts)();
        }
        catch (error) {
            logger_1.default.error(error.message);
        }
    });
}
const cronJob = node_cron_1.default.schedule('1 0 0 * * *', scheduledTask); // TODO: add { timezone: 'UTC' }
cronJob.on('error', (err) => {
    logger_1.default.info('Cron job error:', err.message);
});
// // Stop the cron job when the application is shutting down
// process.on('SIGINT', () => {
//   logger.info('Stopping cron job...');
//   job.stop();
//   process.exit();
// });
exports.default = cronJob;
//# sourceMappingURL=cornJobs.js.map