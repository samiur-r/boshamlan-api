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
const AdminController = __importStar(require("./controller"));
const router = express_1.default.Router();
router.post('/login', AdminController.login);
router.get('/logout', AdminController.logout);
router.post('/register', AuthMiddleware_1.isSuperAdminAuth, AdminController.register);
router.post('/filter-posts', AuthMiddleware_1.isAdminAuth, AdminController.filterPosts);
router.post('/filter-users', AdminController.filterUsers);
router.post('/filter-user', AuthMiddleware_1.isAdminAuth, AdminController.fetchUser);
router.post('/stick-post', AuthMiddleware_1.isAdminAuth, AdminController.stickPost);
router.delete('/delete-post', AuthMiddleware_1.isAdminAuth, AdminController.deletePost);
router.delete('/delete-post-permanent', AuthMiddleware_1.isAdminAuth, AdminController.deletePostPermanently);
router.post('/repost', AuthMiddleware_1.isAdminAuth, AdminController.rePost);
router.post('/get-logs', AuthMiddleware_1.isAdminAuth, AdminController.fetchLogs);
router.post('/update-credit', AuthMiddleware_1.isAdminAuth, AdminController.updateCredit);
router.post('/get-user-info', AuthMiddleware_1.isAdminAuth, AdminController.fetchUserWithAgentInfo);
router.put('/edit-user', AuthMiddleware_1.isAdminAuth, AdminController.editUser);
router.put('/edit-agent', AuthMiddleware_1.isAdminAuth, AdminController.editAgent);
router.post('/verify-user', AuthMiddleware_1.isAdminAuth, AdminController.verifyUser);
router.post('/get-transactions', AuthMiddleware_1.isAdminAuth, AdminController.fetchTransactions);
router.get('/dashboard', AuthMiddleware_1.isAdminAuth, AdminController.fetchDashboardInfo);
router.post('/get-test', AuthMiddleware_1.isAdminAuth, AdminController.fetchTestItems);
router.put('/block-status', AuthMiddleware_1.isAdminAuth, AdminController.updateUserBlockStatus);
router.put('/admin-comment', AuthMiddleware_1.isAdminAuth, AdminController.updateUserComment);
router.delete('/user-permanent', AuthMiddleware_1.isAdminAuth, AdminController.removeUserPermanently);
router.post('/restore', AuthMiddleware_1.isAdminAuth, AdminController.restore);
router.post('/test', AdminController.test);
exports.default = router;
//# sourceMappingURL=route.js.map