"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const MorganMiddleware_1 = __importDefault(require("./middlewares/MorganMiddleware"));
const users_1 = __importDefault(require("./api/v1/users"));
const otps_1 = __importDefault(require("./api/v1/otps"));
const transactions_1 = __importDefault(require("./api/v1/transactions"));
const ErrorHandlingMiddleware_1 = __importDefault(require("./middlewares/ErrorHandlingMiddleware"));
const corsOption_1 = __importDefault(require("./config/corsOption"));
const config_1 = __importDefault(require("./config"));
const app = (0, express_1.default)();
app.use((0, cookie_parser_1.default)(config_1.default.cookieSecret));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cors_1.default)(corsOption_1.default));
app.use((0, helmet_1.default)());
app.use(MorganMiddleware_1.default);
app.use('/api/v1/user', users_1.default);
app.use('/api/v1/otp', otps_1.default);
app.use('/api/v1/transaction', transactions_1.default);
app.use(ErrorHandlingMiddleware_1.default);
exports.default = app;
//# sourceMappingURL=app.js.map