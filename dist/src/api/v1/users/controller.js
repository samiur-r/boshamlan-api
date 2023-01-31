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
const login = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { phone, password } = req.body;
    try {
        yield validation_1.phoneSchema.validate(phone, { abortEarly: false });
        yield validation_1.passwordSchema.validate(password, { abortEarly: false });
        const user = yield (0, service_1.findUserByPhone)(phone);
        if (!user)
            throw new ErrorHandler_1.default(403, 'رقم الهاتف أو كلمة المرور غير صحيحين'); // Incorrect phone or password'
        if (user && user.status === 'not_verified')
            return res.status(200).json({ nextOperation: 'verify phone', userId: user.id });
        const isValidPassword = yield (0, passwordUtils_1.verifyToken)(password, user.password);
        if (!isValidPassword)
            throw new ErrorHandler_1.default(403, 'رقم الهاتف أو كلمة المرور غير صحيحين'); // Incorrect phone or password'
        const userPayload = {
            id: user.id,
            phone: user.phone,
            is_admin: user.is_admin,
            is_agent: user.is_agent,
            status: user.status,
        };
        const token = yield (0, jwtUtils_1.signJwt)(userPayload);
        // @ts-ignore
        res.cookie('token', token, config_1.default.cookieOptions);
        return res.status(200).json({ success: userPayload }); // Logged in successfully
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }
    catch (err) {
        return next(err);
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
            throw new ErrorHandler_1.default(409, 'المستخدم موجود اصلا'); // User already exists
        if (user && user.status === 'not_verified')
            return res.status(200).json({ nextOperation: 'verify mobile', userId: user.id });
        const hashedPassword = yield (0, passwordUtils_1.hashPassword)(password);
        const userObj = yield (0, service_1.saveUser)(phone, hashedPassword, 'not_verified');
        yield (0, service_2.sendOtpVerificationSms)(phone, 'registration', userObj);
        return res.status(200).json({ nextOperation: 'verify mobile', userId: userObj === null || userObj === void 0 ? void 0 : userObj.id });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }
    catch (error) {
        if (error.name === 'QueryFailedError') {
            logger_1.default.error(`${error.name}: ${error.message}`);
            error.message = 'الطلب فشل'; // Request failed
        }
        if (error.message === 'All SMS messages failed to send') {
            logger_1.default.error(`MessageSendAllFailure: ${JSON.stringify(error)}`);
            error.status = 500;
            error.message = 'فشل إرسال otp'; // Failed to send otp
        }
        return next(error);
    }
});
exports.register = register;
const logout = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.clearCookie('token');
    return res.status(200).json({ success: 'تم تسجيل الخروج بنجاح' }); // Logged out successfully
});
exports.logout = logout;
const doesUserExists = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { phone } = req.body;
    try {
        yield validation_1.phoneSchema.validate(phone, { abortEarly: false });
        const user = yield (0, service_1.findUserByPhone)(phone);
        if (!user)
            throw new ErrorHandler_1.default(404, 'لم يتم العثور على مستخدم بهذا الهاتف. الرجاء التسجيل'); // No user with this phone is found. Please register
        return res.status(200).json({ userId: user.id });
    }
    catch (err) {
        return next(err);
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
            throw new ErrorHandler_1.default(404, 'لم يتم العثور على مستخدم بهذا الهاتف. الرجاء التسجيل'); // No user with this phone is found. Please register
        const hashedPassword = yield (0, passwordUtils_1.hashPassword)(password);
        yield (0, service_1.updateUserPassword)(user, hashedPassword);
        return res.status(200).json({ success: 'تم تحديث كلمة السر بنجاح' }); // Password updated successfully
    }
    catch (err) {
        return next(err);
    }
});
exports.resetPassword = resetPassword;
//# sourceMappingURL=controller.js.map