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
exports.findTransactionById = exports.filterTransactionsForAdmin = exports.findTransactionsByUserId = exports.editTransactionStatus = exports.editTransaction = exports.saveTransaction = void 0;
/* eslint-disable no-param-reassign */
const typeorm_1 = require("typeorm");
const slackUtils_1 = require("../../../utils/slackUtils");
const smsUtils_1 = require("../../../utils/smsUtils");
const timestampUtls_1 = require("../../../utils/timestampUtls");
const service_1 = require("../users/service");
const model_1 = require("./model");
const saveTransaction = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { trackId, amount, packageTitle, status, user, packageObj, } = payload;
    const newTransaction = model_1.Transaction.create({
        track_id: trackId,
        package_title: packageTitle,
        amount,
        status,
        user,
        package: packageObj,
    });
    const transaction = yield model_1.Transaction.save(newTransaction);
    if (status === 'created') {
        const slackMsg = `Payment created - ${(user === null || user === void 0 ? void 0 : user.admin_comment) ? `${user.admin_comment}` : ''}\n${packageTitle} - ${amount}`;
        yield (0, slackUtils_1.alertOnSlack)('imp', slackMsg);
    }
    return transaction;
});
exports.saveTransaction = saveTransaction;
const findTransactionByTrackId = (track_id) => __awaiter(void 0, void 0, void 0, function* () {
    const transaction = yield model_1.Transaction.findOne({ where: { track_id } });
    return transaction;
});
const findTransactionsByUserId = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const transaction = yield model_1.Transaction.find({ where: { user: { id: userId } } });
    return transaction;
});
exports.findTransactionsByUserId = findTransactionsByUserId;
const editTransaction = (trackId, reference_id, tran_id, status) => __awaiter(void 0, void 0, void 0, function* () {
    const transaction = yield findTransactionByTrackId(trackId.toString());
    if (!transaction)
        return { status: 404 };
    const user = yield (0, service_1.findUserById)(transaction.user.id);
    if (!user)
        return { status: 404 };
    const transactionObj = yield model_1.Transaction.save(Object.assign(Object.assign({}, transaction), { reference_id,
        tran_id,
        status }));
    let smsMsg = '';
    if (transactionObj) {
        let packageTitle = transactionObj.package_title || '';
        packageTitle = packageTitle.slice(0, -1);
        switch (packageTitle) {
            case 'agent':
                smsMsg = `Payment ${status === 'completed' ? 'successful. Subscription started.' : 'failed.'}`;
                break;
            case 'stickyDirec':
                smsMsg = `Payment ${status === 'completed' ? 'successful. Post sticked.' : 'failed.'}`;
                break;
            default:
                smsMsg = `Payment ${status === 'completed' ? 'successful.' : 'failed.'}`;
                break;
        }
    }
    const slackMsg = `Payment ${status} - ${(user === null || user === void 0 ? void 0 : user.admin_comment) ? `${user.admin_comment}` : ''}\n${transactionObj.package_title} - ${transactionObj.amount}`;
    yield (0, slackUtils_1.alertOnSlack)('imp', slackMsg);
    yield (0, smsUtils_1.sendSms)(transactionObj.user.phone, smsMsg);
    return { status: 200, data: transactionObj };
});
exports.editTransaction = editTransaction;
const editTransactionStatus = (trackId, status) => __awaiter(void 0, void 0, void 0, function* () {
    if (trackId === null)
        return { status: 404 };
    const transaction = yield findTransactionByTrackId(trackId);
    if (!transaction)
        return { status: 404 };
    const user = yield (0, service_1.findUserById)(transaction.user.id);
    if (!user)
        return { status: 404 };
    yield model_1.Transaction.save(Object.assign(Object.assign({}, transaction), { status }));
    const slackMsg = `Payment canceled - ${user.admin_comment || ''}\n${transaction.package_title} - ${transaction.amount}`;
    const smsMsg = `Payment canceled`;
    yield (0, slackUtils_1.alertOnSlack)('imp', slackMsg);
    yield (0, smsUtils_1.sendSms)(transaction.user.phone, smsMsg);
    return { status: 200 };
});
exports.editTransactionStatus = editTransactionStatus;
const filterTransactionsForAdmin = (statusToFilter, typeToFilter, fromCreationDateToFilter, toCreationDateToFilter, userId, offset) => __awaiter(void 0, void 0, void 0, function* () {
    const where = {};
    if (userId) {
        where.user = { id: parseInt(userId, 10) };
    }
    if (statusToFilter && statusToFilter !== '-')
        where.status = statusToFilter.toLowerCase();
    if (typeToFilter && typeToFilter !== '-') {
        switch (typeToFilter) {
            case 'Regular':
                where.package_title = (0, typeorm_1.Like)('regular%');
                break;
            case 'Sticky':
                where.package_title = (0, typeorm_1.In)(['sticky1', 'sticky2']);
                break;
            case 'Sticky Direct':
                where.package_title = 'stickyDirect';
                break;
            case 'Agent':
                where.package_title = (0, typeorm_1.Like)('agent%');
                break;
            default:
                break;
        }
    }
    if (fromCreationDateToFilter && toCreationDateToFilter)
        where.created_at = (0, typeorm_1.Between)(`${fromCreationDateToFilter} 00:00:00`, `${toCreationDateToFilter} 23:59:59`);
    else if (fromCreationDateToFilter)
        where.created_at = (0, typeorm_1.MoreThanOrEqual)(`${fromCreationDateToFilter} 00:00:00`);
    else if (toCreationDateToFilter)
        where.created_at = (0, typeorm_1.LessThanOrEqual)(`${toCreationDateToFilter} 23:59:59`);
    const [transactions, count] = yield model_1.Transaction.findAndCount({
        where,
        order: { created_at: 'desc' },
        skip: offset,
        take: 50,
    });
    transactions.forEach((transactionItem) => {
        transactionItem.createdDate = (0, timestampUtls_1.parseTimestamp)(transactionItem.created_at).parsedDate;
        transactionItem.createdTime = (0, timestampUtls_1.parseTimestamp)(transactionItem.created_at).parsedTime;
        transactionItem.updatedDate = (0, timestampUtls_1.parseTimestamp)(transactionItem.updated_at).parsedDate;
        transactionItem.updatedTime = (0, timestampUtls_1.parseTimestamp)(transactionItem.updated_at).parsedTime;
    });
    const totalPages = Math.ceil(count / 50);
    return { transactions, totalPages, totalResults: count };
});
exports.filterTransactionsForAdmin = filterTransactionsForAdmin;
const findTransactionById = (transactionId) => __awaiter(void 0, void 0, void 0, function* () {
    const transaction = yield model_1.Transaction.findOne({ where: { id: transactionId } });
    return transaction;
});
exports.findTransactionById = findTransactionById;
//# sourceMappingURL=service.js.map