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
const service_3 = require("../credits/service");
const slackUtils_1 = require("../../../utils/slackUtils");
const smsUtils_1 = require("../../../utils/smsUtils");
const service_4 = require("../user_logs/service");
const jwtUtils_1 = require("../../../utils/jwtUtils");
const config_1 = __importDefault(require("../../../config"));
const doesUserHaveCredits_1 = __importDefault(require("../../../utils/doesUserHaveCredits"));
const verifyOtp = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const { userId, otpCode, nextOperation } = req.body;
    try {
        if (nextOperation) {
            const user = yield (0, service_2.findUserById)(userId);
            const slackMsg = `Entered reset password OTP\n\n ${(user === null || user === void 0 ? void 0 : user.phone) ? `<https://wa.me/965${user === null || user === void 0 ? void 0 : user.phone}|${user === null || user === void 0 ? void 0 : user.phone}>` : ''} - ${(user === null || user === void 0 ? void 0 : user.admin_comment) ? user.admin_comment : ''}`;
            yield (0, slackUtils_1.alertOnSlack)('imp', slackMsg);
        }
        const otpObj = yield (0, service_1.findOtpByUserId)(userId);
        if (!otpObj)
            throw new ErrorHandler_1.default(500, 'Otp not found. Please try again with new otp');
        if (new Date() > otpObj.expiration_time)
            throw new ErrorHandler_1.default(403, 'Otp has expired. Please try again with a new otp');
        if (otpObj.verified)
            throw new ErrorHandler_1.default(403, 'Otp has already been used. Please try again with a new otp');
        const isValid = yield (0, passwordUtils_1.verifyToken)(otpCode.toString(), otpObj.token);
        if (!isValid)
            throw new ErrorHandler_1.default(403, 'Incorrect otp');
        yield (0, service_1.updateOtpStatus)(otpObj.id, true);
        if (!nextOperation) {
            yield (0, service_2.updateUserStatus)(userId, 'verified');
            const user = yield (0, service_2.findUserById)(userId);
            if (user) {
                yield (0, service_3.initCredits)(user);
                yield (0, smsUtils_1.sendSms)(user.phone, 'Congratulations! you have been registered successfully');
            }
            logger_1.default.info(`User ${user === null || user === void 0 ? void 0 : user.phone} has been verified`);
            yield (0, service_4.saveUserLog)([
                {
                    post_id: undefined,
                    transaction: undefined,
                    user: user === null || user === void 0 ? void 0 : user.phone,
                    activity: `User ${user === null || user === void 0 ? void 0 : user.phone} has been verified`,
                },
            ]);
            const credits = yield (0, service_3.findCreditByUserId)(user.id);
            const userHasCredits = credits ? (0, doesUserHaveCredits_1.default)(credits) : false;
            const userPayload = {
                id: user.id,
                phone: user.phone,
                is_agent: user.is_agent,
                status: user.status,
                userHasCredits,
            };
            const token = yield (0, jwtUtils_1.signJwt)(userPayload);
            // @ts-ignore
            res.cookie('token', token, config_1.default.cookieOptions);
            return res.status(200).json({ success: userPayload });
        }
        logger_1.default.info(`User ${(_a = otpObj.user) === null || _a === void 0 ? void 0 : _a.phone} verified OTP`);
        yield (0, service_4.saveUserLog)([
            {
                post_id: undefined,
                transaction: undefined,
                user: (_b = otpObj.user) === null || _b === void 0 ? void 0 : _b.phone,
                activity: `User ${(_c = otpObj.user) === null || _c === void 0 ? void 0 : _c.phone} verified OTP`,
            },
        ]);
        return res.status(200).json({ success: 'Otp verified successfully' });
    }
    catch (error) {
        logger_1.default.error(`${error.name}: ${error.message}`);
        logger_1.default.error(`Verification of OTP by User ${userId} failed`);
        yield (0, service_4.saveUserLog)([
            {
                post_id: undefined,
                transaction: undefined,
                user: userId,
                activity: `Verification of OTP by User ${userId} failed`,
            },
        ]);
        return next(error);
    }
});
exports.verifyOtp = verifyOtp;
const resendOtp = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, type } = req.body;
    try {
        const user = yield (0, service_2.findUserById)(userId);
        if (!user)
            throw new ErrorHandler_1.default(500, 'Unable to send otp. Please contact support');
        yield (0, service_1.sendOtpVerificationSms)(user.phone, type, user);
        logger_1.default.info(`Otp sent to user: ${user === null || user === void 0 ? void 0 : user.phone}`);
        yield (0, service_4.saveUserLog)([
            {
                post_id: undefined,
                transaction: undefined,
                user: user === null || user === void 0 ? void 0 : user.phone,
                activity: `Otp sent to user: ${user === null || user === void 0 ? void 0 : user.phone}`,
            },
        ]);
        return res.status(200).json({ success: 'New otp sent to your phone' });
    }
    catch (error) {
        logger_1.default.error(`${error.name}: ${error.message}`);
        if (error.message === 'All SMS messages failed to send') {
            error.message = 'Failed to send otp';
        }
        logger_1.default.error(`Otp failed to sent to user: ${userId}`);
        yield (0, service_4.saveUserLog)([
            {
                post_id: undefined,
                transaction: undefined,
                user: userId,
                activity: `Otp failed to sent to user: ${userId}`,
            },
        ]);
        return next(error);
    }
});
exports.resendOtp = resendOtp;
//# sourceMappingURL=controller.js.map