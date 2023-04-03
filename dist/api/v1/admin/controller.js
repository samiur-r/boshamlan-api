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
exports.fetchDashboardInfo = exports.fetchTransactions = exports.verifyUser = exports.editAgent = exports.editUser = exports.fetchUserWithAgentInfo = exports.fetchUser = exports.updateCredit = exports.filterUsers = exports.fetchLogs = exports.deletePost = exports.stickPost = exports.filterPosts = exports.logout = exports.login = exports.register = void 0;
const passwordUtils_1 = require("../../../utils/passwordUtils");
const logger_1 = __importDefault(require("../../../utils/logger"));
const service_1 = require("./service");
const ErrorHandler_1 = __importDefault(require("../../../utils/ErrorHandler"));
const jwtUtils_1 = require("../../../utils/jwtUtils");
const config_1 = __importDefault(require("../../../config"));
const service_2 = require("../posts/service");
const service_3 = require("../users/service");
const service_4 = require("../user_logs/service");
const service_5 = require("../credits/service");
const service_6 = require("../transactions/service");
const service_7 = require("../agents/service");
const model_1 = require("../credits/model");
const model_2 = require("../agents/model");
const smsUtils_1 = require("../../../utils/smsUtils");
const register = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { phone, password, name } = req.body;
    try {
        const hashedPassword = yield (0, passwordUtils_1.hashPassword)(password);
        yield (0, service_1.saveAdmin)(phone, hashedPassword, name);
        return res.status(200).json({ success: 'New admin created successfully' });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }
    catch (error) {
        logger_1.default.error(`${error.name}: ${error.message}`);
        return next(error);
    }
});
exports.register = register;
const login = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { phone, password } = req.body;
    try {
        const admin = yield (0, service_1.findAdminByPhone)(phone);
        if (!admin)
            throw new ErrorHandler_1.default(403, 'Incorrect phone or password');
        const isValidPassword = yield (0, passwordUtils_1.verifyToken)(password, admin.password);
        if (!isValidPassword)
            throw new ErrorHandler_1.default(403, 'Incorrect phone or password');
        const adminPayload = {
            id: admin.id,
            phone: admin.phone,
            name: admin.name,
            is_super: admin.is_super,
            admin_status: true,
        };
        const token = yield (0, jwtUtils_1.signJwt)(adminPayload);
        // @ts-ignore
        res.cookie('token', token, config_1.default.cookieOptions);
        return res.status(200).json({ success: adminPayload });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }
    catch (error) {
        logger_1.default.error(`${error.name}: ${error.message}`);
        return next(error);
    }
});
exports.login = login;
const logout = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.clearCookie('token');
    return res.status(200).json({ success: 'Logged out successfully' });
});
exports.logout = logout;
const filterPosts = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { locationToFilter, categoryToFilter, propertyTypeToFilter, fromPriceToFilter, toPriceToFilter, fromCreationDateToFilter, toCreationDateToFilter, stickyStatusToFilter, userTypeToFilter, orderByToFilter, postStatusToFilter, userId, } = req.body;
    try {
        const posts = yield (0, service_2.filterPostsForAdmin)(locationToFilter, categoryToFilter, propertyTypeToFilter, fromPriceToFilter, toPriceToFilter, fromCreationDateToFilter, toCreationDateToFilter, stickyStatusToFilter, userTypeToFilter, orderByToFilter, postStatusToFilter, userId);
        return res.status(200).json({ posts });
    }
    catch (error) {
        logger_1.default.error(`${error.name}: ${error.message}`);
        return next(error);
    }
});
exports.filterPosts = filterPosts;
const stickPost = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { postId } = req.body;
    const user = res.locals.user.payload;
    try {
        const post = yield (0, service_2.findPostById)(parseInt(postId, 10));
        if (!post)
            throw new ErrorHandler_1.default(401, 'Post not found');
        if (post.is_sticky)
            throw new ErrorHandler_1.default(304, 'Post is already sticky');
        yield (0, service_2.updatePostStickyVal)(post, true);
        logger_1.default.info(`Post ${post.id} sticked by user ${user === null || user === void 0 ? void 0 : user.phone}`);
        return res.status(200).json({ success: 'Post is sticked successfully' });
    }
    catch (error) {
        logger_1.default.error(`${error.name}: ${error.message}`);
        logger_1.default.error(`Post ${postId} stick attempt by user ${user === null || user === void 0 ? void 0 : user.phone}} failed`);
        return next(error);
    }
});
exports.stickPost = stickPost;
const deletePost = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { postId, isArchive } = req.body;
    const userObj = res.locals.user.payload;
    try {
        if (!postId)
            throw new ErrorHandler_1.default(404, 'Post not found');
        let post;
        if (isArchive)
            post = yield (0, service_2.findArchivedPostById)(parseInt(postId, 10));
        else
            post = yield (0, service_2.findPostById)(parseInt(postId, 10));
        if (!post)
            throw new ErrorHandler_1.default(401, 'Post not found');
        const user = yield (0, service_3.findUserById)(post.user.id);
        if (!user)
            throw new ErrorHandler_1.default(500, 'Something went wrong');
        if (isArchive)
            yield (0, service_2.removeArchivedPost)(post.id, post);
        else
            yield (0, service_2.removePost)(post.id, post);
        post.media = [];
        yield (0, service_2.saveDeletedPost)(post, user);
        logger_1.default.info(`Post ${postId} deleted by user ${userObj.phone}`);
        return res.status(200).json({ success: 'Post deleted successfully' });
    }
    catch (error) {
        logger_1.default.error(`${error.name}: ${error.message}`);
        logger_1.default.error(`Post ${postId} delete attempt by user ${userObj.phone} failed`);
        return next(error);
    }
});
exports.deletePost = deletePost;
const fetchLogs = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { postId, user } = req.body;
    let logs = [];
    try {
        if (postId)
            logs = yield (0, service_4.fetchLogsByPostId)(postId);
        else if (user)
            logs = yield (0, service_4.fetchLogsByUser)(user);
        return res.status(200).json({ logs });
    }
    catch (error) {
        logger_1.default.error(`${error.name}: ${error.message}`);
        return next(error);
    }
});
exports.fetchLogs = fetchLogs;
// TODO: refactor the controller so that its non blocking
const filterUsers = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { statusToFilter, phoneToFilter, adminCommentToFilter, fromCreationDateToFilter, toCreationDateToFilter, orderByToFilter, } = req.body;
    try {
        let users = yield (0, service_3.filterUsersForAdmin)(statusToFilter, phoneToFilter, adminCommentToFilter, fromCreationDateToFilter, toCreationDateToFilter);
        // eslint-disable-next-line no-restricted-syntax
        for (const user of users) {
            user === null || user === void 0 ? true : delete user.password;
            const credits = yield (0, service_5.findCreditByUserId)(user.id);
            const transactions = yield (0, service_6.findTransactionsByUserId)(user.id);
            const payment = (0, service_1.getPaymentHistory)(transactions);
            const postHistory = yield (0, service_1.getPostHistory)(user.id);
            if (credits)
                user.credits = credits;
            else
                user.credits = { free: 0, regular: 0, sticky: 0, agent: 0 };
            if (user.is_agent) {
                const agent = yield (0, service_7.findAgentByUserId)(user.id);
                const subscription = agent
                    ? `${agent.created_at.toISOString().slice(0, 10)} - ${agent.expiry_date.toISOString().slice(0, 10)}`
                    : '-';
                user.subscription = subscription;
            }
            else
                user.subscription = '-';
            user.payment = payment;
            user.post = postHistory;
            user.registered = user.created_at.toISOString().slice(0, 10);
        }
        if (statusToFilter && statusToFilter === 'Has Regular Credits') {
            users = users.filter((user) => user.credits.regular > 0);
        }
        else if (statusToFilter && statusToFilter === 'Has Sticky Credits') {
            users = users.filter((user) => user.credits.sticky > 0);
        }
        else if (statusToFilter && statusToFilter === 'Has Agent Credits') {
            users = users.filter((user) => user.credits.agent > 0);
        }
        else if (statusToFilter && statusToFilter === 'Zero Free') {
            users = users.filter((user) => user.credits.free === 0);
        }
        if (orderByToFilter && orderByToFilter === 'Total Posts') {
            users.sort((a, b) => a.post.total > b.post.total);
        }
        else if (orderByToFilter && orderByToFilter === 'Active Posts') {
            users.sort((a, b) => a.post.active > b.post.active);
        }
        else if (orderByToFilter && orderByToFilter === 'Archived Posts') {
            users.sort((a, b) => a.post.archived > b.post.archived);
        }
        else if (orderByToFilter && orderByToFilter === 'Trashed Posts') {
            users.sort((a, b) => a.post.deleted > b.post.deleted);
        }
        else if (orderByToFilter && orderByToFilter === 'Registered') {
            users.sort((a, b) => {
                if (a.status === 'verified' && b.status === 'not_verified') {
                    return -1;
                }
                if (a.status === 'not_verified' && b.status === 'verified') {
                    return 1;
                }
                return 0;
            });
        }
        else if (orderByToFilter && orderByToFilter === 'Mobile') {
            users.sort((a, b) => {
                if (a.phone < b.phone) {
                    return -1;
                }
                if (a.phone > b.phone) {
                    return 1;
                }
                return 0;
            });
        }
        return res.status(200).json({ users });
    }
    catch (error) {
        logger_1.default.error(`${error.name}: ${error.message}`);
        return next(error);
    }
});
exports.filterUsers = filterUsers;
const fetchUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.body;
    try {
        const user = yield (0, service_3.findUserById)(userId);
        user === null || user === void 0 ? true : delete user.password;
        const credits = yield (0, service_5.findCreditByUserId)(user.id);
        const transactions = yield (0, service_6.findTransactionsByUserId)(user.id);
        const payment = (0, service_1.getPaymentHistory)(transactions);
        const postHistory = yield (0, service_1.getPostHistory)(user.id);
        if (credits)
            user.credits = credits;
        else
            user.credits = { free: 0, regular: 0, sticky: 0, agent: 0 };
        if (user.is_agent) {
            const agent = yield (0, service_7.findAgentByUserId)(user.id);
            const subscription = agent
                ? `${agent.created_at.toISOString().slice(0, 10)} - ${agent.expiry_date.toISOString().slice(0, 10)}`
                : '-';
            user.subscription = subscription;
        }
        else
            user.subscription = '-';
        user.payment = payment;
        user.post = postHistory;
        user.registered = user.created_at.toISOString().slice(0, 10);
        return res.status(200).json({ user });
    }
    catch (error) {
        logger_1.default.error(`${error.name}: ${error.message}`);
        return next(error);
    }
});
exports.fetchUser = fetchUser;
const updateCredit = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { creditAmount, creditType, userId } = req.body;
    try {
        const credit = yield (0, service_5.findCreditByUserId)(userId);
        if (!credit)
            throw new ErrorHandler_1.default(401, 'Credit record not found');
        yield model_1.Credit.save(Object.assign(Object.assign({}, credit), { [creditType]: creditAmount }));
        return res.status(200).json({ success: 'Credit updated successfully' });
    }
    catch (error) {
        logger_1.default.error(`${error.name}: ${error.message}`);
        return next(error);
    }
});
exports.updateCredit = updateCredit;
const fetchUserWithAgentInfo = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.body;
    try {
        const user = yield (0, service_3.findUserWithAgentInfo)(userId);
        if (!user)
            throw new ErrorHandler_1.default(401, 'User not found');
        return res.status(200).json({ user });
    }
    catch (error) {
        logger_1.default.error(`${error.name}: ${error.message}`);
        return next(error);
    }
});
exports.fetchUserWithAgentInfo = fetchUserWithAgentInfo;
const editUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { phone, adminComment, password } = req.body;
    try {
        const user = yield (0, service_3.findUserByPhone)(phone);
        if (!user)
            throw new ErrorHandler_1.default(401, 'User not found');
        yield (0, service_3.updateUser)(user, phone, adminComment, password);
        return res.status(200).json({ success: 'User updated successfully' });
    }
    catch (error) {
        logger_1.default.error(`${error.name}: ${error.message}`);
        return next(error);
    }
});
exports.editUser = editUser;
const editAgent = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { agentId, name, email, instagram, facebook, twitter, website, description } = req.body;
    try {
        if (!agentId || !name)
            throw new ErrorHandler_1.default(404, 'Invalid agent id or name');
        const agent = yield (0, service_7.findAgentById)(agentId);
        if (!agent)
            throw new ErrorHandler_1.default(401, 'Agent not found');
        const agentData = model_2.Agent.create(Object.assign(Object.assign({}, agent), { name,
            email,
            instagram,
            facebook,
            twitter,
            website,
            description }));
        yield model_2.Agent.save(agentData);
        return res.status(200).json({ success: 'Agent updated successfully' });
    }
    catch (error) {
        logger_1.default.error(`${error.name}: ${error.message}`);
        return next(error);
    }
});
exports.editAgent = editAgent;
const verifyUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.body;
    try {
        if (!userId)
            throw new ErrorHandler_1.default(404, 'Invalid agent id or name');
        const user = yield (0, service_3.findUserById)(userId);
        if (!user)
            throw new ErrorHandler_1.default(401, 'Agent not found');
        yield (0, service_3.updateUserStatus)(userId, 'verified');
        yield (0, service_5.initCredits)(user);
        yield (0, smsUtils_1.sendSms)(user.phone, 'Congratulations! you have been registered successfully');
        return res.status(200).json({ success: 'User verified successfully' });
    }
    catch (error) {
        logger_1.default.error(`${error.name}: ${error.message}`);
        return next(error);
    }
});
exports.verifyUser = verifyUser;
const fetchTransactions = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { statusToFilter, typeToFilter, fromCreationDateToFilter, toCreationDateToFilter, userId } = req.body;
    try {
        const transactions = yield (0, service_6.filterTransactionsForAdmin)(statusToFilter, typeToFilter, fromCreationDateToFilter, toCreationDateToFilter, userId);
        return res.status(200).json({ transactions });
    }
    catch (error) {
        logger_1.default.error(`${error.name}: ${error.message}`);
        return next(error);
    }
});
exports.fetchTransactions = fetchTransactions;
const fetchDashboardInfo = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userSummary = yield (0, service_1.getUserSummary)();
        const postSummary = yield (0, service_1.getPostSummary)();
        const transactionSummary = yield (0, service_1.getTransactionSummary)();
        const creditSummary = yield (0, service_1.geCreditsSummary)();
        return res.status(200).json({ userSummary, postSummary, transactionSummary, creditSummary });
    }
    catch (error) {
        logger_1.default.error(`${error.name}: ${error.message}`);
        return next(error);
    }
});
exports.fetchDashboardInfo = fetchDashboardInfo;
//# sourceMappingURL=controller.js.map