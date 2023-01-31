"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = __importDefault(require("../utils/logger"));
const errorHandler = (error, _req, res, 
// eslint-disable-next-line @typescript-eslint/no-unused-vars
_next) => {
    if (error.status)
        res.status(error.status);
    else
        res.status(500);
    logger_1.default.error(`${error.message}`);
    return res.send(error.message);
};
exports.default = errorHandler;
//# sourceMappingURL=ErrorHandlingMiddleware.js.map