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
exports.increasePostCount = exports.fetchManyArchive = exports.deletePost = exports.rePost = exports.updatePostToStick = exports.fetchMany = exports.fetchOne = exports.update = exports.insert = void 0;
const ErrorHandler_1 = __importDefault(require("../../../utils/ErrorHandler"));
const logger_1 = __importDefault(require("../../../utils/logger"));
const service_1 = require("../users/service");
const service_2 = require("../credits/service");
const validation_1 = require("./validation");
const service_3 = require("./service");
const fetchOne = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const post = yield (0, service_3.findPostById)(parseInt(req.params.id, 10));
        if (!post)
            throw new ErrorHandler_1.default(404, 'Post not found');
        return res.status(200).json({ success: post });
    }
    catch (error) {
        logger_1.default.error(`${error.name}: ${error.message}`);
        return next(error);
    }
});
exports.fetchOne = fetchOne;
const fetchMany = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g;
    const limit = ((_a = req.query) === null || _a === void 0 ? void 0 : _a.limit) ? parseInt(req.query.limit, 10) : 10;
    const offset = ((_b = req.query) === null || _b === void 0 ? void 0 : _b.offset) ? parseInt(req.query.offset, 10) : undefined;
    // eslint-disable-next-line no-nested-ternary
    const userId = ((_e = (_d = (_c = res === null || res === void 0 ? void 0 : res.locals) === null || _c === void 0 ? void 0 : _c.user) === null || _d === void 0 ? void 0 : _d.payload) === null || _e === void 0 ? void 0 : _e.id)
        ? res.locals.user.payload.id
        : ((_f = req.query) === null || _f === void 0 ? void 0 : _f.userId)
            ? parseInt((_g = req.query) === null || _g === void 0 ? void 0 : _g.userId, 10)
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
    var _h, _j;
    const limit = ((_h = req.query) === null || _h === void 0 ? void 0 : _h.limit) ? parseInt(req.query.limit, 10) : 10;
    const offset = ((_j = req.query) === null || _j === void 0 ? void 0 : _j.offset) ? parseInt(req.query.offset, 10) : undefined;
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
    const { postInfo } = req.body;
    const userId = res.locals.user.payload.id;
    const files = req.files;
    postInfo.media = [];
    postInfo.title = `${postInfo.propertyTitle} ل${postInfo.categoryTitle} في ${postInfo.cityTitle}`;
    postInfo.isStickyPost = postInfo.isStickyPost === 'true';
    const endpoint = req.originalUrl.substring(13, req.originalUrl.length);
    const isTempPost = endpoint === 'temp';
    if (files && files.length) {
        files.forEach((file) => {
            postInfo.media.push(file.filename);
        });
    }
    try {
        yield validation_1.postSchema.validate(postInfo);
        const user = yield (0, service_1.findUserById)(userId);
        if (!user)
            throw new ErrorHandler_1.default(500, 'Something went wrong');
        if (isTempPost) {
            const typeOfCredit = 'sticky';
            yield (0, service_3.saveTempPost)(postInfo, user, typeOfCredit);
        }
        else {
            const { typeOfCredit, credit } = yield (0, service_2.typeOfCreditToDeduct)(user.id, user.is_agent, postInfo.isStickyPost);
            if (!typeOfCredit)
                throw new ErrorHandler_1.default(402, 'You do not have enough credit');
            yield (0, service_3.savePost)(postInfo, user, typeOfCredit);
            yield (0, service_2.updateCredit)(userId, typeOfCredit, 1, 'SUB', credit);
        }
        return res.status(200).json({ success: 'Post created successfully' });
    }
    catch (error) {
        logger_1.default.error(`${error.name}: ${error.message}`);
        if (error.name === 'ValidationError') {
            error.message = 'Invalid payload passed';
        }
        return next(error);
    }
});
exports.insert = insert;
const update = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { postInfo, postId } = req.body;
    postInfo.media = [];
    const files = req.files;
    if (files && files.length) {
        files.forEach((file) => {
            postInfo.media.push(file.filename);
        });
    }
    try {
        if (!postId)
            throw new ErrorHandler_1.default(404, 'Post not found');
        yield validation_1.postSchema.validate(postInfo);
        yield (0, service_3.removePostMedia)(postId);
        yield (0, service_3.updatePost)(postInfo, postId);
        return res.status(200).json({ success: 'Post Updated successfully' });
    }
    catch (error) {
        logger_1.default.error(`${error.name}: ${error.message}`);
        if (error.name === 'ValidationError') {
            error.message = 'Invalid payload passed';
        }
        return next(error);
    }
});
exports.update = update;
const updatePostToStick = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = res.locals.user.payload.id;
    const { postId } = req.body;
    try {
        if (!postId)
            throw new ErrorHandler_1.default(404, 'Invalid payload passed');
        const credit = yield (0, service_2.findCreditByUserId)(userId);
        if (!credit)
            throw new ErrorHandler_1.default(500, 'Something went wrong');
        if (credit.sticky < 1)
            throw new ErrorHandler_1.default(402, 'You do not have enough credit');
        const post = yield (0, service_3.findPostById)(parseInt(postId, 10));
        if (!post)
            throw new ErrorHandler_1.default(500, 'Something went wrong');
        if (post.is_sticky)
            throw new ErrorHandler_1.default(304, 'Post is already sticky');
        const user = yield (0, service_1.findUserById)(userId);
        yield (0, service_3.updatePostStickyVal)(post, true);
        let creditType = post.credit_type;
        if (creditType === 'agent' && !(user === null || user === void 0 ? void 0 : user.is_agent))
            creditType = 'regular';
        const updatedCredit = yield (0, service_2.updateCredit)(userId, post.credit_type, 1, 'ADD', credit);
        yield (0, service_2.updateCredit)(userId, 'sticky', 1, 'SUB', updatedCredit);
        return res.status(200).json({ success: 'Post is sticked successfully' });
    }
    catch (error) {
        logger_1.default.error(`${error.name}: ${error.message}`);
        return next(error);
    }
});
exports.updatePostToStick = updatePostToStick;
const rePost = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = res.locals.user.payload.id;
    const { postId } = req.body;
    try {
        if (!postId)
            throw new ErrorHandler_1.default(404, 'Invalid payload passed');
        const post = yield (0, service_3.findArchivedPostById)(postId);
        if (!post)
            throw new ErrorHandler_1.default(500, 'Something went wrong');
        const user = yield (0, service_1.findUserById)(userId);
        if (!user)
            throw new ErrorHandler_1.default(500, 'Something went wrong');
        const credit = yield (0, service_2.findCreditByUserId)(userId);
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
        };
        const newPost = yield (0, service_3.savePost)(postInfo, user, typeOfCredit);
        yield (0, service_3.removeArchivedPost)(post.id);
        yield (0, service_2.updateCredit)(userId, typeOfCredit, 1, 'SUB', credit);
        const repostCount = post.repost_count + 1;
        yield (0, service_3.updatePostRepostVals)(newPost, true, repostCount);
        return res.status(200).json({ success: 'Post is reposted successfully' });
    }
    catch (error) {
        logger_1.default.error(`${error.name}: ${error.message}`);
        return next(error);
    }
});
exports.rePost = rePost;
const deletePost = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { postId, isArchive } = req.body;
    const userId = res.locals.user.payload.id;
    try {
        if (!postId)
            throw new ErrorHandler_1.default(404, 'Invalid payload passed');
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
            yield (0, service_3.removeArchivedPost)(post.id);
        else
            yield (0, service_3.removePost)(post.id);
        yield (0, service_3.saveDeletedPost)(post, user);
        return res.status(200).json({ success: 'Post deleted successfully' });
    }
    catch (error) {
        logger_1.default.error(`${error.name}: ${error.message}`);
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