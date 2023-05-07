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
exports.updateTransactionStatus = exports.restore = exports.removeUserPermanently = exports.updateUserComment = exports.rePost = exports.deletePostPermanently = exports.updateUserBlockStatus = exports.fetchDashboardInfo = exports.fetchTransactions = exports.verifyUser = exports.editAgent = exports.editUser = exports.fetchUserWithAgentInfo = exports.fetchUser = exports.updateUserCredit = exports.filterUsers = exports.fetchLogs = exports.deletePost = exports.stickPost = exports.filterPosts = exports.logout = exports.login = exports.register = exports.test = void 0;
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
const model_3 = require("../users/model");
const DeletedPost_1 = require("../posts/models/DeletedPost");
const Post_1 = require("../posts/models/Post");
const ArchivePost_1 = require("../posts/models/ArchivePost");
const service_8 = require("../locations/service");
const timestampUtls_1 = require("../../../utils/timestampUtls");
const model_4 = require("../transactions/model");
const model_5 = require("../otps/model");
const slackUtils_1 = require("../../../utils/slackUtils");
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
    const { locationToFilter, categoryToFilter, propertyTypeToFilter, fromPriceToFilter, toPriceToFilter, fromCreationDateToFilter, toCreationDateToFilter, fromPublicDateToFilter, toPublicDateToFilter, stickyStatusToFilter, userTypeToFilter, orderByToFilter, postStatusToFilter, userId, offset, } = req.body;
    try {
        const { posts, totalPages, totalResults } = yield (0, service_2.filterPostsForAdmin)(locationToFilter, categoryToFilter, propertyTypeToFilter, fromPriceToFilter, toPriceToFilter, fromCreationDateToFilter, toCreationDateToFilter, fromPublicDateToFilter, toPublicDateToFilter, stickyStatusToFilter, userTypeToFilter, orderByToFilter, postStatusToFilter, userId, offset);
        return res.status(200).json({ posts, totalPages, totalResults });
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
        const slackMsg = `Post ${post.id} by user: <https://wa.me/965${post === null || post === void 0 ? void 0 : post.user.phone}|${post === null || post === void 0 ? void 0 : post.user.phone}> is sticked`;
        yield (0, slackUtils_1.alertOnSlack)('imp', slackMsg);
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
    const { postId } = req.body;
    const userObj = res.locals.user.payload;
    let isArchive = false;
    try {
        if (!postId)
            throw new ErrorHandler_1.default(404, 'Post not found');
        let post;
        post = yield (0, service_2.findPostById)(parseInt(postId, 10));
        if (!post) {
            post = yield (0, service_2.findArchivedPostById)(parseInt(postId, 10));
            isArchive = true;
        }
        if (!post)
            throw new ErrorHandler_1.default(401, 'Post not found');
        const user = yield (0, service_3.findUserById)(post.user.id);
        if (!user)
            throw new ErrorHandler_1.default(500, 'Something went wrong');
        if (isArchive)
            yield (0, service_2.removeArchivedPost)(post.id, post);
        else
            yield (0, service_2.removePost)(post.id, post);
        yield (0, service_8.updateLocationCountValue)(post.city_id, 'decrement');
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
const deletePostPermanently = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { postId } = req.body;
    const userObj = res.locals.user.payload;
    try {
        if (!postId)
            throw new ErrorHandler_1.default(404, 'Post not found');
        yield (0, service_2.removePost)(postId);
        yield (0, service_2.removeArchivedPost)(postId);
        yield DeletedPost_1.DeletedPost.delete({ id: postId });
        logger_1.default.info(`Post ${postId} permanently deleted by user ${userObj.phone}`);
        return res.status(200).json({ success: 'Post deleted successfully' });
    }
    catch (error) {
        logger_1.default.error(`${error.name}: ${error.message}`);
        logger_1.default.error(`Post ${postId} permanently delete attempt by user ${userObj.phone} failed`);
        return next(error);
    }
});
exports.deletePostPermanently = deletePostPermanently;
const rePost = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = res.locals.user.payload;
    const { postId } = req.body;
    try {
        if (!postId)
            throw new ErrorHandler_1.default(404, 'Invalid payload passed');
        let post;
        post = yield (0, service_2.findPostById)(postId);
        if (!post)
            post = yield (0, service_2.findArchivedPostById)(postId);
        if (!post)
            throw new ErrorHandler_1.default(500, 'Something went wrong');
        const postedDate = post.posted_date;
        const publicDate = new Date();
        const postInfo = {
            id: post.id,
            title: post.title,
            cityId: post.city_id,
            cityTitle: post.city_title,
            stateId: post.state_id,
            stateTitle: post.state_title,
            propertyId: post.property_id,
            propertyTitle: post.property_title,
            categoryId: post.category_id,
            categoryTitle: post.category_title,
            price: post.price,
            description: post.description,
            media: post.media,
            sticked_date: post.sticked_date,
            repost_count: post.repost_count + 1,
            views: post.views,
        };
        const newPost = yield (0, service_2.savePost)(postInfo, post.user, 'regular', postedDate, publicDate);
        yield (0, service_2.removeArchivedPost)(post.id);
        const repostCount = post.repost_count + 1;
        yield (0, service_2.updatePostRepostVals)(newPost, true, repostCount);
        yield (0, service_8.updateLocationCountValue)(post.city_id, 'increment');
        logger_1.default.info(`Post ${post.id} reposted by admin ${user === null || user === void 0 ? void 0 : user.phone}`);
        yield (0, service_4.saveUserLog)([
            {
                post_id: post.id,
                transaction: undefined,
                user: post.user.id,
                activity: `Post ${post.id} reposted by admin ${user === null || user === void 0 ? void 0 : user.phone}`,
            },
        ]);
        return res.status(200).json({ success: 'Post is reposted successfully' });
    }
    catch (error) {
        logger_1.default.error(`${error.name}: ${error.message}`);
        logger_1.default.error(`Post ${postId} repost by user ${user.phone} failed`);
        return next(error);
    }
});
exports.rePost = rePost;
const fetchLogs = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { postId, user, offset } = req.body;
    let response;
    try {
        if (postId)
            response = yield (0, service_4.fetchLogsByPostId)(postId, offset);
        else if (user)
            response = yield (0, service_4.fetchLogsByUser)(user, offset);
        response === null || response === void 0 ? void 0 : response.logs.forEach((log) => {
            log.date = (0, timestampUtls_1.parseTimestamp)(log.created_at).parsedDate;
            log.time = (0, timestampUtls_1.parseTimestamp)(log.created_at).parsedTime;
        });
        return res
            .status(200)
            .json({ logs: response.logs, totalPages: response.totalPages, totalResults: response.totalResults });
    }
    catch (error) {
        logger_1.default.error(`${error.name}: ${error.message}`);
        return next(error);
    }
});
exports.fetchLogs = fetchLogs;
const filterUsers = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { statusToFilter, phoneToFilter, adminCommentToFilter, fromCreationDateToFilter, toCreationDateToFilter, orderByToFilter, offset, } = req.body;
    let totalPages = null;
    try {
        const { users, count } = yield (0, service_3.filterUsersForAdmin)(statusToFilter, phoneToFilter, adminCommentToFilter, fromCreationDateToFilter, toCreationDateToFilter, orderByToFilter, offset);
        totalPages = Math.ceil(count / 50);
        const parsedUsers = users.map((user) => {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r;
            return ({
                id: user.id,
                phone: user.phone,
                status: user.status,
                is_agent: user.is_agent,
                adminComment: user.admin_comment,
                is_blocked: user.is_blocked,
                is_deleted: user.is_deleted,
                lastActivityDate: user.posts && user.posts.length ? (0, timestampUtls_1.parseTimestamp)((0, service_3.getLastActivity)(user)).parsedDate : null,
                lastActivityTime: user.posts && user.posts.length ? (0, timestampUtls_1.parseTimestamp)((0, service_3.getLastActivity)(user)).parsedTime : null,
                registeredDate: (0, timestampUtls_1.parseTimestamp)(user.created_at).parsedDate,
                registeredTime: (0, timestampUtls_1.parseTimestamp)(user.created_at).parsedTime,
                created_at: user.created_at,
                subscriptionStartDate: user.agent && user.agent.length && ((_a = user === null || user === void 0 ? void 0 : user.agent[0]) === null || _a === void 0 ? void 0 : _a.subscription_start_date)
                    ? (0, timestampUtls_1.parseTimestamp)(user.agent[0].subscription_start_date).parsedDate
                    : null,
                subscriptionStartTime: user.agent && user.agent.length && ((_b = user === null || user === void 0 ? void 0 : user.agent[0]) === null || _b === void 0 ? void 0 : _b.subscription_start_date)
                    ? (0, timestampUtls_1.parseTimestamp)(user.agent[0].subscription_start_date).parsedTime
                    : null,
                subscriptionEndsDate: user.agent && user.agent.length && ((_c = user === null || user === void 0 ? void 0 : user.agent[0]) === null || _c === void 0 ? void 0 : _c.subscription_ends_date)
                    ? (0, timestampUtls_1.parseTimestamp)(user.agent[0].subscription_ends_date).parsedDate
                    : null,
                subscriptionEndsTime: user.agent && user.agent.length && ((_d = user === null || user === void 0 ? void 0 : user.agent[0]) === null || _d === void 0 ? void 0 : _d.subscription_ends_date)
                    ? (0, timestampUtls_1.parseTimestamp)(user.agent[0].subscription_ends_date).parsedTime
                    : null,
                post: {
                    active: (_e = user.posts) === null || _e === void 0 ? void 0 : _e.length,
                    repost: user.posts.filter((post) => post.is_reposted).length,
                    archived: (_f = user.archive_posts) === null || _f === void 0 ? void 0 : _f.length,
                    deleted: (_g = user.deleted_posts) === null || _g === void 0 ? void 0 : _g.length,
                },
                credits: {
                    free: (_j = (_h = user === null || user === void 0 ? void 0 : user.credits[0]) === null || _h === void 0 ? void 0 : _h.free) !== null && _j !== void 0 ? _j : 0,
                    regular: (_l = (_k = user === null || user === void 0 ? void 0 : user.credits[0]) === null || _k === void 0 ? void 0 : _k.regular) !== null && _l !== void 0 ? _l : 0,
                    sticky: (_o = (_m = user === null || user === void 0 ? void 0 : user.credits[0]) === null || _m === void 0 ? void 0 : _m.sticky) !== null && _o !== void 0 ? _o : 0,
                    agent: (_q = (_p = user === null || user === void 0 ? void 0 : user.credits[0]) === null || _p === void 0 ? void 0 : _p.agent) !== null && _q !== void 0 ? _q : 0,
                },
                has_zero_credits: ((_r = user === null || user === void 0 ? void 0 : user.credits[0]) === null || _r === void 0 ? void 0 : _r.free) === 0 || user.status === 'not_verified',
                payment: {
                    regular: user === null || user === void 0 ? void 0 : user.transactions.filter((transaction) => transaction.status === 'completed' && ['regular1', 'regular2'].includes(transaction.package_title)).reduce((total, transaction) => total + transaction.package.numberOfCredits, 0),
                    sticky: user.transactions
                        .filter((transaction) => transaction.status === 'completed' && ['sticky1', 'sticky2'].includes(transaction.package_title))
                        .reduce((total, transaction) => total + transaction.package.numberOfCredits, 0),
                    agent: user.transactions
                        .filter((transaction) => transaction.status === 'completed' && ['agent1', 'agent2'].includes(transaction.package_title))
                        .reduce((total, transaction) => total + transaction.package.numberOfCredits, 0),
                },
            });
        });
        return res.status(200).json({ users: parsedUsers, totalPages, totalResults: count });
    }
    catch (error) {
        logger_1.default.error(`${error.name}: ${error.message}`);
        return next(error);
    }
});
exports.filterUsers = filterUsers;
const fetchUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r;
    const { userId } = req.body;
    try {
        const user = yield model_3.User.findOne({
            where: { id: userId },
            relations: ['posts', 'archive_posts', 'deleted_posts', 'credits', 'transactions', 'agent'],
        });
        user === null || user === void 0 ? true : delete user.password;
        const parsedUser = {
            id: user.id,
            phone: user.phone,
            status: user.status,
            is_agent: user.is_agent,
            adminComment: user.admin_comment,
            is_blocked: user.is_blocked,
            is_deleted: user.is_deleted,
            registeredDate: (0, timestampUtls_1.parseTimestamp)(user.created_at).parsedDate,
            registeredTime: (0, timestampUtls_1.parseTimestamp)(user.created_at).parsedTime,
            subscriptionStartDate: user.agent && user.agent.length && ((_a = user === null || user === void 0 ? void 0 : user.agent[0]) === null || _a === void 0 ? void 0 : _a.subscription_start_date)
                ? (0, timestampUtls_1.parseTimestamp)(user.agent[0].subscription_start_date).parsedDate
                : null,
            subscriptionStartTime: user.agent && user.agent.length && ((_b = user === null || user === void 0 ? void 0 : user.agent[0]) === null || _b === void 0 ? void 0 : _b.subscription_start_date)
                ? (0, timestampUtls_1.parseTimestamp)(user.agent[0].subscription_start_date).parsedTime
                : null,
            subscriptionEndsDate: user.agent && user.agent.length && ((_c = user === null || user === void 0 ? void 0 : user.agent[0]) === null || _c === void 0 ? void 0 : _c.subscription_ends_date)
                ? (0, timestampUtls_1.parseTimestamp)(user.agent[0].subscription_ends_date).parsedDate
                : null,
            subscriptionEndsTime: user.agent && user.agent.length && ((_d = user === null || user === void 0 ? void 0 : user.agent[0]) === null || _d === void 0 ? void 0 : _d.subscription_ends_date)
                ? (0, timestampUtls_1.parseTimestamp)(user.agent[0].subscription_ends_date).parsedTime
                : null,
            lastActivityDate: user.posts && user.posts.length ? (0, timestampUtls_1.parseTimestamp)((0, service_3.getLastActivity)(user)).parsedDate : null,
            lastActivityTime: user.posts && user.posts.length ? (0, timestampUtls_1.parseTimestamp)((0, service_3.getLastActivity)(user)).parsedTime : null,
            post: {
                active: (_e = user.posts) === null || _e === void 0 ? void 0 : _e.length,
                repost: (_f = user.posts) === null || _f === void 0 ? void 0 : _f.filter((post) => post.is_reposted).length,
                archived: (_g = user.archive_posts) === null || _g === void 0 ? void 0 : _g.length,
                deleted: (_h = user.deleted_posts) === null || _h === void 0 ? void 0 : _h.length,
            },
            credits: {
                free: (_k = (_j = user === null || user === void 0 ? void 0 : user.credits[0]) === null || _j === void 0 ? void 0 : _j.free) !== null && _k !== void 0 ? _k : 0,
                regular: (_m = (_l = user === null || user === void 0 ? void 0 : user.credits[0]) === null || _l === void 0 ? void 0 : _l.regular) !== null && _m !== void 0 ? _m : 0,
                sticky: (_p = (_o = user === null || user === void 0 ? void 0 : user.credits[0]) === null || _o === void 0 ? void 0 : _o.sticky) !== null && _p !== void 0 ? _p : 0,
                agent: (_r = (_q = user === null || user === void 0 ? void 0 : user.credits[0]) === null || _q === void 0 ? void 0 : _q.agent) !== null && _r !== void 0 ? _r : 0,
            },
            payment: {
                regular: user === null || user === void 0 ? void 0 : user.transactions.filter((transaction) => transaction.status === 'completed' && ['regular1', 'regular2'].includes(transaction.package_title)).reduce((total, transaction) => total + transaction.package.numberOfCredits, 0),
                sticky: user.transactions
                    .filter((transaction) => transaction.status === 'completed' && ['sticky1', 'sticky2'].includes(transaction.package_title))
                    .reduce((total, transaction) => total + transaction.package.numberOfCredits, 0),
                agent: user.transactions
                    .filter((transaction) => transaction.status === 'completed' && ['agent1', 'agent2'].includes(transaction.package_title))
                    .reduce((total, transaction) => total + transaction.package.numberOfCredits, 0),
            },
        };
        return res.status(200).json({ user: parsedUser });
    }
    catch (error) {
        logger_1.default.error(`${error.name}: ${error.message}`);
        return next(error);
    }
});
exports.fetchUser = fetchUser;
const updateUserCredit = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _s, _t, _u, _v, _w;
    const { creditAmount, creditType, userId } = req.body;
    const admin = res.locals.user.payload;
    try {
        const credit = yield (0, service_5.findCreditByUserId)(userId);
        if (!credit)
            throw new ErrorHandler_1.default(401, 'Credit record not found');
        const updatedCredit = yield model_1.Credit.save(Object.assign(Object.assign({}, credit), { [creditType]: creditAmount }));
        logger_1.default.info(`User ${(_s = credit === null || credit === void 0 ? void 0 : credit.user) === null || _s === void 0 ? void 0 : _s.phone} credits updated from ${credit.free}/${credit.regular}/${credit.sticky}/${credit.agent} to ${updatedCredit.free}/${updatedCredit.regular}/${updatedCredit.sticky}/${updatedCredit.agent}`);
        yield (0, service_4.saveUserLog)([
            {
                post_id: undefined,
                transaction: undefined,
                user: (_t = credit === null || credit === void 0 ? void 0 : credit.user) === null || _t === void 0 ? void 0 : _t.phone,
                activity: `User ${(_u = credit === null || credit === void 0 ? void 0 : credit.user) === null || _u === void 0 ? void 0 : _u.phone} credits updated from ${credit.free}/${credit.regular}/${credit.sticky}/${credit.agent} to ${updatedCredit.free}/${updatedCredit.regular}/${updatedCredit.sticky}/${updatedCredit.agent}`,
            },
        ]);
        const slackMsg = `User credits updated by admin ${admin.phone} \n\n <https://wa.me/965${(_v = credit === null || credit === void 0 ? void 0 : credit.user) === null || _v === void 0 ? void 0 : _v.phone}|${(_w = credit === null || credit === void 0 ? void 0 : credit.user) === null || _w === void 0 ? void 0 : _w.phone}> credits updated from ${credit.free}/${credit.regular}/${credit.sticky}/${credit.agent} to ${updatedCredit.free}/${updatedCredit.regular}/${updatedCredit.sticky}/${updatedCredit.agent}`;
        yield (0, slackUtils_1.alertOnSlack)('imp', slackMsg);
        return res.status(200).json({ success: 'Credit updated successfully' });
    }
    catch (error) {
        logger_1.default.error(`${error.name}: ${error.message}`);
        return next(error);
    }
});
exports.updateUserCredit = updateUserCredit;
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
    var _x, _y;
    const { id, phone, adminComment, password } = req.body;
    const admin = (_y = (_x = res.locals) === null || _x === void 0 ? void 0 : _x.user) === null || _y === void 0 ? void 0 : _y.payload;
    try {
        const user = yield (0, service_3.findUserById)(id);
        if (!user)
            throw new ErrorHandler_1.default(401, 'User not found');
        yield (0, service_3.updateUser)(user, phone, adminComment, password);
        if (phone !== user.phone) {
            yield (0, service_4.updatePhoneOfLogs)(user.phone, phone);
            logger_1.default.info(`User ${user === null || user === void 0 ? void 0 : user.phone} phone updated to ${phone} by the admin ${admin === null || admin === void 0 ? void 0 : admin.phone}`);
            yield (0, service_4.saveUserLog)([
                {
                    post_id: undefined,
                    transaction: undefined,
                    user: phone !== user.phone ? phone : user === null || user === void 0 ? void 0 : user.phone,
                    activity: `User ${user === null || user === void 0 ? void 0 : user.phone} phone updated to ${phone} by the admin ${admin === null || admin === void 0 ? void 0 : admin.phone}`,
                },
            ]);
            const slackMsg = `User ${user === null || user === void 0 ? void 0 : user.phone} phone updated to <https://wa.me/965${phone}|${phone}> by the admin ${admin === null || admin === void 0 ? void 0 : admin.phone}`;
            yield (0, slackUtils_1.alertOnSlack)('imp', slackMsg);
        }
        if (password) {
            logger_1.default.info(`User ${user === null || user === void 0 ? void 0 : user.phone} password updated`);
            yield (0, service_4.saveUserLog)([
                {
                    post_id: undefined,
                    transaction: undefined,
                    user: user === null || user === void 0 ? void 0 : user.phone,
                    activity: `User ${user === null || user === void 0 ? void 0 : user.phone} password updated`,
                },
            ]);
        }
        return res.status(200).json({ success: 'User updated successfully' });
    }
    catch (error) {
        logger_1.default.error(`${error.name}: ${error.message}`);
        return next(error);
    }
});
exports.editUser = editUser;
const editAgent = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, agentId, name, email, instagram, facebook, twitter, website, description } = req.body;
    try {
        if (!name)
            throw new ErrorHandler_1.default(404, 'Invalid agent id or name');
        if (agentId) {
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
        }
        else {
            const user = yield (0, service_3.findUserById)(userId);
            if (!user)
                throw new ErrorHandler_1.default(401, 'user not found');
            const agentData = model_2.Agent.create({
                name,
                email,
                instagram,
                facebook,
                twitter,
                website,
                description,
                user,
            });
            yield model_2.Agent.save(agentData);
        }
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
    const { statusToFilter, typeToFilter, fromCreationDateToFilter, toCreationDateToFilter, userId, offset } = req.body;
    try {
        const { transactions, totalPages, totalResults } = yield (0, service_6.filterTransactionsForAdmin)(statusToFilter, typeToFilter, fromCreationDateToFilter, toCreationDateToFilter, userId, offset);
        return res.status(200).json({ transactions, totalPages, totalResults });
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
const updateUserBlockStatus = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _z, _0;
    const { userId, status } = req.body;
    const admin = (_0 = (_z = res.locals) === null || _z === void 0 ? void 0 : _z.user) === null || _0 === void 0 ? void 0 : _0.payload;
    try {
        if (!userId)
            throw new ErrorHandler_1.default(404, 'Invalid user id');
        const user = yield (0, service_3.findUserById)(userId);
        if (!user)
            throw new ErrorHandler_1.default(401, 'User not found');
        if (user.is_blocked && status)
            throw new ErrorHandler_1.default(403, 'User is already blocked');
        if (!user.is_blocked && status === false)
            throw new ErrorHandler_1.default(403, 'You can not unblock a non blocked user');
        yield model_3.User.save(Object.assign(Object.assign({}, user), { is_agent: status ? false : user.is_agent, is_blocked: status }));
        if (status) {
            // const socketIo: any = await getSocketIo();
            // socketIo.emit('userBlocked', { user: user.phone });
            yield (0, service_7.setSubscriptionNull)(userId);
            yield (0, service_2.removeAllPostsOfUser)(userId);
            yield (0, service_5.setCreditsToZeroByUserId)(userId);
        }
        logger_1.default.info(`User ${user.phone} ${status ? 'blocked' : 'unblocked'} by admin ${admin.phone}`);
        yield (0, service_4.saveUserLog)([
            {
                post_id: undefined,
                transaction: undefined,
                user: user.phone,
                activity: `User ${user.phone} ${status ? 'blocked' : 'unblocked'} by admin ${admin.phone}`,
            },
        ]);
        return res.status(200).json({ success: `User ${status === true ? ' blocked' : ' unblocked'} successfully` });
    }
    catch (error) {
        logger_1.default.error(`${error.name}: ${error.message}`);
        return next(error);
    }
});
exports.updateUserBlockStatus = updateUserBlockStatus;
const updateUserComment = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, adminComment } = req.body;
    try {
        if (!userId)
            throw new ErrorHandler_1.default(404, 'Invalid user id');
        const user = yield (0, service_3.findUserById)(userId);
        if (!user)
            throw new ErrorHandler_1.default(401, 'User not found');
        yield model_3.User.save(Object.assign(Object.assign({}, user), { admin_comment: adminComment && adminComment !== '' ? adminComment : null }));
        return res.status(200).json({ success: `User comment updated successfully` });
    }
    catch (error) {
        logger_1.default.error(`${error.name}: ${error.message}`);
        return next(error);
    }
});
exports.updateUserComment = updateUserComment;
const updateTransactionStatus = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { transactionId, transactionStatus } = req.body;
    try {
        if (!transactionId)
            throw new ErrorHandler_1.default(404, 'Invalid transaction id');
        const transaction = yield (0, service_6.findTransactionById)(transactionId);
        if (!transaction)
            throw new ErrorHandler_1.default(401, 'transaction not found');
        yield model_4.Transaction.save(Object.assign(Object.assign({}, transaction), { status: transactionStatus }));
        if (transactionStatus === 'completed') {
            const packageTitle = transaction.package_title.slice(0, -1);
            yield (0, service_5.updateCredit)(transaction.user.id, packageTitle, transaction.package.numberOfCredits, 'ADD');
            if (packageTitle === 'agent') {
                yield (0, service_3.updateIsUserAnAgent)(transaction.user.id, true);
                yield (0, service_7.initOrUpdateAgent)(transaction.user, transaction.package_title);
            }
        }
        return res.status(200).json({ success: `Transaction updated successfully` });
    }
    catch (error) {
        logger_1.default.error(`${error.name}: ${error.message}`);
        return next(error);
    }
});
exports.updateTransactionStatus = updateTransactionStatus;
const removeUserPermanently = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.body;
    try {
        if (!userId)
            throw new ErrorHandler_1.default(404, 'Invalid payload passed');
        yield model_1.Credit.delete({ user: { id: userId } });
        yield model_4.Transaction.delete({ user: { id: userId } });
        yield model_5.Otp.delete({ user: { id: userId } });
        yield model_2.Agent.delete({ user: { id: userId } });
        yield model_1.Credit.delete({ user: { id: userId } });
        yield model_4.Transaction.delete({ user: { id: userId } });
        yield DeletedPost_1.DeletedPost.delete({ user: { id: userId } });
        const activePosts = yield Post_1.Post.find({ where: { user: { id: userId } } });
        const archivedPosts = yield ArchivePost_1.ArchivePost.find({ where: { user: { id: userId } } });
        activePosts.forEach((post) => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, service_2.removePost)(post.id, post);
            yield (0, service_8.updateLocationCountValue)(post.city_id, 'decrement');
        }));
        archivedPosts.forEach((post) => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, service_2.removeArchivedPost)(post.id, post);
            yield (0, service_8.updateLocationCountValue)(post.city_id, 'decrement');
        }));
        yield model_3.User.delete({ id: userId });
        return res.status(200).json({ success: 'User deleted permanently' });
    }
    catch (error) {
        logger_1.default.error(`${error.name}: ${error.message}`);
        return next(error);
    }
});
exports.removeUserPermanently = removeUserPermanently;
const restore = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _1;
    const user = res.locals.user.payload;
    const { userId } = req.body;
    try {
        if (!userId)
            throw new ErrorHandler_1.default(404, 'Invalid payload passed');
        const userObj = yield (0, service_3.findUserById)(userId);
        if (!userObj)
            throw new ErrorHandler_1.default(500, 'Something went wrong');
        userObj.is_deleted = false;
        yield model_3.User.save(userObj);
        const posts = yield DeletedPost_1.DeletedPost.find({ where: { user: { id: userId } } });
        posts.forEach((post) => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, service_2.removeDeletedPost)(post.id);
            const postInfo = Post_1.Post.create(Object.assign(Object.assign({}, post), { post_type: 'active' }));
            yield Post_1.Post.save(postInfo);
            yield (0, service_8.updateLocationCountValue)(post.city_id, 'increment');
        }));
        logger_1.default.info(`User ${userObj.phone} restored by admin ${user === null || user === void 0 ? void 0 : user.phone}`);
        yield (0, service_4.saveUserLog)([
            {
                post_id: undefined,
                transaction: undefined,
                user: (_1 = userObj === null || userObj === void 0 ? void 0 : userObj.phone) !== null && _1 !== void 0 ? _1 : undefined,
                activity: `User ${userObj.phone} restored by admin ${user === null || user === void 0 ? void 0 : user.phone}`,
            },
        ]);
        return res.status(200).json({ success: 'User is restored successfully' });
    }
    catch (error) {
        logger_1.default.error(`${error.name}: ${error.message}`);
        logger_1.default.error(`User ${userId} restore attempt by admin ${user.phone} failed`);
        yield (0, service_4.saveUserLog)([
            { post_id: undefined, transaction: undefined, user: userId, activity: 'User restoration failed' },
        ]);
        return next(error);
    }
});
exports.restore = restore;
const test = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.body;
    try {
        const posts = yield DeletedPost_1.DeletedPost.find({ where: { user: { id: userId } } });
        return res.status(200).json({ posts });
    }
    catch (error) {
        logger_1.default.error(`${error.name}: ${error.message}`);
        return next(error);
    }
});
exports.test = test;
//# sourceMappingURL=controller.js.map