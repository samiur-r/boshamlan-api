"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.agentSchema = void 0;
const yup_1 = require("yup");
exports.agentSchema = (0, yup_1.object)({
    name: (0, yup_1.string)().required(),
    description: (0, yup_1.string)(),
    instagram: (0, yup_1.string)(),
    twitter: (0, yup_1.string)(),
    facebook: (0, yup_1.string)(),
    email: (0, yup_1.string)().email(),
    logo: (0, yup_1.mixed)(),
});
//# sourceMappingURL=validation.js.map