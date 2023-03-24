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
exports.optimizeImage = void 0;
const sharp_1 = __importDefault(require("sharp"));
const logger_1 = __importDefault(require("./logger"));
const optimizeImage = (inputBase64) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Convert the Base64 string to a Buffer
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const inputBuffer = Buffer.from(inputBase64.split(';base64,').pop(), 'base64');
        // Use Sharp to get the image's metadata
        const metadata = yield (0, sharp_1.default)(inputBuffer).metadata();
        // If the image is smaller than 800 pixels, don't resize it
        const width = metadata.width || 0;
        const height = metadata.height || 0;
        const resizeWidth = Math.min(width, 800);
        const resizeHeight = Math.ceil(height * (resizeWidth / width));
        // Use Sharp to optimize the image
        const outputBuffer = yield (0, sharp_1.default)(inputBuffer)
            .resize(resizeWidth, resizeHeight) // resize the image to 800 pixels wide
            .jpeg({ quality: 80 }) // compress the image to 80% quality JPEG
            .toBuffer();
        // Base64 string of the optimized image
        const outputBase64 = `data:image/jpeg;base64,${outputBuffer.toString('base64')}`;
        return outputBase64;
    }
    catch (err) {
        logger_1.default.error(err);
        return inputBase64;
    }
});
exports.optimizeImage = optimizeImage;
//# sourceMappingURL=optimizeMediaUtils.js.map