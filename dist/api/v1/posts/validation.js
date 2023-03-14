"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postSchema = void 0;
const yup_1 = require("yup");
exports.postSchema = (0, yup_1.object)({
    title: (0, yup_1.string)(),
    cityId: (0, yup_1.number)().required(),
    cityTitle: (0, yup_1.string)().required(),
    stateId: (0, yup_1.number)().required(),
    stateTitle: (0, yup_1.string)().required(),
    propertyId: (0, yup_1.number)().required(),
    propertyTitle: (0, yup_1.string)().required(),
    categoryId: (0, yup_1.number)().required(),
    categoryTitle: (0, yup_1.string)().required(),
    price: (0, yup_1.number)(),
    description: (0, yup_1.string)().required(),
    media: (0, yup_1.mixed)(),
});
//# sourceMappingURL=validation.js.map