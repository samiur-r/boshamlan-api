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
exports.alertOnSlack = void 0;
const axios_1 = __importDefault(require("axios"));
const config_1 = __importDefault(require("../config"));
const logger_1 = __importDefault(require("./logger"));
const alertOnSlack = (channel, msg) => __awaiter(void 0, void 0, void 0, function* () {
    logger_1.default.info(`Alerting on slack: ${msg}`);
    const slackMsg = JSON.stringify({
        blocks: [
            {
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: msg,
                },
            },
        ],
    });
    try {
        yield (0, axios_1.default)({
            method: 'POST',
            url: channel === 'imp' ? config_1.default.slackWebHookImpUrl : config_1.default.slackWebHookNonImpUrl,
            data: slackMsg,
        });
    }
    catch (error) {
        logger_1.default.error(`${error.name}: ${error.message}`);
    }
});
exports.alertOnSlack = alertOnSlack;
//# sourceMappingURL=slackUtils.js.map