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
    return transaction;
});
exports.saveTransaction = saveTransaction;
const findTransactionByTrackId = (track_id) => __awaiter(void 0, void 0, void 0, function* () {
    const transaction = yield model_1.Transaction.findOne({ where: { track_id } });
    return transaction;
});
const editTransaction = (trackId, reference_id, tran_id, status) => __awaiter(void 0, void 0, void 0, function* () {
    const transaction = yield findTransactionByTrackId(trackId.toString());
    if (!transaction)
        return { status: 404 };
    const transactionObj = yield model_1.Transaction.save(Object.assign(Object.assign({}, transaction), { reference_id,
        tran_id,
        status }));
    return { status: 200, data: transactionObj };
});
exports.editTransaction = editTransaction;
const editTransactionStatus = (trackId, status) => __awaiter(void 0, void 0, void 0, function* () {
    if (trackId === null)
        return { status: 404 };
    const transaction = yield findTransactionByTrackId(trackId);
    if (!transaction)
        return { status: 404 };
    yield model_1.Transaction.save(Object.assign(Object.assign({}, transaction), { status }));
    return { status: 200 };
});
exports.editTransactionStatus = editTransactionStatus;
//# sourceMappingURL=service.js.map