"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b, _c, _d, _e, _f, _g;
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const config = {
    nodeEnv: (_a = process.env.NODE_ENV) !== null && _a !== void 0 ? _a : 'development',
    port: (_b = process.env.PORT) !== null && _b !== void 0 ? _b : 5000,
    origin: (_c = process.env.DEV_ORIGIN) !== null && _c !== void 0 ? _c : 'http://localhost:3000',
    jwtSecret: (_d = process.env.JWT_SECRET) !== null && _d !== void 0 ? _d : 'majoron_boshamlan',
    cookieSecret: (_e = process.env.COOKIE_SECRET) !== null && _e !== void 0 ? _e : 'alpha_centauri',
    vonageApiKey: (_f = process.env.VONAGE_API_KEY) !== null && _f !== void 0 ? _f : '',
    vonageApiSecret: (_g = process.env.VONAGE_API_SECRET) !== null && _g !== void 0 ? _g : '',
    cookieOptions: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        signed: true,
        sameSite: 'strict',
        maxAge: 728 * 86400000, // 2 years
    },
    knetTermResourceKey: process.env.KNET_TERM_RESOURCE_KEY,
};
exports.default = config;
//# sourceMappingURL=index.js.map