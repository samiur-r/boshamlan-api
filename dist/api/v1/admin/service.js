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
const ArchivePost_1 = require("../posts/models/ArchivePost");
const DeletedPost_1 = require("../posts/models/DeletedPost");
const Post_1 = require("../posts/models/Post");
const model_2 = require("../transactions/model");
const model_3 = require("../users/model");
const model_4 = require("./model");
const saveAdmin = (phone, password, name) => __awaiter(void 0, void 0, void 0, function* () {
    const newAdmin = model_4.Admin.create({
        phone,
        password,
        name,
    });
    yield model_4.Admin.save(newAdmin);
});
exports.saveAdmin = saveAdmin;
const findAdminByPhone = (phone) => __awaiter(void 0, void 0, void 0, function* () {
    const admin = yield model_4.Admin.findOneBy({ phone });
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
    const [users, totalUsers] = yield model_3.User.findAndCount();
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().slice(0, 10);
    const verifiedToday = users.filter((user) => user.status === 'verified' && user.created_at.toISOString().slice(0, 10) === today).length;
    const verifiedYesterday = users.filter((user) => user.status === 'verified' && user.created_at.toISOString().slice(0, 10) === yesterday).length;
    const notVerifiedToday = users.filter((user) => user.status === 'not_verified' && user.created_at.toISOString().slice(0, 10) === today).length;
    const notVerifiedYesterday = users.filter((user) => user.status === 'not_verified' && user.created_at.toISOString().slice(0, 10) === yesterday).length;
    const activeAgents = users.filter((user) => user.is_agent).length;
    return { totalUsers, activeAgents, verifiedToday, verifiedYesterday, notVerifiedToday, notVerifiedYesterday };
});
exports.getUserSummary = getUserSummary;
const getPostSummary = () => __awaiter(void 0, void 0, void 0, function* () {
    const [posts, totalActivePosts] = yield Post_1.Post.findAndCount();
    const totalArchivedPosts = yield ArchivePost_1.ArchivePost.count();
    const totalDeletedPosts = yield DeletedPost_1.DeletedPost.count();
    const totalPosts = totalActivePosts + totalArchivedPosts + totalDeletedPosts;
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().slice(0, 10);
    const postsToday = posts.filter((post) => post.created_at.toISOString().slice(0, 10) === today).length;
    const postsYesterday = posts.filter((post) => post.created_at.toISOString().slice(0, 10) === yesterday).length;
    const postsByAgentToday = postsToday === 0
        ? 0
        : ((posts.filter((post) => post.user.is_agent && post.created_at.toISOString().slice(0, 10) === today).length /
            postsToday) *
            100).toFixed(2);
    const postsByAgentYesterday = postsYesterday === 0
        ? 0
        : ((posts.filter((post) => post.user.is_agent && post.created_at.toISOString().slice(0, 10) === yesterday)
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
    const transactions = yield model_2.Transaction.find();
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
    const transactionsLastTwoMonths = yield model_2.Transaction.find({
        where: [
            { created_at: (0, typeorm_1.Between)(prevMonthStartDate, prevMonthEndDate) },
            { created_at: (0, typeorm_1.Between)(currentMonthStartDate, currentMonthEndDate) },
        ],
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
            (curr.package.id === 5 || curr.package.id === 5)) {
            return acc + curr.amount;
        }
        return acc;
    }, 0);
    const totalStickyIncomeLastMonth = transactionsLastTwoMonths.reduce((acc, curr) => {
        if (curr.created_at >= prevMonthStartDate &&
            curr.created_at <= prevMonthEndDate &&
            (curr.package.id === 5 || curr.package.id === 5)) {
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
    const totalZeroFreeCredits = yield model_1.Credit.count({ where: { free: 0 } });
    const totalRegularCredits = yield model_1.Credit.count({ where: { regular: (0, typeorm_1.MoreThan)(0) } });
    const totalStickyCredits = yield model_1.Credit.count({ where: { sticky: (0, typeorm_1.MoreThan)(0) } });
    const totalAgentCredits = yield model_1.Credit.count({ where: { agent: (0, typeorm_1.MoreThan)(0) } });
    return { totalZeroFreeCredits, totalRegularCredits, totalStickyCredits, totalAgentCredits };
});
exports.geCreditsSummary = geCreditsSummary;
//# sourceMappingURL=service.js.map