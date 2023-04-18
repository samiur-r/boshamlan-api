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
exports.unstickPost = exports.findDeletedPostById = exports.removeAllPostsOfUser = exports.filterPostsForAdmin = exports.searchPosts = exports.updatePostViewCount = exports.updatePostRepostVals = exports.updatePostStickyVal = exports.updateDeletedPost = exports.updateArchivePost = exports.updatePost = exports.removePost = exports.removeArchivedPost = exports.removePostMedia = exports.findPosts = exports.findPostById = exports.findArchivedPostByUserId = exports.findArchivedPostById = exports.findPostByUserId = exports.removeTempPostByTrackId = exports.moveTempPost = exports.saveTempPost = exports.saveDeletedPost = exports.saveArchivedPost = exports.moveExpiredPosts = exports.savePost = exports.generatePostId = void 0;
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
const savePost = (postInfo, user, typeOfCredit, publicDate) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
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
        public_date: publicDate,
        sticked_date: typeOfCredit === 'sticky' ? today : undefined,
        media: postInfo.media,
        is_sticky: typeOfCredit === 'sticky',
        credit_type: typeOfCredit,
        views: (_a = postInfo.views) !== null && _a !== void 0 ? _a : 0,
        repost_count: (_b = postInfo.repost_count) !== null && _b !== void 0 ? _b : 0,
        post_type: 'active',
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
        user,
    });
    yield DeletedPost_1.DeletedPost.save(newPost);
    yield (0, service_1.updateLocationCountValue)(postInfo.city_id, 'decrement');
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
    const affectedPostIds = affectedPosts.map((post) => post.id);
    if (affectedPostIds && affectedPostIds.length) {
        for (const id of affectedPostIds) {
            yield (0, service_3.saveUserLog)([
                {
                    post_id: id,
                    transaction: undefined,
                    user: undefined,
                    activity: 'Post un sticked',
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
    const publicDate = new Date();
    yield savePost(postInfo, user, 'sticky', publicDate);
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
    const oneMonthFromToday = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate(), today.getHours(), today.getMinutes(), today.getSeconds());
    const oneWeekFromToday = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7, today.getHours(), today.getMinutes(), today.getSeconds());
    const newPost = Post_1.Post.create(Object.assign(Object.assign({}, post), { sticked_date: isSticky ? today : undefined, sticky_expires: isSticky ? oneWeekFromToday : undefined, expiry_date: oneMonthFromToday, is_sticky: isSticky }));
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
const filterPostsForAdmin = (locationToFilter, categoryToFilter, propertyTypeToFilter, fromPriceToFilter, toPriceToFilter, fromCreationDateToFilter, toCreationDateToFilter, stickyStatusToFilter, userTypeToFilter, orderByToFilter, postStatusToFilter, userId, offset) => __awaiter(void 0, void 0, void 0, function* () {
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
        where.created_at = {
            '>=': fromCreationDateToFilter,
            '<=': toCreationDateToFilter,
        };
    }
    else if (fromCreationDateToFilter) {
        where.created_at = {
            '>=': fromCreationDateToFilter,
        };
    }
    else if (toCreationDateToFilter) {
        where.created_at = {
            '<=': toCreationDateToFilter,
        };
    }
    if (stickyStatusToFilter === -1)
        where.is_sticky = false;
    else if (stickyStatusToFilter === 1)
        where.is_sticky = true;
    if (userTypeToFilter && userTypeToFilter === 'regular')
        where.is_agent = false;
    else if (userTypeToFilter && userTypeToFilter === 'agent')
        where.is_agent = true;
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
            order.created_at = 'DESC';
            break;
        case 'Sticked':
            order.is_sticky = 'DESC';
            break;
        case 'Repost Date':
            order.repost_date = 'DESC';
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
            order.created_at = 'DESC';
            break;
    }
    try {
        const whereClause = Object.entries(where)
            .map(([key, value]) => {
            if (key === 'is_agent') {
                return `users.${key} = ${value}`;
            }
            if (key === 'created_at') {
                const from = value['>='] && new Date(value['>=']).toISOString();
                const to = value['<='] && new Date(value['<=']).toISOString();
                if (from && to) {
                    return `created_at BETWEEN '${from}' AND '${to}'`;
                }
                if (from) {
                    return `created_at >= '${from}'`;
                }
                if (to) {
                    return `created_at <= '${to}'`;
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
        const query = `SELECT latest_posts.*, (SELECT COUNT(*) FROM (
        SELECT id, title, user_id, post_type, city_id, city_title, category_id, category_title, property_id, property_title, price, description, is_sticky, is_reposted, repost_count, sticked_date, sticky_expires, repost_date, public_date, expiry_date, created_at, updated_at, deleted_at
        FROM posts
        UNION ALL
        SELECT id, title, user_id, post_type, city_id, city_title, category_id, category_title, property_id, property_title, price, description, is_sticky, is_reposted, repost_count, sticked_date, sticky_expires, repost_date, public_date, expiry_date, created_at, updated_at, deleted_at
        FROM archive_posts
        UNION ALL
        SELECT id, title, user_id, post_type, city_id, city_title, category_id, category_title, property_id, property_title, price, description, is_sticky, is_reposted, repost_count, sticked_date, sticky_expires, repost_date, public_date, expiry_date, created_at, updated_at, deleted_at
        FROM deleted_posts
      ) AS latest_posts_count
      ${whereClause ? `WHERE ${whereClause}` : ''}
      ) AS total_count,
        users.id as user_id,
        users.phone as user_phone,
        users.is_agent as user_is_agent
      FROM (
        SELECT posts.id, posts.user_id, posts.post_type, posts.title, posts.city_id, posts.city_title, posts.category_id, posts.category_title, posts.property_id, posts.property_title, posts.price, posts.description, posts.is_sticky, posts.is_reposted, posts.repost_count, posts.sticked_date, posts.sticky_expires, posts.repost_date, posts.public_date, posts.expiry_date, posts.created_at, posts.updated_at, posts.deleted_at
        FROM posts
        UNION ALL
        SELECT archive_posts.id, archive_posts.user_id, archive_posts.post_type, archive_posts.title, archive_posts.city_id, archive_posts.city_title, archive_posts.category_id, archive_posts.category_title, archive_posts.property_id, archive_posts.property_title, archive_posts.price, archive_posts.description, archive_posts.is_sticky, archive_posts.is_reposted, archive_posts.repost_count, archive_posts.sticked_date, archive_posts.sticky_expires, archive_posts.repost_date, archive_posts.public_date, archive_posts.expiry_date, archive_posts.created_at, archive_posts.updated_at, archive_posts.deleted_at
        FROM archive_posts
        UNION ALL
        SELECT deleted_posts.id,  deleted_posts.user_id, deleted_posts.post_type, deleted_posts.title, deleted_posts.city_id, deleted_posts.city_title, deleted_posts.category_id, deleted_posts.category_title, deleted_posts.property_id, deleted_posts.property_title, deleted_posts.price, deleted_posts.description, deleted_posts.is_sticky, deleted_posts.is_reposted, deleted_posts.repost_count, deleted_posts.sticked_date, deleted_posts.sticky_expires, deleted_posts.repost_date, deleted_posts.public_date, deleted_posts.expiry_date, deleted_posts.created_at, deleted_posts.updated_at, deleted_posts.deleted_at
        FROM deleted_posts
      ) AS latest_posts
        LEFT JOIN users ON latest_posts.user_id = users.id
        ${whereClause ? `WHERE ${whereClause}` : ''}
        ORDER BY latest_posts.${Object.keys(order)[0]} DESC
        LIMIT 10
        OFFSET ${offset}
      `;
        const result = yield db_1.default.query(query);
        posts = result;
        totalPosts = result.length > 0 ? result[0].total_count : 0;
        posts === null || posts === void 0 ? void 0 : posts.forEach((post) => {
            var _a, _b;
            post.postedDate = (0, timestampUtls_1.parseTimestamp)(post.updated_at).parsedDate;
            post.postedTime = (0, timestampUtls_1.parseTimestamp)(post.updated_at).parsedTime;
            post.publicDate = (0, timestampUtls_1.parseTimestamp)(post.public_date).parsedDate;
            post.publicTime = (0, timestampUtls_1.parseTimestamp)(post.public_date).parsedTime;
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
    const totalPages = totalPosts ? Math.ceil(totalPosts / 10) : null;
    return { posts, totalPages };
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