"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const server_sdk_1 = require("@vonage/server-sdk");
const index_1 = __importDefault(require("./index"));
// @ts-ignore
const vonage = new server_sdk_1.Vonage({
    apiKey: index_1.default.vonageApiKey,
    apiSecret: index_1.default.vonageApiSecret,
});
exports.default = vonage;
//# sourceMappingURL=vonage.js.map