"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hidePhoneNumber = (description) => {
    const pattern = /[\d\u0660-\u0669\u06F0-\u06F9]{8}/g;
    return description.replace(pattern, '********');
};
exports.default = hidePhoneNumber;
//# sourceMappingURL=hidePhoneNumber.js.map