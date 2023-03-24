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
exports.searchPosts = exports.updatePostViewCount = exports.updatePostRepostVals = exports.updatePostStickyVal = exports.updatePost = exports.removePost = exports.removeArchivedPost = exports.removePostMedia = exports.findPosts = exports.findPostById = exports.findArchivedPostByUserId = exports.findArchivedPostById = exports.findPostByUserId = exports.removeTempPostByTrackId = exports.moveTempPost = exports.saveTempPost = exports.saveDeletedPost = exports.saveArchivedPost = exports.moveExpiredPosts = exports.savePost = void 0;
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
const typeorm_1 = require("typeorm");
const cloudinaryUtils_1 = require("../../../utils/cloudinaryUtils");
const ErrorHandler_1 = __importDefault(require("../../../utils/ErrorHandler"));
const logger_1 = __importDefault(require("../../../utils/logger"));
const service_1 = require("../locations/service");
const service_2 = require("../users/service");
const ArchivePost_1 = require("./models/ArchivePost");
const DeletedPost_1 = require("./models/DeletedPost");
const Post_1 = require("./models/Post");
const TempPost_1 = require("./models/TempPost");
const savePost = (postInfo, user, typeOfCredit) => __awaiter(void 0, void 0, void 0, function* () {
    const today = new Date();
    const oneMonthFromToday = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate(), today.getHours(), today.getMinutes(), today.getSeconds());
    const newPost = Post_1.Post.create({
        title: postInfo.title,
        city_id: postInfo.cityId,
        city_title: postInfo.cityTitle,
        state_id: postInfo.stateId,
        state_title: postInfo.stateTitle,
        property_id: postInfo.propertyId,
        property_title: postInfo.propertyTitle,
        category_id: postInfo.categoryId,
        category_title: postInfo.categoryTitle,
        price: postInfo.price,
        description: postInfo.description,
        expiry_date: oneMonthFromToday,
        media: postInfo.media,
        is_sticky: typeOfCredit === 'sticky',
        credit_type: typeOfCredit,
        user,
    });
    const post = yield Post_1.Post.save(newPost);
    yield (0, service_1.updateLocationCountValue)(postInfo.cityId, 'increment');
    return post;
});
exports.savePost = savePost;
const saveArchivedPost = (postInfo, user) => __awaiter(void 0, void 0, void 0, function* () {
    const newPost = ArchivePost_1.ArchivePost.create({
        title: postInfo.title,
        city_id: postInfo.city_id,
        city_title: postInfo.city_title,
        state_id: postInfo.state_id,
        state_title: postInfo.state_title,
        property_id: postInfo.property_id,
        property_title: postInfo.property_title,
        category_id: postInfo.category_id,
        category_title: postInfo.category_title,
        price: postInfo.price,
        description: postInfo.description,
        expiry_date: postInfo.expiry_date,
        is_reposted: postInfo.is_reposted,
        repost_count: postInfo.repost_count,
        media: postInfo.media,
        is_sticky: false,
        credit_type: postInfo.credit_type,
        user,
    });
    yield ArchivePost_1.ArchivePost.save(newPost);
});
exports.saveArchivedPost = saveArchivedPost;
const saveDeletedPost = (postInfo, user) => __awaiter(void 0, void 0, void 0, function* () {
    const newPost = DeletedPost_1.DeletedPost.create({
        title: postInfo.title,
        city_id: postInfo.city_id,
        city_title: postInfo.city_title,
        state_id: postInfo.state_id,
        state_title: postInfo.state_title,
        property_id: postInfo.property_id,
        property_title: postInfo.property_title,
        category_id: postInfo.category_id,
        category_title: postInfo.category_title,
        price: postInfo.price,
        description: postInfo.description,
        expiry_date: postInfo.expiry_date,
        media: postInfo.media,
        is_sticky: false,
        credit_type: postInfo.credit_type,
        is_reposted: postInfo.is_reposted,
        repost_count: postInfo.repost_count,
        user,
    });
    yield (0, service_1.updateLocationCountValue)(postInfo.city_id, 'decrement');
    yield DeletedPost_1.DeletedPost.save(newPost);
});
exports.saveDeletedPost = saveDeletedPost;
const saveTempPost = (postInfo, user, typeOfCredit) => __awaiter(void 0, void 0, void 0, function* () {
    const today = new Date();
    const oneMonthFromToday = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate(), today.getHours(), today.getMinutes(), today.getSeconds());
    const newPost = TempPost_1.TempPost.create({
        track_id: postInfo.trackId,
        title: postInfo.title,
        city_id: postInfo.cityId,
        city_title: postInfo.cityTitle,
        state_id: postInfo.stateId,
        state_title: postInfo.stateTitle,
        property_id: postInfo.propertyId,
        property_title: postInfo.propertyTitle,
        category_id: postInfo.categoryId,
        category_title: postInfo.categoryTitle,
        price: postInfo.price,
        description: postInfo.description,
        expiry_date: oneMonthFromToday,
        media: postInfo.media,
        is_sticky: typeOfCredit === 'sticky',
        credit_type: typeOfCredit,
        user,
    });
    const newTempPost = yield TempPost_1.TempPost.save(newPost);
    return newTempPost;
});
exports.saveTempPost = saveTempPost;
const removePostMedia = (id, post) => __awaiter(void 0, void 0, void 0, function* () {
    let result;
    if (!post) {
        const postObj = yield Post_1.Post.find({ where: { id }, select: { media: true }, relations: [] });
        // eslint-disable-next-line prefer-destructuring
        result = postObj && postObj.length ? postObj[0].media : undefined;
    }
    else
        result = post === null || post === void 0 ? void 0 : post.media;
    if (result && result.length) {
        for (const multimedia of result) {
            yield (0, cloudinaryUtils_1.deleteMediaFromCloudinary)(multimedia, 'posts');
        }
    }
});
exports.removePostMedia = removePostMedia;
const removePost = (id, post) => __awaiter(void 0, void 0, void 0, function* () {
    yield Post_1.Post.delete(id);
    yield removePostMedia(id, post);
});
exports.removePost = removePost;
const removeArchivedPost = (id, post) => __awaiter(void 0, void 0, void 0, function* () {
    yield ArchivePost_1.ArchivePost.delete(id);
    yield removePostMedia(id, post);
});
exports.removeArchivedPost = removeArchivedPost;
const moveExpiredPosts = () => __awaiter(void 0, void 0, void 0, function* () {
    const expiredPosts = yield Post_1.Post.find({ where: { expiry_date: (0, typeorm_1.LessThan)(new Date()) } });
    expiredPosts.forEach((post) => __awaiter(void 0, void 0, void 0, function* () {
        yield removePost(post.id, post);
        yield saveArchivedPost(post, post.user);
        yield (0, service_1.updateLocationCountValue)(post.city_id, 'decrement');
    }));
    return expiredPosts;
});
exports.moveExpiredPosts = moveExpiredPosts;
const removeTempPost = (id) => __awaiter(void 0, void 0, void 0, function* () {
    yield TempPost_1.TempPost.delete(id);
});
const removeTempPostByTrackId = (track_id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const post = yield TempPost_1.TempPost.findOneBy({ track_id });
        if (!post)
            throw new ErrorHandler_1.default(500, 'Something went wrong');
        if (post.media && post.media.length) {
            for (const multimedia of post.media) {
                yield (0, cloudinaryUtils_1.deleteMediaFromCloudinary)(multimedia, 'posts');
            }
        }
        yield TempPost_1.TempPost.remove(post);
    }
    catch (error) {
        logger_1.default.error(`${error.name} ${error.message}`);
    }
});
exports.removeTempPostByTrackId = removeTempPostByTrackId;
const moveTempPost = (track_id) => __awaiter(void 0, void 0, void 0, function* () {
    const post = yield TempPost_1.TempPost.findOne({ where: { track_id } });
    if (!post)
        throw new ErrorHandler_1.default(500, 'Something went wrong');
    const user = yield (0, service_2.findUserById)(post === null || post === void 0 ? void 0 : post.user.id);
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
    yield savePost(postInfo, user, 'sticky');
    yield removeTempPost(post.id);
});
exports.moveTempPost = moveTempPost;
const findPostByUserId = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const posts = yield Post_1.Post.find({ where: { user: { id: userId } } });
    // eslint-disable-next-line no-param-reassign
    posts.forEach((post) => delete post.user);
    return posts;
});
exports.findPostByUserId = findPostByUserId;
const findArchivedPostByUserId = (limit, offset, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const archivePosts = yield ArchivePost_1.ArchivePost.find({
        where: { user: { id: userId } },
        take: limit,
        skip: offset,
    });
    let archiveCount;
    if (offset === 0)
        archiveCount = yield ArchivePost_1.ArchivePost.count({ where: { user: { id: userId } } });
    // eslint-disable-next-line no-param-reassign
    archivePosts.forEach((post) => delete post.user);
    return { archivePosts, archiveCount };
});
exports.findArchivedPostByUserId = findArchivedPostByUserId;
const findPostById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const post = yield Post_1.Post.findOneBy({ id });
    if (post) {
        post.phone = (_a = post === null || post === void 0 ? void 0 : post.user) === null || _a === void 0 ? void 0 : _a.phone;
        post === null || post === void 0 ? true : delete post.user;
    }
    return post;
});
exports.findPostById = findPostById;
const findArchivedPostById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const post = yield ArchivePost_1.ArchivePost.findOneBy({ id });
    post === null || post === void 0 ? true : delete post.user;
    return post;
});
exports.findArchivedPostById = findArchivedPostById;
const updatePost = (postInfo, postId) => __awaiter(void 0, void 0, void 0, function* () {
    const post = yield findPostById(postId);
    if (!post)
        throw new ErrorHandler_1.default(500, 'Something went wrong');
    const newPost = yield Post_1.Post.save(Object.assign(Object.assign({}, post), { city_id: postInfo.cityId, city_title: postInfo.cityTitle, state_id: postInfo.stateId, state_title: postInfo.stateTitle, property_id: postInfo.propertyId, property_title: postInfo.propertyTitle, category_id: postInfo.categoryId, category_title: postInfo.categoryTitle, price: postInfo.price, description: postInfo.description, media: postInfo.media }));
    yield (0, service_1.updateLocationCountValue)(postInfo.cityId, 'increment');
    return newPost;
});
exports.updatePost = updatePost;
const updatePostStickyVal = (post, isSticky) => __awaiter(void 0, void 0, void 0, function* () {
    const newPost = Post_1.Post.create(Object.assign(Object.assign({}, post), { is_sticky: isSticky }));
    yield Post_1.Post.save(newPost);
});
exports.updatePostStickyVal = updatePostStickyVal;
const updatePostViewCount = (id, count) => __awaiter(void 0, void 0, void 0, function* () {
    const post = yield Post_1.Post.findOneBy({ id });
    if (!post)
        throw new ErrorHandler_1.default(404, 'Post not found');
    const viewCount = post.views + count;
    yield Post_1.Post.save(Object.assign(Object.assign({}, post), { views: viewCount }));
});
exports.updatePostViewCount = updatePostViewCount;
const updatePostRepostVals = (post, isReposted, repostCount) => __awaiter(void 0, void 0, void 0, function* () {
    const newPost = Post_1.Post.create(Object.assign(Object.assign({}, post), { is_reposted: isReposted, repost_count: repostCount }));
    yield Post_1.Post.save(newPost);
});
exports.updatePostRepostVals = updatePostRepostVals;
const findPosts = (limit, offset, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const queryOptions = {
        order: {
            is_sticky: 'DESC',
            created_at: 'DESC',
        },
        take: limit,
        skip: offset,
    };
    if (userId) {
        queryOptions.where = { user: { id: userId } };
    }
    const posts = yield Post_1.Post.find(queryOptions);
    let count;
    if (offset === 0 && userId)
        count = yield Post_1.Post.count({ where: { user: { id: userId } } });
    else if (offset === 0 && !userId)
        count = yield Post_1.Post.count();
    // eslint-disable-next-line no-param-reassign
    posts.forEach((post) => delete post.user);
    return { posts, count };
});
exports.findPosts = findPosts;
const searchPosts = (limit, offset, city, stateId, propertyId, categoryId, priceRange, keyword) => __awaiter(void 0, void 0, void 0, function* () {
    const searchCriteria = {};
    if (categoryId) {
        searchCriteria.category_id = categoryId;
    }
    if (propertyId) {
        searchCriteria.property_id = propertyId;
    }
    if (city === null || city === void 0 ? void 0 : city.length) {
        searchCriteria.city_id = (0, typeorm_1.In)(city.map((l) => l.id));
    }
    if (stateId) {
        searchCriteria.state_id = stateId;
    }
    if (priceRange) {
        searchCriteria.price = (0, typeorm_1.IsNull)() || (0, typeorm_1.Between)(priceRange.min, priceRange.max);
    }
    if (keyword) {
        searchCriteria.city_title = (0, typeorm_1.Like)(`%${keyword}%`);
        searchCriteria.state_title = (0, typeorm_1.Like)(`%${keyword}%`);
        searchCriteria.category_title = (0, typeorm_1.Like)(`%${keyword}%`);
        searchCriteria.property_title = (0, typeorm_1.Like)(`%${keyword}%`);
    }
    const [posts, count] = yield Post_1.Post.findAndCount({
        where: searchCriteria,
        order: {
            is_sticky: 'DESC',
            created_at: 'DESC',
        },
        take: limit,
        skip: offset,
    });
    let postIds = [];
    posts.forEach((post) => {
        postIds = [...postIds, post.id];
    });
    if (postIds.length)
        yield Post_1.Post.update({ id: (0, typeorm_1.In)(postIds) }, { views: () => 'views + .5' });
    return { posts, count };
});
exports.searchPosts = searchPosts;
//# sourceMappingURL=service.js.map