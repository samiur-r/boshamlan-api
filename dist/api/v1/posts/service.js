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
exports.unstickPost = exports.findDeletedPostById = exports.removeAllPostsOfUser = exports.filterPostsForAdmin = exports.searchPosts = exports.updatePostViewCount = exports.updatePostRepostVals = exports.updatePostStickyVal = exports.updateDeletedPost = exports.updateArchivePost = exports.updatePost = exports.removePost = exports.removeDeletedPost = exports.removeArchivedPost = exports.removePostMedia = exports.findPosts = exports.findPostById = exports.findArchivedPostByUserId = exports.findArchivedPostById = exports.findPostByUserId = exports.removeTempPostByTrackId = exports.moveTempPost = exports.saveTempPost = exports.saveDeletedPost = exports.saveArchivedPost = exports.moveExpiredPosts = exports.savePost = exports.generatePostId = void 0;
/* eslint-disable no-param-reassign */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
const typeorm_1 = require("typeorm");
const cloudinary_1 = __importDefault(require("../../../config/cloudinary"));
const db_1 = __importDefault(require("../../../db"));
const cloudinaryUtils_1 = require("../../../utils/cloudinaryUtils");
const ErrorHandler_1 = __importDefault(require("../../../utils/ErrorHandler"));
const logger_1 = __importDefault(require("../../../utils/logger"));
const timestampUtls_1 = require("../../../utils/timestampUtls");
const service_1 = require("../locations/service");
const model_1 = require("../users/model");
const service_2 = require("../users/service");
const service_3 = require("../user_logs/service");
const ArchivePost_1 = require("./models/ArchivePost");
const DeletedPost_1 = require("./models/DeletedPost");
const Post_1 = require("./models/Post");
const TempPost_1 = require("./models/TempPost");
const generatePostId = () => __awaiter(void 0, void 0, void 0, function* () {
    const [maxPostId, maxArchivePostId, maxDeletedPostId] = yield Promise.all([
        Post_1.Post.createQueryBuilder('post').select('MAX(post.id)', 'maxId').getRawOne(),
        ArchivePost_1.ArchivePost.createQueryBuilder('archive_post').select('MAX(archive_post.id)', 'maxId').getRawOne(),
        DeletedPost_1.DeletedPost.createQueryBuilder('deleted_post').select('MAX(deleted_post.id)', 'maxId').getRawOne(),
    ]);
    const maxId = Math.max(maxPostId.maxId, maxArchivePostId.maxId, maxDeletedPostId.maxId) + 1;
    return maxId;
});
exports.generatePostId = generatePostId;
const savePost = (postInfo, user, typeOfCredit, postedDate, publicDate) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const today = new Date();
    // const oneMonthFromToday = new Date(
    //   today.getFullYear(),
    //   today.getMonth() + 1,
    //   today.getDate(),
    //   today.getHours(),
    //   today.getMinutes(),
    //   today.getSeconds(),
    // );
    // oneMonthFromToday.setMinutes(Math.ceil(oneMonthFromToday.getMinutes() / 30) * 30);
    // oneMonthFromToday.setSeconds(0);
    // oneMonthFromToday.setMilliseconds(0);
    const twoDaysFromToday = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, today.getHours(), today.getMinutes(), today.getSeconds());
    twoDaysFromToday.setMinutes(Math.ceil(twoDaysFromToday.getMinutes() / 30) * 30);
    twoDaysFromToday.setSeconds(0);
    twoDaysFromToday.setMilliseconds(0);
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
        expiry_date: twoDaysFromToday,
        posted_date: postedDate,
        public_date: publicDate,
        sticked_date: typeOfCredit === 'sticky' ? today : undefined,
        media: postInfo.media,
        is_sticky: typeOfCredit === 'sticky',
        credit_type: typeOfCredit,
        views: (_a = postInfo.views) !== null && _a !== void 0 ? _a : 0,
        repost_count: (_b = postInfo.repost_count) !== null && _b !== void 0 ? _b : 0,
        post_type: 'active',
        created_at: today,
        user,
    });
    if (postInfo.id !== undefined) {
        newPost.id = postInfo.id;
    }
    else {
        newPost.id = yield generatePostId();
    }
    const post = yield Post_1.Post.save(newPost);
    yield (0, service_1.updateLocationCountValue)(postInfo.cityId, 'increment');
    return post;
});
exports.savePost = savePost;
const saveArchivedPost = (postInfo, user) => __awaiter(void 0, void 0, void 0, function* () {
    if (!postInfo.id)
        throw new ErrorHandler_1.default(401, 'Post id is required');
    const newPost = ArchivePost_1.ArchivePost.create({
        id: postInfo.id,
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
        posted_date: postInfo.posted_date,
        public_date: postInfo.public_date,
        sticked_date: postInfo.sticked_date,
        repost_date: postInfo.repost_date,
        repost_count: postInfo.repost_count,
        media: postInfo.media,
        credit_type: postInfo.credit_type,
        views: postInfo.views,
        updated_at: postInfo.updated_at,
        post_type: 'archived',
        user,
    });
    yield ArchivePost_1.ArchivePost.save(newPost);
});
exports.saveArchivedPost = saveArchivedPost;
const saveDeletedPost = (postInfo, user) => __awaiter(void 0, void 0, void 0, function* () {
    if (!postInfo.id)
        throw new ErrorHandler_1.default(401, 'Post id is required');
    const today = new Date();
    const newPost = DeletedPost_1.DeletedPost.create({
        id: postInfo.id,
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
        posted_date: postInfo.posted_date,
        public_date: postInfo.public_date,
        sticked_date: postInfo.sticked_date,
        repost_date: postInfo.repost_date,
        media: postInfo.media,
        credit_type: postInfo.credit_type,
        repost_count: postInfo.repost_count,
        views: postInfo.views,
        deleted_at: today,
        updated_at: postInfo.updated_at,
        post_type: 'deleted',
        is_sticky: postInfo.is_sticky,
        sticky_expires: postInfo.sticky_expires,
        user,
    });
    yield DeletedPost_1.DeletedPost.save(newPost);
    yield (0, service_1.updateLocationCountValue)(postInfo.city_id, 'decrement');
});
exports.saveDeletedPost = saveDeletedPost;
const saveTempPost = (postInfo, user, typeOfCredit) => __awaiter(void 0, void 0, void 0, function* () {
    const today = new Date();
    // const oneMonthFromToday = new Date(
    //   today.getFullYear(),
    //   today.getMonth() + 1,
    //   today.getDate(),
    //   today.getHours(),
    //   today.getMinutes(),
    //   today.getSeconds(),
    // );
    const twoDaysFromToday = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, today.getHours(), today.getMinutes(), today.getSeconds());
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
        expiry_date: twoDaysFromToday,
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
const removeDeletedPost = (id) => __awaiter(void 0, void 0, void 0, function* () {
    yield DeletedPost_1.DeletedPost.delete(id);
});
exports.removeDeletedPost = removeDeletedPost;
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
const unstickPost = () => __awaiter(void 0, void 0, void 0, function* () {
    const affectedPosts = yield Post_1.Post.find({
        where: { is_sticky: true, sticky_expires: (0, typeorm_1.LessThan)(new Date()) },
    });
    const updatedPosts = affectedPosts.map((post) => {
        post.is_sticky = false;
        // @ts-ignore
        post.sticky_expires = null;
        return post;
    });
    yield Post_1.Post.save(updatedPosts);
    if (affectedPosts && affectedPosts.length) {
        for (const post of affectedPosts) {
            logger_1.default.info(`Post ${post.id} un sticked`);
            yield (0, service_3.saveUserLog)([
                {
                    post_id: post.id,
                    transaction: undefined,
                    user: post.user.phone,
                    activity: `Post ${post.id} un sticked`,
                },
            ]);
        }
    }
});
exports.unstickPost = unstickPost;
const moveExpiredPosts = () => __awaiter(void 0, void 0, void 0, function* () {
    const expiredPosts = yield Post_1.Post.find({ where: { expiry_date: (0, typeorm_1.LessThan)(new Date()) } });
    expiredPosts.forEach((post) => __awaiter(void 0, void 0, void 0, function* () {
        yield removePost(post.id, post);
        yield saveArchivedPost(post, post.user);
        yield (0, service_1.updateLocationCountValue)(post.city_id, 'decrement');
        logger_1.default.info(`Post ${post.id} by user ${post.user.phone} has archived`);
        yield (0, service_3.saveUserLog)([
            {
                post_id: post.id,
                transaction: undefined,
                user: post.user.phone,
                activity: `Post ${post.id} by user ${post.user.phone} has archived`,
            },
        ]);
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
    const postedDate = new Date();
    const publicDate = new Date();
    yield savePost(postInfo, user, 'sticky', postedDate, publicDate);
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
        order: { public_date: 'DESC' },
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
    var _c, _d;
    const post = yield Post_1.Post.findOneBy({ id });
    if (post) {
        post.phone = (_c = post === null || post === void 0 ? void 0 : post.user) === null || _c === void 0 ? void 0 : _c.phone;
        (_d = post === null || post === void 0 ? void 0 : post.user) === null || _d === void 0 ? true : delete _d.password;
    }
    return post;
});
exports.findPostById = findPostById;
const findArchivedPostById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    var _e, _f;
    const post = yield ArchivePost_1.ArchivePost.findOneBy({ id });
    if (post) {
        post.phone = (_e = post === null || post === void 0 ? void 0 : post.user) === null || _e === void 0 ? void 0 : _e.phone;
        (_f = post === null || post === void 0 ? void 0 : post.user) === null || _f === void 0 ? true : delete _f.password;
    }
    return post;
});
exports.findArchivedPostById = findArchivedPostById;
const findDeletedPostById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    var _g, _h;
    const post = yield DeletedPost_1.DeletedPost.findOneBy({ id });
    if (post) {
        post.phone = (_g = post === null || post === void 0 ? void 0 : post.user) === null || _g === void 0 ? void 0 : _g.phone;
        (_h = post === null || post === void 0 ? void 0 : post.user) === null || _h === void 0 ? true : delete _h.password;
    }
    return post;
});
exports.findDeletedPostById = findDeletedPostById;
const updatePost = (postInfo, post) => __awaiter(void 0, void 0, void 0, function* () {
    yield Post_1.Post.save(Object.assign(Object.assign({}, post), { city_id: postInfo.cityId, city_title: postInfo.cityTitle, state_id: postInfo.stateId, state_title: postInfo.stateTitle, property_id: postInfo.propertyId, property_title: postInfo.propertyTitle, category_id: postInfo.categoryId, category_title: postInfo.categoryTitle, price: postInfo.price, description: postInfo.description, media: postInfo.media }));
    yield (0, service_1.updateLocationCountValue)(postInfo.cityId, 'increment');
    return post;
});
exports.updatePost = updatePost;
const updateArchivePost = (postInfo, post) => __awaiter(void 0, void 0, void 0, function* () {
    yield ArchivePost_1.ArchivePost.save(Object.assign(Object.assign({}, post), { city_id: postInfo.cityId, city_title: postInfo.cityTitle, state_id: postInfo.stateId, state_title: postInfo.stateTitle, property_id: postInfo.propertyId, property_title: postInfo.propertyTitle, category_id: postInfo.categoryId, category_title: postInfo.categoryTitle, price: postInfo.price, description: postInfo.description, media: postInfo.media }));
    return post;
});
exports.updateArchivePost = updateArchivePost;
const updateDeletedPost = (postInfo, post) => __awaiter(void 0, void 0, void 0, function* () {
    yield DeletedPost_1.DeletedPost.save(Object.assign(Object.assign({}, post), { city_id: postInfo.cityId, city_title: postInfo.cityTitle, state_id: postInfo.stateId, state_title: postInfo.stateTitle, property_id: postInfo.propertyId, property_title: postInfo.propertyTitle, category_id: postInfo.categoryId, category_title: postInfo.categoryTitle, price: postInfo.price, description: postInfo.description, media: postInfo.media }));
    return post;
});
exports.updateDeletedPost = updateDeletedPost;
const updatePostStickyVal = (post, isSticky) => __awaiter(void 0, void 0, void 0, function* () {
    const today = new Date();
    // const oneMonthFromToday = new Date(
    //   today.getFullYear(),
    //   today.getMonth() + 1,
    //   today.getDate(),
    //   today.getHours(),
    //   today.getMinutes(),
    //   today.getSeconds(),
    // );
    // const oneWeekFromToday = new Date(
    //   today.getFullYear(),
    //   today.getMonth(),
    //   today.getDate() + 7,
    //   today.getHours(),
    //   today.getMinutes(),
    //   today.getSeconds(),
    // );
    // const twentyThreeDaysFromToday = new Date(
    //   today.getFullYear(),
    //   today.getMonth(),
    //   today.getDate() + 23,
    //   today.getHours(),
    //   today.getMinutes(),
    //   today.getSeconds(),
    // );
    const twoDaysFromToday = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, today.getHours(), today.getMinutes(), today.getSeconds());
    twoDaysFromToday.setMinutes(Math.ceil(twoDaysFromToday.getMinutes() / 30) * 30);
    twoDaysFromToday.setSeconds(0);
    twoDaysFromToday.setMilliseconds(0);
    const oneDayFromToday = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, today.getHours(), today.getMinutes(), today.getSeconds());
    oneDayFromToday.setMinutes(Math.ceil(oneDayFromToday.getMinutes() / 30) * 30);
    oneDayFromToday.setSeconds(0);
    oneDayFromToday.setMilliseconds(0);
    const newPost = Post_1.Post.create(Object.assign(Object.assign({}, post), { sticked_date: isSticky ? today : undefined, sticky_expires: isSticky ? oneDayFromToday : undefined, expiry_date: isSticky ? twoDaysFromToday : oneDayFromToday, is_sticky: isSticky, public_date: isSticky ? today : post.public_date }));
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
    const today = new Date();
    const newPost = Post_1.Post.create(Object.assign(Object.assign({}, post), { is_reposted: isReposted, repost_count: repostCount, repost_date: isReposted ? today : undefined }));
    yield Post_1.Post.save(newPost);
});
exports.updatePostRepostVals = updatePostRepostVals;
const findPosts = (limit, offset, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const queryOptions = {
        order: {
            is_sticky: 'DESC',
            public_date: 'DESC',
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
            public_date: 'DESC',
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
const filterPostsForAdmin = (locationToFilter, categoryToFilter, propertyTypeToFilter, fromPriceToFilter, toPriceToFilter, fromCreationDateToFilter, toCreationDateToFilter, fromPublicDateToFilter, toPublicDateToFilter, stickyStatusToFilter, userTypeToFilter, orderByToFilter, postStatusToFilter, userId, offset) => __awaiter(void 0, void 0, void 0, function* () {
    let posts;
    let totalPosts;
    const where = {};
    const order = {};
    if (userId) {
        where.user_id = parseInt(userId, 10);
    }
    if (locationToFilter)
        where.city_id = locationToFilter;
    if (categoryToFilter)
        where.category_id = categoryToFilter;
    if (propertyTypeToFilter)
        where.property_id = propertyTypeToFilter;
    if (fromPriceToFilter && toPriceToFilter) {
        where.price = {
            '>=': fromPriceToFilter,
            '<=': toPriceToFilter,
        };
    }
    else if (fromPriceToFilter) {
        where.price = {
            '>=': fromPriceToFilter,
        };
    }
    else if (toPriceToFilter) {
        where.price = {
            '<=': toPriceToFilter,
        };
    }
    if (fromCreationDateToFilter && toCreationDateToFilter) {
        where.posted_date = {
            '>=': `${fromCreationDateToFilter} 00:00:00`,
            '<=': `${toCreationDateToFilter} 23:59:59`,
        };
    }
    else if (fromCreationDateToFilter) {
        where.posted_date = {
            '>=': `${fromCreationDateToFilter} 00:00:00`,
        };
    }
    else if (toCreationDateToFilter) {
        where.posted_date = {
            '<=': `${toCreationDateToFilter} 23:59:59`,
        };
    }
    if (fromPublicDateToFilter && toPublicDateToFilter) {
        where.public_date = {
            '>=': `${fromPublicDateToFilter} 00:00:00`,
            '<=': `${toPublicDateToFilter} 23:59:59`,
        };
    }
    else if (fromPublicDateToFilter) {
        where.public_date = {
            '>=': `${fromPublicDateToFilter} 00:00:00`,
        };
    }
    else if (toPublicDateToFilter) {
        where.public_date = {
            '<=': `${toPublicDateToFilter} 23:59:59`,
        };
    }
    if (stickyStatusToFilter === -1)
        where.is_sticky = false;
    else if (stickyStatusToFilter === 1)
        where.is_sticky = true;
    if (userTypeToFilter && userTypeToFilter === 'regular')
        where.user_is_agent = false;
    else if (userTypeToFilter && userTypeToFilter === 'agent')
        where.user_is_agent = true;
    if (postStatusToFilter) {
        switch (postStatusToFilter) {
            case 'Active':
                where.post_type = 'active';
                break;
            case 'Archived':
                where.post_type = 'archived';
                break;
            case 'Deleted':
                where.post_type = 'deleted';
                break;
            case 'Reposted':
                where.is_reposted = true;
                break;
            default:
                break;
        }
    }
    switch (orderByToFilter) {
        case 'Created':
            order.posted_date = 'DESC';
            break;
        case 'Public Date':
            order.public_date = 'DESC';
            break;
        case 'Sticked':
            order.is_sticky = 'DESC';
            break;
        case 'Repost Date':
            order.repost_date = 'DESC';
            break;
        case 'Repost Count':
            order.repost_count = 'DESC';
            break;
        case 'City':
            order.city_id = 'DESC';
            break;
        case 'Property Type':
            order.property_id = 'DESC';
            break;
        case 'Category':
            order.category_id = 'DESC';
            break;
        default:
            order.public_date = 'DESC';
            break;
    }
    try {
        const whereClause = Object.entries(where)
            .map(([key, value]) => {
            if (key === 'is_agent') {
                return `users.${key} = ${value}`;
            }
            if (key === 'posted_date') {
                const from = value['>='];
                const to = value['<='];
                if (from && to) {
                    return `latest_posts.posted_date >= '${from}' AND latest_posts.posted_date <= '${to}'`;
                }
                if (from) {
                    return `latest_posts.posted_date >= '${from}'`;
                }
                if (to) {
                    return `latest_posts.posted_date <= '${to}'`;
                }
            }
            if (key === 'public_date') {
                const from = value['>='];
                const to = value['<='];
                if (from && to) {
                    return `latest_posts.public_date >= '${from}' AND latest_posts.public_date <= '${to}'`;
                }
                if (from) {
                    return `latest_posts.public_date >= '${from}'`;
                }
                if (to) {
                    return `latest_posts.public_date <= '${to}'`;
                }
            }
            if (key === 'price') {
                const from = value['>='] && value['>='];
                const to = value['<='] && value['<='];
                if (from && to) {
                    return `price BETWEEN '${from}' AND '${to}'`;
                }
                if (from) {
                    return `price >= '${from}'`;
                }
                if (to) {
                    return `price <= '${to}'`;
                }
            }
            return `${key} = '${value}'`;
        })
            .join(' AND ');
        const postsQuery = Post_1.Post.createQueryBuilder('post')
            .select('post.id, post.user_id, post.post_type, post.title, post.city_id, post.city_title, post.category_id, post.category_title, post.property_id, post.property_title, post.price, post.description, post.is_sticky, post.is_reposted, post.repost_count, post.sticked_date, post.sticky_expires, post.repost_date, post.posted_date, post.public_date, post.expiry_date, post.created_at, post.updated_at, post.deleted_at')
            .addSelect('u.phone as user_phone, u.is_agent as user_is_agent')
            .leftJoin(model_1.User, 'u', 'post.user_id = u.id')
            .getQuery();
        const archivedPostsQuery = ArchivePost_1.ArchivePost.createQueryBuilder('post')
            .select('post.id, post.user_id, post.post_type, post.title, post.city_id, post.city_title, post.category_id, post.category_title, post.property_id, post.property_title, post.price, post.description, post.is_sticky, post.is_reposted, post.repost_count, post.sticked_date, post.sticky_expires, post.repost_date, post.posted_date, post.public_date, post.expiry_date, post.created_at, post.updated_at, post.deleted_at')
            .addSelect('u.phone as user_phone, u.is_agent as user_is_agent')
            .leftJoin(model_1.User, 'u', 'post.user_id = u.id')
            .getQuery();
        const deletedPostsQuery = DeletedPost_1.DeletedPost.createQueryBuilder('post')
            .select('post.id, post.user_id, post.post_type, post.title, post.city_id, post.city_title, post.category_id, post.category_title, post.property_id, post.property_title, post.price, post.description, post.is_sticky, post.is_reposted, post.repost_count, post.sticked_date, post.sticky_expires, post.repost_date, post.posted_date, post.public_date, post.expiry_date, post.created_at, post.updated_at, post.deleted_at')
            .addSelect('u.phone as user_phone, u.is_agent as user_is_agent')
            .leftJoin(model_1.User, 'u', 'post.user_id = u.id')
            .getQuery();
        const unionQuery = `(${postsQuery}) UNION (${archivedPostsQuery}) UNION (${deletedPostsQuery})`;
        const result = yield db_1.default.query(`
      SELECT *
      FROM (${unionQuery}) AS latest_posts
      ${whereClause ? `WHERE ${whereClause}` : ''}
      ORDER BY latest_posts.${Object.keys(order)[0]} DESC
      LIMIT 50
      OFFSET ${offset}
    `);
        const countResult = yield db_1.default.query(`
      SELECT COUNT(*) AS count
      FROM (${unionQuery}) AS latest_posts
      ${whereClause ? `WHERE ${whereClause}` : ''}
    `);
        const totalCount = countResult[0].count;
        posts = result;
        totalPosts = result.length > 0 ? totalCount : 0;
        posts === null || posts === void 0 ? void 0 : posts.forEach((post) => {
            var _a, _b;
            post.publicDate = (0, timestampUtls_1.parseTimestamp)(post.public_date).parsedDate;
            post.publicTime = (0, timestampUtls_1.parseTimestamp)(post.public_date).parsedTime;
            post.postedDate = (0, timestampUtls_1.parseTimestamp)(post.posted_date).parsedDate;
            post.postedTime = (0, timestampUtls_1.parseTimestamp)(post.posted_date).parsedTime;
            post.expiredDate = (0, timestampUtls_1.parseTimestamp)(post.expiry_date).parsedDate;
            post.expiredTime = (0, timestampUtls_1.parseTimestamp)(post.expiry_date).parsedTime;
            post.repostedDate = post.repost_date ? (0, timestampUtls_1.parseTimestamp)(post.repost_date).parsedDate : null;
            post.repostedTime = post.repost_date ? (0, timestampUtls_1.parseTimestamp)(post.repost_date).parsedTime : null;
            post.stickyDate = post.sticked_date ? (0, timestampUtls_1.parseTimestamp)(post.sticked_date).parsedDate : null;
            post.stickyTime = post.sticked_date ? (0, timestampUtls_1.parseTimestamp)(post.sticked_date).parsedTime : null;
            post.unStickDate = post.sticky_expires ? (0, timestampUtls_1.parseTimestamp)(post.sticky_expires).parsedDate : null;
            post.unStickTime = post.sticky_expires ? (0, timestampUtls_1.parseTimestamp)(post.sticky_expires).parsedTime : null;
            post.user_phone = (_b = (_a = post.user) === null || _a === void 0 ? void 0 : _a.phone) !== null && _b !== void 0 ? _b : post.user_phone;
            post.deletedDate = post.deleted_at ? (0, timestampUtls_1.parseTimestamp)(post.deleted_at).parsedDate : null;
            post.deletedTime = post.deleted_at ? (0, timestampUtls_1.parseTimestamp)(post.deleted_at).parsedTime : null;
            delete post.user;
        });
    }
    catch (error) {
        logger_1.default.error(`${error.name}: ${error.message}`);
    }
    const totalPages = totalPosts ? Math.ceil(totalPosts / 50) : null;
    return { posts, totalPages, totalResults: totalPosts };
});
exports.filterPostsForAdmin = filterPostsForAdmin;
const removeAllPostsOfUser = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const activePosts = yield findPostByUserId(userId);
    const archivedPosts = yield ArchivePost_1.ArchivePost.find({ where: { user: { id: userId } } });
    const user = yield (0, service_2.findUserById)(userId);
    if (!user)
        throw new ErrorHandler_1.default(500, 'Something went wrong');
    const allPosts = [...activePosts, ...archivedPosts];
    const mediaUrls = allPosts.reduce((acc, post) => [...acc, ...post.media], []);
    const promises = allPosts.map((post) => __awaiter(void 0, void 0, void 0, function* () {
        post.media = [];
        yield saveDeletedPost(post, user);
    }));
    yield Promise.allSettled(mediaUrls.map((url) => __awaiter(void 0, void 0, void 0, function* () {
        var _j;
        const publicId = (_j = url.split('/').pop()) === null || _j === void 0 ? void 0 : _j.split('.')[0];
        if (publicId)
            yield cloudinary_1.default.uploader.destroy(`posts/${publicId}`);
    })));
    yield Promise.all(promises);
    yield Post_1.Post.remove(activePosts);
    yield ArchivePost_1.ArchivePost.remove(archivedPosts);
});
exports.removeAllPostsOfUser = removeAllPostsOfUser;
//# sourceMappingURL=service.js.map