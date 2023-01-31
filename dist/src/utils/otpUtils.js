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
exports.sendSms = exports.generateOtp = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const vonage_1 = __importDefault(require("../config/vonage"));
const generateOtp = () => __awaiter(void 0, void 0, void 0, function* () {
    const otp = Math.floor(Math.random() * 9000 + 1000);
    const token = yield bcrypt_1.default.hash(otp.toString(), 10);
    const expirationTime = new Date(new Date().getTime() + 10 * 60000); // 10 minutes
    return { otp, token, expirationTime };
});
exports.generateOtp = generateOtp;
const sendSms = (phone, otp) => __awaiter(void 0, void 0, void 0, function* () {
    const from = 'Boshamlan';
    const to = `+880${phone}`;
    const text = `OTP: ${otp}. Valid for 10 minutes.`;
    yield vonage_1.default.sms.send({ to, from, text });
});
exports.sendSms = sendSms;
//# sourceMappingURL=otpUtils.js.map