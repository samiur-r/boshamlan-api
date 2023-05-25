"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const config_1 = __importDefault(require("./config"));
const logger_1 = __importDefault(require("./utils/logger"));
const db_1 = __importDefault(require("./db"));
const cornJobs_1 = require("./utils/cornJobs");
db_1.default.initialize()
    .then(() => {
    logger_1.default.info('Connected to database');
    cornJobs_1.cronJobPerMonth.start();
    cornJobs_1.cronJobPerHour.start();
    cornJobs_1.cronJobPerFiveMins.start();
    const server = app_1.default.listen(config_1.default.port, () => {
        logger_1.default.info(`🚀 Listening on ${config_1.default.port} with NODE_ENV=${config_1.default.nodeEnv} 🚀`);
    });
    // initializeSocketIO(server);
})
    .catch((error) => logger_1.default.error(`Failed to connect to database ${error}`));
//# sourceMappingURL=server.js.map