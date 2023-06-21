"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errorHandler = (error, _req, res, 
// eslint-disable-next-line @typescript-eslint/no-unused-vars
_next) => {
    if (error.status)
        res.status(error.status);
    else
        res.status(500);
    return res.send(error.message);
};
exports.default = errorHandler;
//# sourceMappingURL=ErrorHandlingMiddleware.js.map