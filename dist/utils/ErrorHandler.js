"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ErrorHandler extends Error {
    constructor(status, message) {
        super(message);
        this.status = 500;
        this.status = status;
        Object.setPrototypeOf(this, ErrorHandler.prototype);
    }
}
exports.default = ErrorHandler;
//# sourceMappingURL=ErrorHandler.js.map