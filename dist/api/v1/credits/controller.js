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
exports.fetchStickyCredits = void 0;
const logger_1 = __importDefault(require("../../../utils/logger"));
const service_1 = require("./service");
const fetchStickyCredits = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = res.locals.user.payload;
    try {
        const stickyCredits = yield (0, service_1.findStickyCredits)(user.id);
        return res.status(200).json({ success: stickyCredits === null || stickyCredits === void 0 ? void 0 : stickyCredits.sticky });
    }
    catch (error) {
        logger_1.default.error(`${error.name}: ${error.message}`);
        return next(error);
    }
});
exports.fetchStickyCredits = fetchStickyCredits;
//# sourceMappingURL=controller.js.map