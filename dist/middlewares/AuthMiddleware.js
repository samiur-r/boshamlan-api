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
exports.isSuperAdminAuth = exports.isAdminAuth = exports.isRequestAuth = exports.isUserAuth = void 0;
const jwtUtils_1 = require("../utils/jwtUtils");
const ErrorHandler_1 = __importDefault(require("../utils/ErrorHandler"));
const isUserAuth = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { signedCookies = {} } = req;
    const { token } = signedCookies;
    try {
        const user = yield (0, jwtUtils_1.verifyJwt)(token);
        res.locals.user = user;
        next();
    }
    catch (err) {
        next(new ErrorHandler_1.default(401, 'You are not authorized'));
    }
});
exports.isUserAuth = isUserAuth;
const isRequestAuth = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const authHeader = req.headers.authorization;
    const token = authHeader === null || authHeader === void 0 ? void 0 : authHeader.split(' ')[1];
    try {
        yield (0, jwtUtils_1.verifyJwt)(token);
        next();
    }
    catch (err) {
        next(new ErrorHandler_1.default(401, 'You are not authorized'));
    }
});
exports.isRequestAuth = isRequestAuth;
const isAdminAuth = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { signedCookies = {} } = req;
    const { token } = signedCookies;
    try {
        const user = yield (0, jwtUtils_1.verifyJwt)(token);
        res.locals.user = user;
        if (!((_a = user.payload) === null || _a === void 0 ? void 0 : _a.admin_status))
            throw new ErrorHandler_1.default(401, 'You are not authorized');
        next();
    }
    catch (err) {
        next(err);
    }
});
exports.isAdminAuth = isAdminAuth;
const isSuperAdminAuth = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { signedCookies = {} } = req;
    const { token } = signedCookies;
    try {
        const { payload } = yield (0, jwtUtils_1.verifyJwt)(token);
        if (!(payload === null || payload === void 0 ? void 0 : payload.admin_status) || !(payload === null || payload === void 0 ? void 0 : payload.is_super))
            throw new ErrorHandler_1.default(401, 'You are not authorized');
        next();
    }
    catch (err) {
        next(err);
    }
});
exports.isSuperAdminAuth = isSuperAdminAuth;
//# sourceMappingURL=AuthMiddleware.js.map