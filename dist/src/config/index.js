"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b, _c, _d, _e, _f;
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const config = {
    nodeEnv: (_a = process.env.NODE_ENV) !== null && _a !== void 0 ? _a : 'development',
    port: (_b = process.env.PORT) !== null && _b !== void 0 ? _b : 5000,
    jwtSecret: (_c = process.env.JWT_SECRET) !== null && _c !== void 0 ? _c : 'majoron_boshamlan',
    cookieSecret: (_d = process.env.COOKIE_SECRET) !== null && _d !== void 0 ? _d : 'alpha_centauri',
    vonageApiKey: (_e = process.env.VONAGE_API_KEY) !== null && _e !== void 0 ? _e : '',
    vonageApiSecret: (_f = process.env.VONAGE_API_SECRET) !== null && _f !== void 0 ? _f : '',
    cookieOptions: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        signed: true,
        sameSite: 'strict',
        maxAge: 728 * 86400000, // 2 years
    },
};
exports.default = config;
//# sourceMappingURL=index.js.map