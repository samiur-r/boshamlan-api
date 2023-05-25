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
exports.increasePostCount = exports.fetchManyArchive = exports.deletePost = exports.restore = exports.rePost = exports.updatePostToStick = exports.fetchMany = exports.fetchOneForEdit = exports.fetchOne = exports.update = exports.insert = void 0;
const ErrorHandler_1 = __importDefault(require("../../../utils/ErrorHandler"));
const logger_1 = __importDefault(require("../../../utils/logger"));
const service_1 = require("../users/service");
const service_2 = require("../credits/service");
const validation_1 = require("./validation");
const service_3 = require("./service");
const cloudinaryUtils_1 = require("../../../utils/cloudinaryUtils");
const slackUtils_1 = require("../../../utils/slackUtils");
const smsUtils_1 = require("../../../utils/smsUtils");
const service_4 = require("../user_logs/service");
const checkAuthorization_1 = require("../../../utils/checkAuthorization");
const service_5 = require("../locations/service");
const Post_1 = require("./models/Post");
const hidePhoneNumber_1 = __importDefault(require("../../../utils/hidePhoneNumber"));
const ArchivePost_1 = require("./models/ArchivePost");
const fetchOne = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let post;
    let isActive = true;
    let inactivePostText = '';
    let relevantSearch = '';
    try {
        post = yield (0, service_3.findPostById)(parseInt(req.params.id, 10));
        if (!post) {
            post = yield (0, service_3.findArchivedPostById)(parseInt(req.params.id, 10));
            if (post) {
                post.phone = '';
                post.description = (0, hidePhoneNumber_1.default)(post.description);
                inactivePostText = 'This post have been archived and you can not contact the owner';
                relevantSearch = `/${post.category_title}/${post.property_title}/${post.city_title.replace(/\s+/g, '-')}`;
            }
            isActive = false;
        }
        if (!post) {
            post = yield (0, service_3.findDeletedPostById)(parseInt(req.params.id, 10));
            if (post) {
                post.phone = '';
                post.description = (0, hidePhoneNumber_1.default)(post.description);
                inactivePostText = 'This post have been deleted and you can not contact the owner';
                relevantSearch = `/${post.category_title}/${post.property_title}/${post.city_title.replace(/\s+/g, '-')}`;
            }
            isActive = false;
        }
        if (!post)
            throw new ErrorHandler_1.default(404, 'Post not found');
        return res.status(200).json({ success: post, isActive, inactivePostText, relevantSearch });
    }
    catch (error) {
        logger_1.default.error(`${error.name}: ${error.message}`);
        return next(error);
    }
});
exports.fetchOne = fetchOne;
const fetchOneForEdit = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const user = (_b = (_a = res.locals) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.payload;
    let post;
    try {
        post = yield (0, service_3.findPostById)(parseInt(req.params.id, 10));
        if (!post) {
            post = yield (0, service_3.findArchivedPostById)(parseInt(req.params.id, 10));
        }
        if (!post) {
            post = yield (0, service_3.findDeletedPostById)(parseInt(req.params.id, 10));
        }
        if (!post)
            throw new ErrorHandler_1.default(404, 'Post not found');
        (0, checkAuthorization_1.checkAuthorization)(user, post.user.id);
        return res.status(200).json({ success: post });
    }
    catch (error) {
        logger_1.default.error(`${error.name}: ${error.message}`);
        return next(error);
    }
});
exports.fetchOneForEdit = fetchOneForEdit;
const fetchMany = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _c, _d, _e, _f, _g, _h, _j;
    const limit = ((_c = req.query) === null || _c === void 0 ? void 0 : _c.limit) ? parseInt(req.query.limit, 10) : 10;
    const offset = ((_d = req.query) === null || _d === void 0 ? void 0 : _d.offset) ? parseInt(req.query.offset, 10) : undefined;
    // eslint-disable-next-line no-nested-ternary
    const userId = ((_g = (_f = (_e = res === null || res === void 0 ? void 0 : res.locals) === null || _e === void 0 ? void 0 : _e.user) === null || _f === void 0 ? void 0 : _f.payload) === null || _g === void 0 ? void 0 : _g.id)
        ? res.locals.user.payload.id
        : ((_h = req.query) === null || _h === void 0 ? void 0 : _h.userId)
            ? parseInt((_j = req.query) === null || _j === void 0 ? void 0 : _j.userId, 10)
            : undefined;
    try {
        const { posts, count } = yield (0, service_3.findPosts)(limit, offset, userId);
        return res.status(200).json({ posts, totalPosts: count });
    }
    catch (error) {
        logger_1.default.error(`${error.name}: ${error.message}`);
        return next(error);
    }
});
exports.fetchMany = fetchMany;
const fetchManyArchive = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _k, _l;
    const limit = ((_k = req.query) === null || _k === void 0 ? void 0 : _k.limit) ? parseInt(req.query.limit, 10) : 10;
    const offset = ((_l = req.query) === null || _l === void 0 ? void 0 : _l.offset) ? parseInt(req.query.offset, 10) : undefined;
    const userId = res.locals.user.payload.id;
    try {
        const resPosts = yield (0, service_3.findArchivedPostByUserId)(limit, offset, userId);
        return res.status(200).json({ posts: resPosts.archivePosts });
    }
    catch (error) {
        logger_1.default.error(`${error.name}: ${error.message}`);
        return next(error);
    }
});
exports.fetchManyArchive = fetchManyArchive;
const insert = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { postInfo, isStickyOnly } = req.body;
    const userId = res.locals.user.payload.id;
    const media = [];
    postInfo.title = `${postInfo.propertyTitle} ل${postInfo.categoryTitle} في ${postInfo.cityTitle}`;
    const endpoint = req.originalUrl.substring(13, req.originalUrl.length);
    const isTempPost = endpoint === 'temp';
    const logs = [];
    try {
        const { files } = req;
        yield validation_1.postSchema.validate(postInfo);
        const user = yield (0, service_1.findUserById)(userId);
        if (!user)
            throw new ErrorHandler_1.default(500, 'Something went wrong');
        if (isTempPost) {
            if (files && files.length) {
                const promises = files.map((file) => (0, cloudinaryUtils_1.uploadMediaToCloudinary)(file, 'posts'));
                const results = yield Promise.all(promises);
                if (results && results.length)
                    media.push(...results);
            }
            postInfo.media = media;
            const typeOfCredit = 'sticky';
            const tempPost = yield (0, service_3.saveTempPost)(postInfo, user, typeOfCredit);
            logger_1.default.info(`User: ${user.phone} post: ${tempPost.id}, saved as temp`);
            // logs.push({ post_id: tempPost.id, transaction: undefined, user: user.phone, activity: 'Saved as temp post' });
        }
        else {
            const { typeOfCredit, credit } = yield (0, service_2.typeOfCreditToDeduct)(user.id, user.is_agent, postInfo.isStickyPost, isStickyOnly);
            if (!typeOfCredit)
                throw new ErrorHandler_1.default(402, 'You do not have enough credit');
            if (files && files.length) {
                const promises = files.map((file) => (0, cloudinaryUtils_1.uploadMediaToCloudinary)(file, 'posts'));
                const results = yield Promise.all(promises);
                if (results && results.length)
                    media.push(...results);
            }
            postInfo.media = media;
            const postedDate = new Date();
            const publicDate = new Date();
            const newPost = yield (0, service_3.savePost)(postInfo, user, typeOfCredit, postedDate, publicDate);
            yield (0, service_2.updateCredit)(userId, typeOfCredit, 1, 'SUB', credit);
            logger_1.default.info(`User: ${user.phone} created new post: ${newPost.id}`);
            logs.push({ post_id: newPost.id, transaction: undefined, user: user.phone, activity: 'New post created' });
            if (typeOfCredit === 'free' && credit.free === 1) {
                const slackMsg = `User consumed their free credits\n ${(user === null || user === void 0 ? void 0 : user.phone) ? `<https://wa.me/965${user === null || user === void 0 ? void 0 : user.phone}|${user === null || user === void 0 ? void 0 : user.phone}>` : ''} - ${(user === null || user === void 0 ? void 0 : user.admin_comment) || ''}`;
                yield (0, slackUtils_1.alertOnSlack)('imp', slackMsg);
                yield (0, smsUtils_1.sendSms)(user.phone, 'You have consumed all of your free credits');
            }
            if (typeOfCredit === 'agent' && credit.agent === 1) {
                const slackMsg = `Agent credit is now 0\n ${(user === null || user === void 0 ? void 0 : user.phone) ? `<https://wa.me/965${user === null || user === void 0 ? void 0 : user.phone}|${user === null || user === void 0 ? void 0 : user.phone}>` : ''} - ${(user === null || user === void 0 ? void 0 : user.admin_comment) || ''}`;
                yield (0, slackUtils_1.alertOnSlack)('imp', slackMsg);
                yield (0, smsUtils_1.sendSms)(user.phone, 'Your agent credit is now 0');
            }
        }
        if (logs && logs.length)
            yield (0, service_4.saveUserLog)(logs);
        return res.status(200).json({ success: 'Post created successfully' });
    }
    catch (error) {
        const user = yield (0, service_1.findUserByPhone)(postInfo.phone);
        logger_1.default.error(`${error.name}: ${error.message}`);
        if (error.name === 'ValidationError') {
            error.message = 'Invalid payload passed';
        }
        const slackMsg = `Failed to create post\n${(postInfo === null || postInfo === void 0 ? void 0 : postInfo.phone) ? `<https://wa.me/965${postInfo === null || postInfo === void 0 ? void 0 : postInfo.phone}|${postInfo === null || postInfo === void 0 ? void 0 : postInfo.phone}>` : ''} - ${(user === null || user === void 0 ? void 0 : user.admin_comment) ? `${user.admin_comment}` : ''}\nError message: "${error.message}"`;
        yield (0, slackUtils_1.alertOnSlack)('non-imp', slackMsg);
        logs.push({ post_id: undefined, transaction: undefined, user: `${userId}`, activity: 'Failed to create post' });
        if (logs && logs.length)
            yield (0, service_4.saveUserLog)(logs);
        return next(error);
    }
});
exports.insert = insert;
const update = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _m, _o;
    const { postInfo, postId } = req.body;
    const user = (_o = (_m = res.locals) === null || _m === void 0 ? void 0 : _m.user) === null || _o === void 0 ? void 0 : _o.payload;
    const media = [];
    let post;
    try {
        const { files } = req;
        post = yield (0, service_3.findPostById)(postId);
        if (!post) {
            post = yield (0, service_3.findArchivedPostById)(postId);
        }
        if (!post) {
            post = yield (0, service_3.findDeletedPostById)(postId);
        }
        if (!post)
            throw new ErrorHandler_1.default(404, 'Post not found');
        (0, checkAuthorization_1.checkAuthorization)(user, post.user.id);
        yield validation_1.postSchema.validate(postInfo);
        yield (0, service_3.removePostMedia)(postId);
        if (files && files.length) {
            const promises = files.map((file) => (0, cloudinaryUtils_1.uploadMediaToCloudinary)(file, 'posts'));
            const results = yield Promise.all(promises);
            if (results && results.length)
                media.push(...results);
        }
        postInfo.media = media;
        let updatedPost;
        switch (post.post_type) {
            case 'active':
                updatedPost = yield (0, service_3.updatePost)(postInfo, post);
                break;
            case 'archived':
                updatedPost = yield (0, service_3.updateArchivePost)(postInfo, post);
                break;
            case 'deleted':
                updatedPost = yield (0, service_3.updateDeletedPost)(postInfo, post);
                break;
            default:
                break;
        }
        logger_1.default.info(`User: ${updatedPost === null || updatedPost === void 0 ? void 0 : updatedPost.phone} updated post: ${updatedPost === null || updatedPost === void 0 ? void 0 : updatedPost.id}`);
        yield (0, service_4.saveUserLog)([
            {
                post_id: updatedPost === null || updatedPost === void 0 ? void 0 : updatedPost.id,
                transaction: undefined,
                user: updatedPost === null || updatedPost === void 0 ? void 0 : updatedPost.phone,
                activity: 'Post updated successfully',
            },
        ]);
        return res.status(200).json({ success: 'Post Updated successfully' });
    }
    catch (error) {
        logger_1.default.error(`${error.name}: ${error.message}`);
        if (error.name === 'ValidationError') {
            error.message = 'Invalid payload passed';
        }
        yield (0, service_4.saveUserLog)([
            { post_id: parseInt(postId, 10), transaction: undefined, user: undefined, activity: 'Post update failed' },
        ]);
        return next(error);
    }
});
exports.update = update;
const updatePostToStick = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _p;
    const userId = res.locals.user.payload.id;
    const userPhone = res.locals.user.payload.phone;
    const { postId } = req.body;
    let post;
    let isArchive = false;
    try {
        const user = yield (0, service_1.findUserById)(userId);
        if (!user)
            throw new ErrorHandler_1.default(500, 'Something went wrong');
        if (!postId)
            throw new ErrorHandler_1.default(404, 'Invalid payload passed');
        const credit = yield (0, service_2.findCreditByUserId)(userId);
        if (!credit)
            throw new ErrorHandler_1.default(500, 'Something went wrong');
        if (credit.sticky < 1)
            throw new ErrorHandler_1.default(402, 'You do not have enough credit');
        post = yield (0, service_3.findPostById)(parseInt(postId, 10));
        if (!post) {
            post = yield (0, service_3.findArchivedPostById)(postId);
            isArchive = true;
        }
        if (!post)
            throw new ErrorHandler_1.default(500, 'Something went wrong');
        if (post.is_sticky)
            throw new ErrorHandler_1.default(304, 'Post is already sticky');
        if (isArchive) {
            post.post_type = 'active';
            yield ArchivePost_1.ArchivePost.delete(post.id);
        }
        yield (0, service_3.updatePostStickyVal)(post, true);
        const slackMsg = `Post titled ${post.title} is sticked by \n<https://wa.me/965${post === null || post === void 0 ? void 0 : post.user.phone}|${post === null || post === void 0 ? void 0 : post.user.phone}> - ${user.admin_comment || ''}`;
        yield (0, slackUtils_1.alertOnSlack)('imp', slackMsg);
        logger_1.default.info(`Post ${post.id} sticked by user ${user === null || user === void 0 ? void 0 : user.phone}`);
        yield (0, service_4.saveUserLog)([
            {
                post_id: post.id,
                transaction: undefined,
                user: (_p = user === null || user === void 0 ? void 0 : user.phone) !== null && _p !== void 0 ? _p : undefined,
                activity: 'Post sticked successfully',
            },
        ]);
        let creditType = post.credit_type;
        if (creditType === 'agent' && !(user === null || user === void 0 ? void 0 : user.is_agent))
            creditType = 'regular';
        const updatedCredit = yield (0, service_2.updateCredit)(user.id, post.credit_type, 1, 'ADD', credit);
        yield (0, service_2.updateCredit)(user.id, 'sticky', 1, 'SUB', updatedCredit);
        return res.status(200).json({ success: 'Post is sticked successfully' });
    }
    catch (error) {
        logger_1.default.error(`${error.name}: ${error.message}`);
        logger_1.default.error(`Post ${postId} stick attempt by user ${userPhone} failed`);
        yield (0, service_4.saveUserLog)([
            {
                post_id: parseInt(postId, 10),
                transaction: undefined,
                user: userPhone,
                activity: 'Post stick attempt failed',
            },
        ]);
        return next(error);
    }
});
exports.updatePostToStick = updatePostToStick;
const rePost = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _q;
    const user = res.locals.user.payload;
    const { postId } = req.body;
    try {
        if (!user)
            throw new ErrorHandler_1.default(500, 'Something went wrong');
        if (!postId)
            throw new ErrorHandler_1.default(404, 'Invalid payload passed');
        let post;
        post = yield (0, service_3.findPostById)(postId);
        if (!post)
            post = yield (0, service_3.findArchivedPostById)(postId);
        if (!post)
            throw new ErrorHandler_1.default(500, 'Something went wrong');
        const credit = yield (0, service_2.findCreditByUserId)(user.id);
        if (!credit)
            throw new ErrorHandler_1.default(500, 'Something went wrong');
        let typeOfCredit;
        if (credit.free > 0)
            typeOfCredit = 'free';
        else if (user.is_agent && credit.agent > 0)
            typeOfCredit = 'agent';
        else if (credit.regular > 0)
            typeOfCredit = 'regular';
        if (!typeOfCredit)
            throw new ErrorHandler_1.default(402, 'You do not have enough credit');
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
            repost_count: post.repost_count,
            views: 0,
        };
        const postedDate = post.posted_date;
        const publicDate = new Date();
        const newPost = yield (0, service_3.savePost)(postInfo, user, typeOfCredit, postedDate, publicDate);
        yield ArchivePost_1.ArchivePost.delete(post.id);
        yield (0, service_2.updateCredit)(user.id, typeOfCredit, 1, 'SUB', credit);
        const repostCount = post.repost_count + 1;
        yield (0, service_3.updatePostRepostVals)(newPost, true, repostCount);
        yield (0, service_5.updateLocationCountValue)(post.city_id, 'increment');
        logger_1.default.info(`Post ${post.id} reposted by user ${user === null || user === void 0 ? void 0 : user.phone}`);
        yield (0, service_4.saveUserLog)([
            {
                post_id: post.id,
                transaction: undefined,
                user: (_q = user === null || user === void 0 ? void 0 : user.phone) !== null && _q !== void 0 ? _q : undefined,
                activity: 'Post reposted successfully',
            },
        ]);
        return res.status(200).json({ success: 'Post is reposted successfully' });
    }
    catch (error) {
        logger_1.default.error(`${error.name}: ${error.message}`);
        logger_1.default.error(`Post ${postId} repost by user ${user.phone} failed`);
        yield (0, service_4.saveUserLog)([
            { post_id: parseInt(postId, 10), transaction: undefined, user: user.phone, activity: 'Post repost failed' },
        ]);
        return next(error);
    }
});
exports.rePost = rePost;
const restore = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _r;
    const user = res.locals.user.payload;
    const { postId } = req.body;
    try {
        if (!postId)
            throw new ErrorHandler_1.default(404, 'Invalid payload passed');
        const post = yield (0, service_3.findDeletedPostById)(postId);
        if (!post)
            throw new ErrorHandler_1.default(500, 'Something went wrong');
        const userObj = yield (0, service_1.findUserById)(post.user.id);
        if (!userObj)
            throw new ErrorHandler_1.default(500, 'Something went wrong');
        const postInfo = Post_1.Post.create({
            id: post.id,
            title: post.title,
            city_id: post.city_id,
            city_title: post.city_title,
            state_id: post.state_id,
            state_title: post.state_title,
            property_id: post.property_id,
            property_title: post.property_title,
            category_id: post.category_id,
            category_title: post.category_title,
            price: post.price,
            description: post.description,
            media: post.media,
            sticked_date: post.sticked_date,
            repost_count: post.repost_count,
            views: post.views,
            expiry_date: post.expiry_date,
            posted_date: post.posted_date,
            public_date: post.public_date,
            is_sticky: post.is_sticky,
            sticky_expires: post.sticky_expires,
            post_type: 'active',
            credit_type: post.credit_type,
            user: userObj,
        });
        yield Post_1.Post.save(postInfo);
        yield (0, service_3.removeDeletedPost)(post.id);
        yield (0, service_5.updateLocationCountValue)(post.city_id, 'increment');
        logger_1.default.info(`Post ${post.id} restored by user ${user === null || user === void 0 ? void 0 : user.phone}`);
        yield (0, service_4.saveUserLog)([
            {
                post_id: post.id,
                transaction: undefined,
                user: (_r = user === null || user === void 0 ? void 0 : user.phone) !== null && _r !== void 0 ? _r : undefined,
                activity: 'Post restored successfully',
            },
        ]);
        return res.status(200).json({ success: 'Post is restored successfully' });
    }
    catch (error) {
        logger_1.default.error(`${error.name}: ${error.message}`);
        logger_1.default.error(`Post ${postId} restore attempt by user ${user.phone} failed`);
        yield (0, service_4.saveUserLog)([
            { post_id: parseInt(postId, 10), transaction: undefined, user: user.phone, activity: 'Post restore failed' },
        ]);
        return next(error);
    }
});
exports.restore = restore;
const deletePost = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { postId, isArchive } = req.body;
    const userId = res.locals.user.payload.id;
    try {
        if (!postId)
            throw new ErrorHandler_1.default(404, 'Post not found');
        let post;
        if (isArchive)
            post = yield (0, service_3.findArchivedPostById)(parseInt(postId, 10));
        else
            post = yield (0, service_3.findPostById)(parseInt(postId, 10));
        if (!post)
            throw new ErrorHandler_1.default(500, 'Something went wrong');
        const user = yield (0, service_1.findUserById)(userId);
        if (!user)
            throw new ErrorHandler_1.default(500, 'Something went wrong');
        if (isArchive)
            yield (0, service_3.removeArchivedPost)(post.id, post);
        else
            yield (0, service_3.removePost)(post.id, post);
        yield (0, service_5.updateLocationCountValue)(post.city_id, 'decrement');
        post.media = [];
        yield (0, service_3.saveDeletedPost)(post, user);
        logger_1.default.info(`Post ${postId} deleted by user ${user.phone}`);
        yield (0, service_4.saveUserLog)([
            { post_id: parseInt(postId, 10), transaction: undefined, user: `${user.phone}`, activity: 'Post deleted' },
        ]);
        return res.status(200).json({ success: 'Post deleted successfully' });
    }
    catch (error) {
        logger_1.default.error(`${error.name}: ${error.message}`);
        logger_1.default.error(`Post ${postId} delete attempt by user ${userId} failed`);
        yield (0, service_4.saveUserLog)([
            {
                post_id: parseInt(postId, 10),
                transaction: undefined,
                user: `${userId}`,
                activity: 'Post delete attempt failed',
            },
        ]);
        return next(error);
    }
});
exports.deletePost = deletePost;
const increasePostCount = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { postId } = req.body;
    try {
        yield (0, service_3.updatePostViewCount)(postId, 1);
        return res.status(200).json({ success: 'View count updates successfully' });
    }
    catch (error) {
        logger_1.default.error(`${error.name}: ${error.message}`);
        return next(error);
    }
});
exports.increasePostCount = increasePostCount;
//# sourceMappingURL=controller.js.map