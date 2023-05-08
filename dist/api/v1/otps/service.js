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
exports.updateOtpStatus = exports.findOtpByUserId = exports.removeOtp = exports.findOtpById = exports.sendOtpVerificationSms = void 0;
const otpUtils_1 = require("../../../utils/otpUtils");
const slackUtils_1 = require("../../../utils/slackUtils");
const model_1 = require("./model");
const findOtpById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const otp = yield model_1.Otp.findOneBy({ id });
    return otp;
});
exports.findOtpById = findOtpById;
const findOtpByUserId = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const otp = yield model_1.Otp.findOne({ where: { user: { id: userId } } });
    return otp;
});
exports.findOtpByUserId = findOtpByUserId;
const removeOtp = (id) => __awaiter(void 0, void 0, void 0, function* () {
    yield model_1.Otp.delete(id);
});
exports.removeOtp = removeOtp;
const saveOtp = (token, expirationTime, type, user) => __awaiter(void 0, void 0, void 0, function* () {
    const otpData = model_1.Otp.create({
        token,
        expiration_time: expirationTime,
        type,
        user,
    });
    yield model_1.Otp.save(otpData);
});
const updateOtpStatus = (id, status) => __awaiter(void 0, void 0, void 0, function* () {
    const otpObj = yield model_1.Otp.findOneBy({ id });
    const otp = yield model_1.Otp.save(Object.assign(Object.assign({}, otpObj), { verified: status }));
    return otp;
});
exports.updateOtpStatus = updateOtpStatus;
const sendOtpVerificationSms = (phone, type, user) => __awaiter(void 0, void 0, void 0, function* () {
    const { otp, token, expirationTime } = yield (0, otpUtils_1.generateOtp)();
    yield (0, otpUtils_1.sendSmsOtp)(phone, otp);
    if (type === 'password-reset') {
        const slackMsg = `Password reset attempt\n\n ${phone ? `<https://wa.me/965${phone}|${phone}>` : ''} - ${user.admin_comment ? user.admin_comment : ''}`;
        yield (0, slackUtils_1.alertOnSlack)('imp', slackMsg);
    }
    const otpObj = yield findOtpByUserId(user.id);
    if (otpObj)
        yield removeOtp(otpObj.id);
    yield saveOtp(token, expirationTime, type, user);
});
exports.sendOtpVerificationSms = sendOtpVerificationSms;
//# sourceMappingURL=service.js.map