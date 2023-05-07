"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hasCredits = (credits) => {
    const propertiesToCheck = ['free', 'regular', 'sticky', 'agent'];
    // eslint-disable-next-line security/detect-object-injection
    return propertiesToCheck.some((key) => credits[key] > 0);
};
exports.default = hasCredits;
//# sourceMappingURL=doesUserHaveCredits.js.map