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
exports.sendSms = void 0;
const vonage_1 = __importDefault(require("../config/vonage"));
const logger_1 = __importDefault(require("./logger"));
const sendSms = (phone, msg) => __awaiter(void 0, void 0, void 0, function* () {
    logger_1.default.info(`Sending sms to ${phone}: ${msg}`);
    const from = 'Boshamlan';
    const to = `+965${phone}`;
    const text = msg;
    yield vonage_1.default.sms.send({ to, from, text });
});
exports.sendSms = sendSms;
//# sourceMappingURL=smsUtils.js.map