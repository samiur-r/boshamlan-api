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
exports.geCreditsSummary = exports.getTransactionSummary = exports.getPostSummary = exports.getUserSummary = exports.getPostHistory = exports.getPaymentHistory = exports.findAdminByPhone = exports.saveAdmin = void 0;
const typeorm_1 = require("typeorm");
const model_1 = require("../credits/model");
const model_2 = require("../packages/model");
const ArchivePost_1 = require("../posts/models/ArchivePost");
const DeletedPost_1 = require("../posts/models/DeletedPost");
const Post_1 = require("../posts/models/Post");
const model_3 = require("../transactions/model");
const model_4 = require("../users/model");
const model_5 = require("./model");
const saveAdmin = (phone, password, name) => __awaiter(void 0, void 0, void 0, function* () {
    const newAdmin = model_5.Admin.create({
        phone,
        password,
        name,
    });
    yield model_5.Admin.save(newAdmin);
});
exports.saveAdmin = saveAdmin;
const findAdminByPhone = (phone) => __awaiter(void 0, void 0, void 0, function* () {
    const admin = yield model_5.Admin.findOneBy({ phone });
    return admin;
});
exports.findAdminByPhone = findAdminByPhone;
const getPaymentHistory = (transactions) => {
    const payment = {
        regular: 0,
        sticky: 0,
        agent: 0,
    };
    if (transactions) {
        transactions.forEach((transaction) => {
            if (transaction.package_title === 'regular1' || transaction.package_title === 'regular2')
                payment.regular += transaction.amount;
            else if (transaction.package_title === 'sticky1' || transaction.package_title === 'sticky2')
                payment.sticky += transaction.amount;
            else if (transaction.package_title === 'agent1' || transaction.package_title === 'agent2')
                payment.agent += transaction.amount;
        });
    }
    return payment;
};
exports.getPaymentHistory = getPaymentHistory;
const getPostHistory = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const postHistory = {
        total: 0,
        active: 0,
        archived: 0,
        repost: 0,
        deleted: 0,
    };
    const countActivePosts = yield Post_1.Post.count({
        where: { user: { id: userId } },
    });
    const countRepostedPosts = yield Post_1.Post.count({
        where: { is_reposted: true },
    });
    const countArchivedPosts = yield ArchivePost_1.ArchivePost.count({
        where: { user: { id: userId } },
    });
    const countDeletedPosts = yield DeletedPost_1.DeletedPost.count({
        where: { user: { id: userId } },
    });
    postHistory.active = countActivePosts;
    postHistory.archived = countArchivedPosts;
    postHistory.deleted = countDeletedPosts;
    postHistory.repost = countRepostedPosts;
    postHistory.total = countActivePosts + countArchivedPosts + countDeletedPosts + countRepostedPosts;
    return postHistory;
});
exports.getPostHistory = getPostHistory;
const getUserSummary = () => __awaiter(void 0, void 0, void 0, function* () {
    const [users, totalUsers] = yield model_4.User.findAndCount();
    const posts = yield Post_1.Post.find();
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().slice(0, 10);
    const registeredToday = users.filter((user) => user.created_at.toISOString().slice(0, 10) === today).length;
    const registeredYesterday = users.filter((user) => user.created_at.toISOString().slice(0, 10) === yesterday).length;
    const notVerifiedToday = users.filter((user) => user.status === 'not_verified' && user.created_at.toISOString().slice(0, 10) === today).length;
    const notVerifiedYesterday = users.filter((user) => user.status === 'not_verified' && user.created_at.toISOString().slice(0, 10) === yesterday).length;
    const activeToday = users.filter((user) => {
        return user.created_at.toISOString().slice(0, 10) === today && posts.some((post) => post.user.id === user.id);
    }).length;
    const activeYesterday = users.filter((user) => {
        return user.created_at.toISOString().slice(0, 10) === yesterday && posts.some((post) => post.user.id === user.id);
    }).length;
    const activeAgents = users.filter((user) => user.is_agent).length;
    return {
        totalUsers,
        activeAgents,
        registeredToday,
        registeredYesterday,
        notVerifiedToday,
        notVerifiedYesterday,
        activeToday,
        activeYesterday,
    };
});
exports.getUserSummary = getUserSummary;
const getPostSummary = () => __awaiter(void 0, void 0, void 0, function* () {
    const [posts, totalActivePosts] = yield Post_1.Post.findAndCount();
    const totalArchivedPosts = yield ArchivePost_1.ArchivePost.count();
    const totalDeletedPosts = yield DeletedPost_1.DeletedPost.count();
    const totalPosts = totalActivePosts + totalArchivedPosts + totalDeletedPosts;
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().slice(0, 10);
    const postsToday = posts.filter((post) => post.public_date.toISOString().slice(0, 10) === today).length;
    const postsYesterday = posts.filter((post) => post.public_date.toISOString().slice(0, 10) === yesterday).length;
    const postsByAgentToday = postsToday === 0
        ? 0
        : ((posts.filter((post) => post.user.is_agent && post.public_date.toISOString().slice(0, 10) === today).length /
            postsToday) *
            100).toFixed(2);
    const postsByAgentYesterday = postsYesterday === 0
        ? 0
        : ((posts.filter((post) => post.user.is_agent && post.public_date.toISOString().slice(0, 10) === yesterday)
            .length /
            postsYesterday) *
            100).toFixed(2);
    const totalActiveStickyPosts = posts.filter((post) => post.is_sticky).length;
    const totalActiveAgentPosts = totalActivePosts === 0
        ? 0
        : ((posts.filter((post) => post.user.is_agent).length / totalActivePosts) * 100).toFixed(2);
    return {
        totalPosts,
        totalActivePosts,
        totalArchivedPosts,
        totalDeletedPosts,
        postsToday,
        postsYesterday,
        postsByAgentToday,
        postsByAgentYesterday,
        totalActiveStickyPosts,
        totalActiveAgentPosts,
    };
});
exports.getPostSummary = getPostSummary;
const getTransactionSummary = () => __awaiter(void 0, void 0, void 0, function* () {
    const transactions = yield model_3.Transaction.find();
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().slice(0, 10);
    // Get the current month's and previous month's start and end dates
    const now = new Date();
    const currentMonthStartDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthEndDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const prevMonthStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthEndDate = new Date(now.getFullYear(), now.getMonth(), 0);
    const transactionsToday = transactions.filter((transaction) => transaction.status === 'completed' && transaction.created_at.toISOString().slice(0, 10) === today);
    const transactionsYesterday = transactions.filter((transaction) => transaction.status === 'completed' && transaction.created_at.toISOString().slice(0, 10) === yesterday);
    const completedTransactionsToday = transactionsToday.length;
    const completedTransactionsYesterday = transactionsYesterday.length;
    const totalTransactionsToday = transactions.filter((transaction) => transaction.created_at.toISOString().slice(0, 10) === today).length;
    const totalTransactionsYesterday = transactions.filter((transaction) => transaction.created_at.toISOString().slice(0, 10) === yesterday).length;
    const incomeToday = transactionsToday.reduce((sum, transaction) => sum + transaction.amount, 0);
    const incomeYesterday = transactionsYesterday.reduce((sum, transaction) => sum + transaction.amount, 0);
    const transactionsLastTwoMonths = yield model_3.Transaction.find({
        where: {
            status: 'completed',
            created_at: (0, typeorm_1.Between)(prevMonthStartDate, currentMonthEndDate),
        },
    });
    const totalIncomeThisMonth = transactionsLastTwoMonths.reduce((acc, curr) => {
        if (curr.created_at >= currentMonthStartDate && curr.created_at <= currentMonthEndDate) {
            return acc + curr.amount;
        }
        return acc;
    }, 0);
    const totalIncomeLastMonth = transactionsLastTwoMonths.reduce((acc, curr) => {
        if (curr.created_at >= prevMonthStartDate && curr.created_at <= prevMonthEndDate) {
            return acc + curr.amount;
        }
        return acc;
    }, 0);
    const totalRegularIncomeThisMonth = transactionsLastTwoMonths.reduce((acc, curr) => {
        if (curr.created_at >= currentMonthStartDate &&
            curr.created_at <= currentMonthEndDate &&
            (curr.package.id === 1 || curr.package.id === 2)) {
            return acc + curr.amount;
        }
        return acc;
    }, 0);
    const totalRegularIncomeLastMonth = transactionsLastTwoMonths.reduce((acc, curr) => {
        if (curr.created_at >= prevMonthStartDate &&
            curr.created_at <= prevMonthEndDate &&
            (curr.package.id === 1 || curr.package.id === 2)) {
            return acc + curr.amount;
        }
        return acc;
    }, 0);
    const totalStickyIncomeThisMonth = transactionsLastTwoMonths.reduce((acc, curr) => {
        if (curr.created_at >= currentMonthStartDate &&
            curr.created_at <= currentMonthEndDate &&
            (curr.package.id === 5 || curr.package.id === 6)) {
            return acc + curr.amount;
        }
        return acc;
    }, 0);
    const totalStickyIncomeLastMonth = transactionsLastTwoMonths.reduce((acc, curr) => {
        if (curr.created_at >= prevMonthStartDate &&
            curr.created_at <= prevMonthEndDate &&
            (curr.package.id === 5 || curr.package.id === 6)) {
            return acc + curr.amount;
        }
        return acc;
    }, 0);
    const totalStickyDirectIncomeThisMonth = transactionsLastTwoMonths.reduce((acc, curr) => {
        if (curr.created_at >= currentMonthStartDate && curr.created_at <= currentMonthEndDate && curr.package.id === 7) {
            return acc + curr.amount;
        }
        return acc;
    }, 0);
    const totalStickyDirectIncomeLastMonth = transactionsLastTwoMonths.reduce((acc, curr) => {
        if (curr.created_at >= prevMonthStartDate && curr.created_at <= prevMonthEndDate && curr.package.id === 7) {
            return acc + curr.amount;
        }
        return acc;
    }, 0);
    const totalAgentTwoIncomeThisMonth = transactionsLastTwoMonths.reduce((acc, curr) => {
        if (curr.created_at >= currentMonthStartDate && curr.created_at <= currentMonthEndDate && curr.package.id === 3) {
            return acc + curr.amount;
        }
        return acc;
    }, 0);
    const totalAgentTwoIncomeLastMonth = transactionsLastTwoMonths.reduce((acc, curr) => {
        if (curr.created_at >= prevMonthStartDate && curr.created_at <= prevMonthEndDate && curr.package.id === 3) {
            return acc + curr.amount;
        }
        return acc;
    }, 0);
    const totalAgentSixIncomeThisMonth = transactionsLastTwoMonths.reduce((acc, curr) => {
        if (curr.created_at >= currentMonthStartDate && curr.created_at <= currentMonthEndDate && curr.package.id === 4) {
            return acc + curr.amount;
        }
        return acc;
    }, 0);
    const totalAgentSixIncomeLastMonth = transactionsLastTwoMonths.reduce((acc, curr) => {
        if (curr.created_at >= prevMonthStartDate && curr.created_at <= prevMonthEndDate && curr.package.id === 4) {
            return acc + curr.amount;
        }
        return acc;
    }, 0);
    return {
        completedTransactionsToday,
        completedTransactionsYesterday,
        totalTransactionsToday,
        totalTransactionsYesterday,
        incomeToday,
        incomeYesterday,
        totalIncomeThisMonth,
        totalIncomeLastMonth,
        totalRegularIncomeThisMonth,
        totalRegularIncomeLastMonth,
        totalStickyIncomeThisMonth,
        totalStickyIncomeLastMonth,
        totalStickyDirectIncomeThisMonth,
        totalStickyDirectIncomeLastMonth,
        totalAgentTwoIncomeThisMonth,
        totalAgentTwoIncomeLastMonth,
        totalAgentSixIncomeThisMonth,
        totalAgentSixIncomeLastMonth,
    };
});
exports.getTransactionSummary = getTransactionSummary;
const geCreditsSummary = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    const usersWithHistoryRegular = yield model_3.Transaction.createQueryBuilder('transaction')
        .select('COUNT(DISTINCT transaction.user_id)', 'count')
        .where('transaction.status = :status', { status: 'completed' })
        .andWhere('transaction.package_title IN (:...titles)', { titles: ['regular1', 'regular2'] })
        .getRawOne();
    const usersWithHistorySticky = yield model_3.Transaction.createQueryBuilder('transaction')
        .select('COUNT(DISTINCT transaction.user_id)', 'count')
        .where('transaction.status = :status', { status: 'completed' })
        .andWhere('transaction.package_title IN (:...titles)', { titles: ['sticky1', 'sticky2'] })
        .getRawOne();
    const usersWithHistoryStickyDirect = yield model_3.Transaction.createQueryBuilder('transaction')
        .select('COUNT(DISTINCT transaction.user_id)', 'count')
        .where('transaction.status = :status', { status: 'completed' })
        .andWhere('transaction.package_title IN (:...titles)', { titles: ['stickyDirect'] })
        .getRawOne();
    const usersWithHistoryAgent = yield model_3.Transaction.createQueryBuilder('transaction')
        .select('COUNT(DISTINCT transaction.user_id)', 'count')
        .where('transaction.status = :status', { status: 'completed' })
        .andWhere('transaction.package_title IN (:...titles)', { titles: ['agent1', 'agent2'] })
        .getRawOne();
    const totalHistoryRegular = yield model_3.Transaction.createQueryBuilder('transaction')
        .select('SUM(package.numberOfCredits)', 'count')
        .leftJoin(model_2.Package, 'package', 'transaction.package_id = package.id')
        .where('transaction.status = :status', { status: 'completed' })
        .andWhere('transaction.package_title IN (:...titles)', { titles: ['regular1', 'regular2'] })
        .getRawOne();
    const totalHistorySticky = yield model_3.Transaction.createQueryBuilder('transaction')
        .select('SUM(package.numberOfCredits)', 'count')
        .leftJoin(model_2.Package, 'package', 'transaction.package_id = package.id')
        .where('transaction.status = :status', { status: 'completed' })
        .andWhere('transaction.package_title IN (:...titles)', { titles: ['sticky1', 'sticky2'] })
        .getRawOne();
    const totalHistoryStickyDirect = yield model_3.Transaction.createQueryBuilder('transaction')
        .select('SUM(package.numberOfCredits)', 'count')
        .leftJoin(model_2.Package, 'package', 'transaction.package_id = package.id')
        .where('transaction.status = :status', { status: 'completed' })
        .andWhere('transaction.package_title IN (:...titles)', { titles: ['stickyDirect'] })
        .getRawOne();
    const totalHistoryAgent = yield model_3.Transaction.createQueryBuilder('transaction')
        .select('SUM(package.numberOfCredits)', 'count')
        .leftJoin(model_2.Package, 'package', 'transaction.package_id = package.id')
        .where('transaction.status = :status', { status: 'completed' })
        .andWhere('transaction.package_title IN (:...titles)', { titles: ['agent1', 'agent2'] })
        .getRawOne();
    const userWithActiveRegular = yield model_1.Credit.count({ where: { regular: (0, typeorm_1.MoreThan)(0) } });
    const userWithActiveSticky = yield model_1.Credit.count({ where: { sticky: (0, typeorm_1.MoreThan)(0) } });
    const userWithActiveAgent = yield model_1.Credit.count({ where: { agent: (0, typeorm_1.MoreThan)(0) } });
    const { totalActiveRegular } = yield model_1.Credit.createQueryBuilder('credit')
        .select('SUM(credit.regular)', 'totalActiveRegular')
        .getRawOne();
    const { totalActiveSticky } = yield model_1.Credit.createQueryBuilder('credit')
        .select('SUM(credit.sticky)', 'totalActiveSticky')
        .getRawOne();
    const { totalActiveAgent } = yield model_1.Credit.createQueryBuilder('credit')
        .select('SUM(credit.agent)', 'totalActiveAgent')
        .getRawOne();
    const usersWithHistory = {
        regular: usersWithHistoryRegular.count,
        sticky: usersWithHistorySticky.count,
        stickyDirect: usersWithHistoryStickyDirect.count,
        agent: usersWithHistoryAgent.count,
    };
    const totalHistory = {
        regular: (_a = totalHistoryRegular.count) !== null && _a !== void 0 ? _a : 0,
        sticky: (_b = totalHistorySticky.count) !== null && _b !== void 0 ? _b : 0,
        stickyDirect: (_c = totalHistoryStickyDirect.count) !== null && _c !== void 0 ? _c : 0,
        agent: (_d = totalHistoryAgent.count) !== null && _d !== void 0 ? _d : 0,
    };
    const userWithActive = {
        regular: userWithActiveRegular,
        sticky: userWithActiveSticky,
        agent: userWithActiveAgent,
    };
    const totalActive = {
        regular: totalActiveRegular,
        sticky: totalActiveSticky,
        agent: totalActiveAgent,
    };
    const unVerifiedUsersCount = yield model_4.User.count({ where: { status: 'not_verified' } });
    let totalZeroFreeCredits = yield model_1.Credit.count({ where: { free: 0 } });
    totalZeroFreeCredits += unVerifiedUsersCount !== null && unVerifiedUsersCount !== void 0 ? unVerifiedUsersCount : 0;
    return { totalZeroFreeCredits, usersWithHistory, totalHistory, userWithActive, totalActive };
});
exports.geCreditsSummary = geCreditsSummary;
//# sourceMappingURL=service.js.map