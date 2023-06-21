"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAuthorization = void 0;
const ErrorHandler_1 = __importDefault(require("./ErrorHandler"));
const checkAuthorization = (user, arg2) => {
    if (user && !user.admin_status && user.id !== arg2)
        throw new ErrorHandler_1.default(401, 'You are not authorized');
};
exports.checkAuthorization = checkAuthorization;
//# sourceMappingURL=checkAuthorization.js.map