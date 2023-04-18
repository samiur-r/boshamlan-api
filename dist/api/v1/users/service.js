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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLastActivity = exports.updateUser = exports.findUserWithAgentInfo = exports.filterUsersForAdmin = exports.findUnVerifiedUsers = exports.updateBulkIsUserAnAgent = exports.updateIsUserAnAgent = exports.updateUserPassword = exports.updateUserStatus = exports.saveUser = exports.findUserByPhone = exports.findUserById = void 0;
const typeorm_1 = require("typeorm");
const passwordUtils_1 = require("../../../utils/passwordUtils");
const model_1 = require("./model");
const findUserById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield model_1.User.findOneBy({ id });
    return user;
});
exports.findUserById = findUserById;
const findUserByPhone = (phone) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield model_1.User.findOneBy({ phone });
    return user;
});
exports.findUserByPhone = findUserByPhone;
const saveUser = (phone, hashedPassword, status) => __awaiter(void 0, void 0, void 0, function* () {
    const newUser = model_1.User.create({
        phone,
        password: hashedPassword,
        status,
    });
    const user = yield model_1.User.save(newUser);
    return user;
});
exports.saveUser = saveUser;
const updateUserStatus = (id, status) => __awaiter(void 0, void 0, void 0, function* () {
    const userObj = yield model_1.User.findOneBy({ id });
    const user = yield model_1.User.save(Object.assign(Object.assign({}, userObj), { status }));
    return user;
});
exports.updateUserStatus = updateUserStatus;
const updateUserPassword = (userObj, password) => __awaiter(void 0, void 0, void 0, function* () {
    const hashedPassword = yield (0, passwordUtils_1.hashPassword)(password);
    yield model_1.User.save(Object.assign(Object.assign({}, userObj), { password: hashedPassword }));
});
exports.updateUserPassword = updateUserPassword;
const updateIsUserAnAgent = (id, isAgent) => __awaiter(void 0, void 0, void 0, function* () {
    const userObj = yield model_1.User.findOneBy({ id });
    const user = yield model_1.User.save(Object.assign(Object.assign({}, userObj), { is_agent: isAgent }));
    return user;
});
exports.updateIsUserAnAgent = updateIsUserAnAgent;
const updateBulkIsUserAnAgent = (ids, status) => __awaiter(void 0, void 0, void 0, function* () {
    yield model_1.User.update({ id: (0, typeorm_1.In)(ids) }, { is_agent: status });
});
exports.updateBulkIsUserAnAgent = updateBulkIsUserAnAgent;
const getLastActivity = (user) => {
    user.posts.sort((a, b) => a.created_at.getTime() - b.created_at.getTime());
    return user.posts[0].created_at;
};
exports.getLastActivity = getLastActivity;
const findUnVerifiedUsers = () => __awaiter(void 0, void 0, void 0, function* () {
    const lessThanFiveMins = new Date(Date.now() - 1 * 60 * 1000); // 5 minutes ago
    const users = yield model_1.User.find({ where: { status: 'not_verified', created_at: (0, typeorm_1.MoreThan)(lessThanFiveMins) } });
    return users;
});
exports.findUnVerifiedUsers = findUnVerifiedUsers;
const filterUsersForAdmin = (statusToFilter, phoneToFilter, adminCommentToFilter, fromCreationDateToFilter, toCreationDateToFilter, orderByToFilter, offset) => __awaiter(void 0, void 0, void 0, function* () {
    let where = {};
    let order = 'user.created_at';
    if (statusToFilter) {
        switch (statusToFilter) {
            case 'User':
                where.is_agent = false;
                break;
            case 'Agent':
                where.is_agent = true;
                break;
            case 'Verified':
                where.status = 'verified';
                break;
            case 'Not Verified':
                where.status = 'not_verified';
                break;
            case 'Has Regular Credits':
                where = 'credits.regular > 0';
                break;
            case 'Has Sticky Credits':
                where = 'credits.sticky > 0';
                break;
            case 'Has Agent Credits':
                where = 'credits.agent > 0';
                break;
            case 'Zero Free':
                where = 'credits.free = 0';
                break;
            default:
                break;
        }
    }
    if (phoneToFilter)
        where.phone = phoneToFilter;
    if (adminCommentToFilter)
        where.admin_comment = adminCommentToFilter;
    if (fromCreationDateToFilter && toCreationDateToFilter)
        where.created_at = (0, typeorm_1.Between)(fromCreationDateToFilter, toCreationDateToFilter);
    else if (fromCreationDateToFilter)
        where.created_at = (0, typeorm_1.MoreThanOrEqual)(fromCreationDateToFilter);
    else if (toCreationDateToFilter)
        where.created_at = (0, typeorm_1.LessThanOrEqual)(toCreationDateToFilter);
    if (orderByToFilter) {
        switch (orderByToFilter) {
            case 'Registered':
                order = 'user.created_at';
                break;
            case 'Total Posts':
                order = 'total_posts';
                break;
            case 'Active Posts':
                order = 'total_active_posts';
                break;
            case 'Archived Posts':
                order = 'total_archive_post';
                break;
            case 'Trashed Posts':
                order = 'total_deleted_post';
                break;
            case 'Mobile':
                order = 'user.phone';
                break;
            default:
                break;
        }
    }
    const count = yield model_1.User.createQueryBuilder('user')
        .leftJoinAndSelect('user.posts', 'post')
        .leftJoinAndSelect('user.archive_posts', 'archive_post')
        .leftJoinAndSelect('user.deleted_posts', 'deleted_post')
        .leftJoinAndSelect('user.credits', 'credits')
        .leftJoinAndSelect('user.transactions', 'transactions')
        .leftJoinAndSelect('user.agent', 'agent')
        .where(where)
        .getCount();
    const users = yield model_1.User.createQueryBuilder('user')
        .leftJoinAndSelect('user.posts', 'post')
        .leftJoinAndSelect('user.archive_posts', 'archive_post')
        .leftJoinAndSelect('user.deleted_posts', 'deleted_post')
        .leftJoinAndSelect('user.credits', 'credits')
        .leftJoinAndSelect('user.transactions', 'transactions')
        .leftJoinAndSelect('transactions.package', 'package')
        .leftJoinAndSelect('user.agent', 'agent')
        .addSelect('COUNT(post.id) + COUNT(archive_post.id) + COUNT(deleted_post.id)', 'total_posts')
        .addSelect('COUNT(post.id)', 'total_active_posts')
        .addSelect('COUNT(archive_post.id)', 'total_archive_post')
        .addSelect('COUNT(deleted_post.id)', 'total_deleted_post')
        .groupBy('user.id, post.id, archive_post.id, deleted_post.id, credits.id, transactions.id, package.id, agent.id')
        .orderBy(order, 'DESC')
        .where(where)
        .skip(offset)
        .take(10)
        .getMany();
    return { users, count };
});
exports.filterUsersForAdmin = filterUsersForAdmin;
const findUserWithAgentInfo = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userWithAgentInfo = yield model_1.User.findOne({
        where: { id: userId },
        relations: ['agent'],
    });
    if (userWithAgentInfo)
        userWithAgentInfo === null || userWithAgentInfo === void 0 ? true : delete userWithAgentInfo.password;
    if (userWithAgentInfo && userWithAgentInfo.agent.length)
        (_a = userWithAgentInfo === null || userWithAgentInfo === void 0 ? void 0 : userWithAgentInfo.agent[0]) === null || _a === void 0 ? true : delete _a.user.password;
    return userWithAgentInfo;
});
exports.findUserWithAgentInfo = findUserWithAgentInfo;
const updateUser = (userObj, phone, adminComment, password) => __awaiter(void 0, void 0, void 0, function* () {
    const updatedUser = yield model_1.User.save(Object.assign(Object.assign({}, userObj), { phone, admin_comment: adminComment }));
    if (password) {
        yield updateUserPassword(updatedUser, password);
    }
});
exports.updateUser = updateUser;
//# sourceMappingURL=service.js.map