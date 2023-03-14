"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transactionUpdateStatusSchema = exports.transactionUpdateSchema = exports.transactionSchema = void 0;
const yup = __importStar(require("yup"));
const transactionSchema = yup.object().shape({
    trackId: yup.number().required(),
    packageId: yup.number().required(),
    amount: yup.number().required(),
    packageTitle: yup.string().required(),
    status: yup.string().required(),
});
exports.transactionSchema = transactionSchema;
const transactionUpdateSchema = yup.object().shape({
    trackId: yup.number().required(),
    referenceId: yup.number().required(),
    tranId: yup.number().required(),
    status: yup.string().required(),
});
exports.transactionUpdateSchema = transactionUpdateSchema;
const transactionUpdateStatusSchema = yup.object().shape({
    trackId: yup.number().required(),
    status: yup.string().required(),
});
exports.transactionUpdateStatusSchema = transactionUpdateStatusSchema;
//# sourceMappingURL=validation.js.map