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
exports.resetPassword = exports.doesUserExists = exports.register = exports.logout = exports.login = void 0;
const ErrorHandler_1 = __importDefault(require("../../../utils/ErrorHandler"));
const passwordUtils_1 = require("../../../utils/passwordUtils");
const config_1 = __importDefault(require("../../../config"));
const service_1 = require("./service");
const service_2 = require("../otps/service");
const logger_1 = __importDefault(require("../../../utils/logger"));
const validation_1 = require("./validation");
const jwtUtils_1 = require("../../../utils/jwtUtils");
const slackUtils_1 = require("../../../utils/slackUtils");
const smsUtils_1 = require("../../../utils/smsUtils");
const service_3 = require("../user_logs/service");
const login = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { phone, password } = req.body;
    try {
        yield validation_1.phoneSchema.validate(phone, { abortEarly: false });
        yield validation_1.passwordSchema.validate(password, { abortEarly: false });
        const user = yield (0, service_1.findUserByPhone)(phone);
        if (!user)
            throw new ErrorHandler_1.default(403, 'Incorrect phone or password');
        if (user && user.status === 'not_verified')
            return res.status(200).json({ nextOperation: 'verify phone', userId: user.id });
        const isValidPassword = yield (0, passwordUtils_1.verifyToken)(password, user.password);
        if (!isValidPassword)
            throw new ErrorHandler_1.default(403, 'Incorrect phone or password');
        const userPayload = {
            id: user.id,
            phone: user.phone,
            is_admin: user.is_admin,
            is_agent: user.is_agent,
            status: user.status,
        };
        const token = yield (0, jwtUtils_1.signJwt)(userPayload);
        logger_1.default.info(`User: ${user === null || user === void 0 ? void 0 : user.phone} logged in successfully`);
        yield (0, service_3.saveUserLog)([
            { post_id: undefined, transaction: undefined, user: user.phone, activity: 'Logged in successfully' },
        ]);
        // @ts-ignore
        res.cookie('token', token, config_1.default.cookieOptions);
        return res.status(200).json({ success: userPayload }); // Logged in successfully
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }
    catch (error) {
        logger_1.default.error(`${error.name}: ${error.message}`);
        logger_1.default.error(`User: ${phone} logged in attempt failed`);
        yield (0, service_3.saveUserLog)([
            { post_id: undefined, transaction: undefined, user: phone, activity: 'Logged in attempt failed' },
        ]);
        if (error.name === 'ValidationError') {
            error.message = 'Invalid payload passed';
        }
        const slackMsg = `Failed login attempt\n\n ${phone ? `User: <https://wa.me/965${phone}|${phone}>` : ''}`;
        yield (0, slackUtils_1.alertOnSlack)('non-imp', slackMsg);
        return next(error);
    }
});
exports.login = login;
const register = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { phone, password } = req.body;
    try {
        yield validation_1.phoneSchema.validate(phone, { abortEarly: false });
        yield validation_1.passwordSchema.validate(password, { abortEarly: false });
        const user = yield (0, service_1.findUserByPhone)(phone);
        if (user && user.status !== 'not_verified')
            throw new ErrorHandler_1.default(409, 'User already exists');
        if (user && user.status === 'not_verified')
            return res.status(200).json({ nextOperation: 'verify mobile', userId: user.id });
        const hashedPassword = yield (0, passwordUtils_1.hashPassword)(password);
        const userObj = yield (0, service_1.saveUser)(phone, hashedPassword, 'not_verified');
        yield (0, service_2.sendOtpVerificationSms)(phone, 'registration', userObj);
        logger_1.default.info(`Registration attempt by user ${phone}. Otp sent `);
        yield (0, service_3.saveUserLog)([
            { post_id: undefined, transaction: undefined, user: phone, activity: 'Registration attempt. Otp sent' },
        ]);
        return res.status(200).json({ nextOperation: true, userId: userObj === null || userObj === void 0 ? void 0 : userObj.id });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }
    catch (error) {
        logger_1.default.error(`${error.name}: ${error.message}`);
        if (error.name === 'ValidationError') {
            error.message = 'Invalid payload passed';
            const slackMsg = `Invalid user payload\n\n ${phone ? `User: <https://wa.me/965${phone}|${phone}>` : ''}`;
            yield (0, slackUtils_1.alertOnSlack)('non-imp', slackMsg);
            return next(error);
        }
        if (error.message === 'All SMS messages failed to send') {
            error.message = 'Failed to send otp';
        }
        logger_1.default.error(`Registration attempt failed by user ${phone}`);
        yield (0, service_3.saveUserLog)([
            { post_id: undefined, transaction: undefined, user: phone, activity: 'Registration attempt failed' },
        ]);
        return next(error);
    }
});
exports.register = register;
const logout = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.clearCookie('token');
    return res.status(200).json({ success: 'Logged out successfully' });
});
exports.logout = logout;
const doesUserExists = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { phone } = req.body;
    try {
        yield validation_1.phoneSchema.validate(phone, { abortEarly: false });
        const user = yield (0, service_1.findUserByPhone)(phone);
        if (!user)
            throw new ErrorHandler_1.default(404, 'No user with this phone is found. Please register');
        return res.status(200).json({ userId: user.id });
    }
    catch (error) {
        logger_1.default.error(`${error.name}: ${error.message}`);
        return next(error);
    }
});
exports.doesUserExists = doesUserExists;
const resetPassword = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { phone, password } = req.body;
    try {
        yield validation_1.phoneSchema.validate(phone, { abortEarly: false });
        yield validation_1.passwordSchema.validate(password, { abortEarly: false });
        const user = yield (0, service_1.findUserByPhone)(phone);
        if (!user)
            throw new ErrorHandler_1.default(404, 'No user with this phone is found. Please register');
        yield (0, service_1.updateUserPassword)(user, password);
        logger_1.default.info(`Password reset attempt by user ${phone} successful`);
        yield (0, service_3.saveUserLog)([
            { post_id: undefined, transaction: undefined, user: phone, activity: 'Password reset attempt successful' },
        ]);
        const slackMsg = `Password reset successfully\n\n ${(user === null || user === void 0 ? void 0 : user.phone) ? `User: <https://wa.me/965${user === null || user === void 0 ? void 0 : user.phone}|${user === null || user === void 0 ? void 0 : user.phone}>` : ''}`;
        yield (0, slackUtils_1.alertOnSlack)('imp', slackMsg);
        yield (0, smsUtils_1.sendSms)(user.phone, 'Password reset successfully');
        return res.status(200).json({ success: 'Password updated successfully' });
    }
    catch (error) {
        logger_1.default.error(`${error.name}: ${error.message}`);
        logger_1.default.error(`Password reset attempt by user ${phone} failed`);
        yield (0, service_3.saveUserLog)([
            { post_id: undefined, transaction: undefined, user: phone, activity: 'Password reset attempt failed' },
        ]);
        return next(error);
    }
});
exports.resetPassword = resetPassword;
//# sourceMappingURL=controller.js.map