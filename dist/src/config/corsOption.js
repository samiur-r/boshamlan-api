"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const whitelist = ['https://www.yoursite.com', 'http://127.0.0.1:3000', 'http://localhost:3000'];
const corsOptions = {
    origin: whitelist,
    credentials: true,
    optionsSuccessStatus: 200,
};
exports.default = corsOptions;
//# sourceMappingURL=corsOption.js.map