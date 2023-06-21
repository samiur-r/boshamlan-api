"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
// const storage = multer.diskStorage({
//   destination(req: any, _file: any, cb: (arg0: null, arg1: string) => void) {
//     const pathName = '../boshamlan-frontend/public/images/';
//     let dir = '';
//     const endpoint = req.originalUrl.substr(8, req.originalUrl.length);
//     if (endpoint === 'agent') dir = 'agents/';
//     else if (endpoint === 'post' || endpoint === 'post/temp') dir = 'posts/';
//     cb(null, `${pathName}${dir}`);
//   },
//   filename(req: any, file: { fieldname: any; originalname: any }, cb: (arg0: null, arg1: string) => void) {
//     let endpoint = req.originalUrl.substr(8, req.originalUrl.length);
//     if (endpoint === 'post/temp') endpoint = 'post';
//     cb(null, `${endpoint}s-${Date.now()}${path.extname(file.originalname)}`);
//   },
// });
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({ storage });
exports.default = upload;
//# sourceMappingURL=FileUploadMiddleware.js.map