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
exports.resendOtp = exports.verifyOtp = void 0;
const service_1 = require("./service");
const ErrorHandler_1 = __importDefault(require("../../../utils/ErrorHandler"));
const passwordUtils_1 = require("../../../utils/passwordUtils");
const service_2 = require("../users/service");
const logger_1 = __importDefault(require("../../../utils/logger"));
const verifyOtp = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, otpCode, nextOperation } = req.body;
    try {
        const otpObj = yield (0, service_1.findOtpByUserId)(userId);
        if (!otpObj)
            throw new ErrorHandler_1.default(500, 'OTP غير موجود. يرجى المحاولة مرة أخرى مع otp الجديد'); // Otp not found. Please try again with new otp
        if (new Date() > otpObj.expiration_time)
            throw new ErrorHandler_1.default(403, 'انتهت صلاحية Otp. يرجى المحاولة مرة أخرى مع otp جديد'); // Otp has expired. Please try again with a new otp
        if (otpObj.verified)
            throw new ErrorHandler_1.default(403, 'تم استخدام OTP بالفعل. يرجى المحاولة مرة أخرى مع otp جديد'); // Otp has already been used. Please try again with a new otp
        const isValid = yield (0, passwordUtils_1.verifyToken)(otpCode.toString(), otpObj.token);
        if (!isValid)
            throw new ErrorHandler_1.default(403, 'otp غير صحيح'); // Incorrect otp
        yield (0, service_1.updateOtpStatus)(otpObj.id, true);
        if (!nextOperation) {
            yield (0, service_2.updateUserStatus)(userId, 'verified');
            return res.status(200).json({ success: 'تم التحقق من الهاتف بنجاح' }); // Phone verified successfully
        }
        return res.status(200).json({ success: 'تم التحقق من OTP بنجاح' }); // Otp verified successfully
    }
    catch (error) {
        return next(error);
    }
});
exports.verifyOtp = verifyOtp;
const resendOtp = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, type } = req.body;
    try {
        const user = yield (0, service_2.findUserById)(userId);
        if (!user)
            throw new ErrorHandler_1.default(500, 'تعذر إرسال otp. يرجى الاتصال بالدعم'); // Unable to send otp. Please contact support
        yield (0, service_1.sendOtpVerificationSms)(user.phone, type, user);
        return res.status(200).json({ success: 'تم إرسال otp الجديد إلى هاتفك' }); // New otp sent to your phone
    }
    catch (error) {
        if (error.name === 'QueryFailedError') {
            logger_1.default.error(`${error.name}: ${error.message}`);
            error.message = 'Request failed';
        }
        if (error.message === 'All SMS messages failed to send') {
            logger_1.default.error(`MessageSendAllFailure: ${JSON.stringify(error)}`);
            error.status = 500;
            error.message = 'فشل إرسال otp'; // Failed to send otp
        }
        return next(error);
    }
});
exports.resendOtp = resendOtp;
//# sourceMappingURL=controller.js.map