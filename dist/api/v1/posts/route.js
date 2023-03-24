"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const AuthMiddleware_1 = require("../../../middlewares/AuthMiddleware");
const PostController = __importStar(require("./controller"));
const router = express_1.default.Router();
router.get('/get-many', PostController.fetchMany);
router.get('/edit/:id', AuthMiddleware_1.isUserAuth, PostController.fetchOne);
router.get('/:id', PostController.fetchOne);
router.post('/', AuthMiddleware_1.isUserAuth, PostController.insert);
router.post('/get-many', AuthMiddleware_1.isUserAuth, PostController.fetchMany);
router.post('/archive/get-many', AuthMiddleware_1.isUserAuth, PostController.fetchManyArchive);
router.post('/increment-post-view', PostController.increasePostCount);
router.put('/', AuthMiddleware_1.isUserAuth, PostController.update);
router.delete('/', AuthMiddleware_1.isUserAuth, PostController.deletePost);
router.post('/temp', AuthMiddleware_1.isUserAuth, PostController.insert);
router.post('/stick', AuthMiddleware_1.isUserAuth, PostController.updatePostToStick);
router.post('/repost', AuthMiddleware_1.isUserAuth, PostController.rePost);
exports.default = router;
//# sourceMappingURL=route.js.map