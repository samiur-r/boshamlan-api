"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMediaFromCloudinary = exports.getAssetInfoFromCloudinary = exports.uploadMediaToCloudinary = void 0;
const streamifier_1 = __importDefault(require("streamifier"));
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
const ErrorHandler_1 = __importDefault(require("./ErrorHandler"));
const logger_1 = __importDefault(require("./logger"));
const uploadMediaToCloudinary = (file, preset) => __awaiter(void 0, void 0, void 0, function* () {
    const resourceType = 'auto';
    const options = {
        public_id: `${Date.now()}`,
        resource_type: resourceType,
        upload_preset: preset,
        use_filename: true,
        unique_filename: false,
        overwrite: true,
        transformation: [
            {
                width: 500,
                crop: 'scale',
            },
            { quality: 'auto' },
        ],
    };
    return new Promise((resolve, reject) => {
        const stream = cloudinary_1.default.uploader.upload_stream(options, (error, result) => {
            if (error) {
                reject(error);
            }
            else {
                resolve(result === null || result === void 0 ? void 0 : result.secure_url);
            }
        });
        streamifier_1.default.createReadStream(file.buffer).pipe(stream);
    });
});
exports.uploadMediaToCloudinary = uploadMediaToCloudinary;
const getAssetInfoFromCloudinary = (publicId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield cloudinary_1.default.api.resource(publicId);
        return result;
    }
    catch (error) {
        logger_1.default.error(error);
        return false;
    }
});
exports.getAssetInfoFromCloudinary = getAssetInfoFromCloudinary;
const getPublicId = (imageURL) => { var _a; return (_a = imageURL.split('/').pop()) === null || _a === void 0 ? void 0 : _a.split('.')[0]; };
const deleteMediaFromCloudinary = (imageURL, preset) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        const public_id = getPublicId(imageURL);
        if (!public_id)
            throw new ErrorHandler_1.default(500, 'Something went wrong');
        const pathSegments = imageURL.split('/');
        const resourceType = pathSegments[4];
        const result = yield cloudinary_1.default.uploader.destroy(`${preset}/${public_id}`, {
            invalidate: true,
            resource_type: resourceType,
        });
        return result;
    }
    catch (error) {
        logger_1.default.error(error);
        return false;
    }
});
exports.deleteMediaFromCloudinary = deleteMediaFromCloudinary;
//# sourceMappingURL=cloudinaryUtils.js.map