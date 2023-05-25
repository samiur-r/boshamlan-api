"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hidePhoneNumber = (description) => {
    const regex = /\b(\d{8})\b/g;
    const replacedString = description.replace(regex, (match, number) => {
        return '*'.repeat(number.length);
    });
    return replacedString;
};
exports.default = hidePhoneNumber;
//# sourceMappingURL=hidePhoneNumber.js.map