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
exports.editTransactionStatus = exports.editTransaction = exports.saveTransaction = void 0;
const slackUtils_1 = require("../../../utils/slackUtils");
const smsUtils_1 = require("../../../utils/smsUtils");
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
        const slackMsg = `Payment created\n\n ${(user === null || user === void 0 ? void 0 : user.phone) ? `User: <https://wa.me/965${user === null || user === void 0 ? void 0 : user.phone}|${user === null || user === void 0 ? void 0 : user.phone}>` : ''}`;
        yield (0, slackUtils_1.alertOnSlack)('imp', slackMsg);
    }
    return transaction;
});
exports.saveTransaction = saveTransaction;
const findTransactionByTrackId = (track_id) => __awaiter(void 0, void 0, void 0, function* () {
    const transaction = yield model_1.Transaction.findOne({ where: { track_id } });
    return transaction;
});
const editTransaction = (trackId, reference_id, tran_id, status) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    const transaction = yield findTransactionByTrackId(trackId.toString());
    if (!transaction)
        return { status: 404 };
    const transactionObj = yield model_1.Transaction.save(Object.assign(Object.assign({}, transaction), { reference_id,
        tran_id,
        status }));
    let slackMsg = '';
    let smsMsg = '';
    if (transactionObj) {
        let packageTitle = transactionObj.package_title || '';
        packageTitle = packageTitle.slice(0, -1);
        switch (packageTitle) {
            case 'agent':
                slackMsg = `Payment ${status === 'completed' ? 'successful. Subscription started.' : 'failed.'}\n\n ${((_a = transactionObj === null || transactionObj === void 0 ? void 0 : transactionObj.user) === null || _a === void 0 ? void 0 : _a.phone)
                    ? `User: <https://wa.me/965${(_b = transactionObj === null || transactionObj === void 0 ? void 0 : transactionObj.user) === null || _b === void 0 ? void 0 : _b.phone}|${(_c = transactionObj === null || transactionObj === void 0 ? void 0 : transactionObj.user) === null || _c === void 0 ? void 0 : _c.phone}>`
                    : ''}`;
                smsMsg = `Payment ${status === 'completed' ? 'successful. Subscription started.' : 'failed.'}`;
                break;
            case 'stickyDirec':
                slackMsg = `Payment ${status === 'completed' ? 'successful. Post sticked.' : 'failed.'}\n\n ${((_d = transactionObj === null || transactionObj === void 0 ? void 0 : transactionObj.user) === null || _d === void 0 ? void 0 : _d.phone)
                    ? `User: <https://wa.me/965${(_e = transactionObj === null || transactionObj === void 0 ? void 0 : transactionObj.user) === null || _e === void 0 ? void 0 : _e.phone}|${(_f = transactionObj === null || transactionObj === void 0 ? void 0 : transactionObj.user) === null || _f === void 0 ? void 0 : _f.phone}>`
                    : ''}`;
                smsMsg = `Payment ${status === 'completed' ? 'successful. Post sticked.' : 'failed.'}`;
                break;
            default:
                slackMsg = `Payment ${status === 'completed' ? 'successful.' : 'failed.'}\n\n ${((_g = transactionObj === null || transactionObj === void 0 ? void 0 : transactionObj.user) === null || _g === void 0 ? void 0 : _g.phone)
                    ? `User: <https://wa.me/965${(_h = transactionObj === null || transactionObj === void 0 ? void 0 : transactionObj.user) === null || _h === void 0 ? void 0 : _h.phone}|${(_j = transactionObj === null || transactionObj === void 0 ? void 0 : transactionObj.user) === null || _j === void 0 ? void 0 : _j.phone}>`
                    : ''}`;
                smsMsg = `Payment ${status === 'completed' ? 'successful.' : 'failed.'}`;
                break;
        }
    }
    yield (0, slackUtils_1.alertOnSlack)('imp', slackMsg);
    yield (0, smsUtils_1.sendSms)(transactionObj.user.phone, smsMsg);
    return { status: 200, data: transactionObj };
});
exports.editTransaction = editTransaction;
const editTransactionStatus = (trackId, status) => __awaiter(void 0, void 0, void 0, function* () {
    var _k, _l, _m;
    if (trackId === null)
        return { status: 404 };
    const transaction = yield findTransactionByTrackId(trackId);
    if (!transaction)
        return { status: 404 };
    yield model_1.Transaction.save(Object.assign(Object.assign({}, transaction), { status }));
    const slackMsg = `Payment canceled.\n\n${((_k = transaction === null || transaction === void 0 ? void 0 : transaction.user) === null || _k === void 0 ? void 0 : _k.phone) ? `User: <https://wa.me/965${(_l = transaction === null || transaction === void 0 ? void 0 : transaction.user) === null || _l === void 0 ? void 0 : _l.phone}|${(_m = transaction === null || transaction === void 0 ? void 0 : transaction.user) === null || _m === void 0 ? void 0 : _m.phone}>` : ''}`;
    const smsMsg = `Payment canceled`;
    yield (0, slackUtils_1.alertOnSlack)('imp', slackMsg);
    yield (0, smsUtils_1.sendSms)(transaction.user.phone, smsMsg);
    return { status: 200 };
});
exports.editTransactionStatus = editTransactionStatus;
//# sourceMappingURL=service.js.map