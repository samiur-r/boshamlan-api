"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.agentSchema = void 0;
const yup_1 = require("yup");
exports.agentSchema = (0, yup_1.object)({
    name: (0, yup_1.string)().required(),
    description: (0, yup_1.string)().nullable(),
    instagram: (0, yup_1.string)().nullable(),
    twitter: (0, yup_1.string)().nullable(),
    facebook: (0, yup_1.string)().nullable(),
    email: (0, yup_1.string)().email().nullable(),
    logo: (0, yup_1.mixed)().nullable(),
    website: (0, yup_1.string)().nullable(),
});
//# sourceMappingURL=validation.js.map