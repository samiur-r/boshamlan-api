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
exports.getLastActivity = exports.updateUser = exports.findUserWithAgentInfo = exports.filterUsersForAdmin = exports.findUnVerifiedUsers = exports.updateBulkIsUserAnAgent = exports.updateIsUserAnAgent = exports.updateUserPassword = exports.updateUserStatus = exports.saveUser = exports.findUserByPhone = exports.findUserById = void 0;
const typeorm_1 = require("typeorm");
const logger_1 = __importDefault(require("../../../utils/logger"));
const passwordUtils_1 = require("../../../utils/passwordUtils");
const timestampUtls_1 = require("../../../utils/timestampUtls");
const model_1 = require("./model");
const findUserById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield model_1.User.findOneBy({ id });
    return user;
});
exports.findUserById = findUserById;
const findUserByPhone = (phone) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield model_1.User.findOneBy({ phone });
        return user;
    }
    catch (error) {
        logger_1.default.error(`${error.name}: ${error.message}`);
        return null;
    }
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
    user.posts.sort((a, b) => b.public_date.getTime() - a.public_date.getTime());
    return user.posts[0].public_date;
};
exports.getLastActivity = getLastActivity;
const findUnVerifiedUsers = () => __awaiter(void 0, void 0, void 0, function* () {
    const lessThanFiveMins = new Date(Date.now() - 5 * 60 * 1000); // 5 minutes ago
    const users = yield model_1.User.find({ where: { status: 'not_verified', created_at: (0, typeorm_1.MoreThan)(lessThanFiveMins) } });
    return users;
});
exports.findUnVerifiedUsers = findUnVerifiedUsers;
const filterUsersForAdmin = (statusToFilter, phoneToFilter, adminCommentToFilter, fromCreationDateToFilter, toCreationDateToFilter, orderByToFilter, offset) => __awaiter(void 0, void 0, void 0, function* () {
    let where = {};
    let order = 'user.created_at';
    const today = (0, timestampUtls_1.getLocaleDate)(new Date());
    const yesterday = (0, timestampUtls_1.getLocaleDate)(new Date(new Date().setDate(new Date().getDate() - 1)));
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
                where = `(credits.free < 1 OR user.status = 'not_verified')`;
                break;
            case 'Active Today':
                where = `post.public_date BETWEEN '${today} 00:00:00' AND '${today} 23:59:59'`;
                break;
            case 'Active Yesterday':
                where = `post.public_date BETWEEN '${yesterday} 00:00:00' AND '${yesterday} 23:59:59'`;
                break;
            case 'Has Regular Credit History':
                where = `transactions.status = 'completed' AND (transactions.package_title = 'regular1' OR transactions.package_title = 'regular2')`;
                break;
            case 'Has Sticky Credit History':
                where = `transactions.status = 'completed' AND (transactions.package_title = 'sticky1' OR transactions.package_title = 'sticky2')`;
                break;
            case 'Has Direct Sticky Credit History':
                where = `transactions.status = 'completed' AND transactions.package_title = 'stickyDirect'`;
                break;
            case 'Has Agent History':
                where = `transactions.status = 'completed' AND (transactions.package_title = 'agent1' OR transactions.package_title = 'agent2')`;
                break;
            default:
                break;
        }
    }
    if (phoneToFilter) {
        if (typeof where === 'string')
            where = `${where} AND phone = ${phoneToFilter}`;
        else
            where.phone = phoneToFilter;
    }
    if (adminCommentToFilter) {
        if (typeof where === 'string')
            where = `${where} AND admin_comment LIKE '%${adminCommentToFilter}%'`;
        else
            where.admin_comment = (0, typeorm_1.Like)(`%${adminCommentToFilter}%`);
    }
    if (fromCreationDateToFilter && toCreationDateToFilter) {
        if (typeof where === 'string')
            where = `${where} AND user.created_at >= '${fromCreationDateToFilter} 00:00:00' and user.created_at <= '${toCreationDateToFilter} 23:59:59'`;
        else
            where.created_at = (0, typeorm_1.Between)(`${fromCreationDateToFilter} 00:00:00`, `${toCreationDateToFilter} 23:59:59`);
    }
    else if (fromCreationDateToFilter) {
        if (typeof where === 'string')
            where = `${where} AND user.created_at >= '${fromCreationDateToFilter} 00:00:00'`;
        else
            where.created_at = (0, typeorm_1.MoreThanOrEqual)(`${fromCreationDateToFilter} 00:00:00`);
    }
    else if (toCreationDateToFilter) {
        if (typeof where === 'string')
            where = `${where} and user.created_at <= '${toCreationDateToFilter} 23:59:59'`;
        else
            where.created_at = (0, typeorm_1.LessThanOrEqual)(`${toCreationDateToFilter} 23:59:59`);
    }
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
    let count = 0;
    let users = [];
    // count = await User.createQueryBuilder('user')
    //   .leftJoinAndSelect('user.posts', 'post')
    //   .leftJoinAndSelect('user.archive_posts', 'archive_post')
    //   .leftJoinAndSelect('user.deleted_posts', 'deleted_post')
    //   .leftJoinAndSelect('user.credits', 'credits')
    //   .leftJoinAndSelect('user.transactions', 'transactions')
    //   .leftJoinAndSelect('user.agent', 'agent')
    //   .where(where)
    //   .getCount();
    // users = await User.createQueryBuilder('user')
    //   .leftJoinAndSelect('user.posts', 'post')
    //   .leftJoinAndSelect('user.archive_posts', 'archive_post')
    //   .leftJoinAndSelect('user.deleted_posts', 'deleted_post')
    //   .leftJoinAndSelect('user.credits', 'credits')
    //   .leftJoinAndSelect('user.transactions', 'transactions')
    //   .leftJoinAndSelect('transactions.package', 'package')
    //   .leftJoinAndSelect('user.agent', 'agent')
    //   .addSelect('COUNT(post.id) + COUNT(archive_post.id) + COUNT(deleted_post.id)', 'total_posts')
    //   .addSelect('COUNT(post.id)', 'total_active_posts')
    //   .addSelect('COUNT(archive_post.id)', 'total_archive_post')
    //   .addSelect('COUNT(deleted_post.id)', 'total_deleted_post')
    //   .groupBy('user.id, post.id, archive_post.id, deleted_post.id, credits.id, transactions.id, package.id, agent.id')
    //   .orderBy(order, 'DESC')
    //   .where(where)
    //   .skip(offset)
    //   .take(50)
    //   .getMany();
    const queryBuilder = model_1.User.createQueryBuilder('user')
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
        .where(where)
        .groupBy('user.id, post.id, archive_post.id, deleted_post.id, credits.id, transactions.id, package.id, agent.id')
        .orderBy(order, 'DESC')
        .skip(offset)
        .take(50);
    count = yield queryBuilder.getCount();
    users = yield queryBuilder.getMany();
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