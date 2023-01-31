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
exports.passwordSchema = exports.phoneSchema = void 0;
/* eslint-disable import/prefer-default-export */
const yup = __importStar(require("yup"));
exports.phoneSchema = yup
    .number()
    .typeError('يجب أن يكون الهاتف رقمًا')
    .required('الهاتف هو حقل مطلوب')
    .test('len', 'يجب أن يكون 8 أرقام', (val) => (val === null || val === void 0 ? void 0 : val.toString().length) === 10);
exports.passwordSchema = yup
    .string()
    .required('كلمة المرور هي حقل مطلوب')
    .min(3, 'يجب أن تتكون كلمة المرور من 3 أحرف على الأقل');
//# sourceMappingURL=validation.js.map