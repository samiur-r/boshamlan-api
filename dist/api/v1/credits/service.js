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
exports.findFreeCredits = exports.setCreditsToZeroByUserId = exports.findStickyCredits = exports.typeOfCreditToDeduct = exports.findCreditByUserId = exports.updateAgentCredit = exports.updateCredit = exports.initCredits = void 0;
const typeorm_1 = require("typeorm");
const ErrorHandler_1 = __importDefault(require("../../../utils/ErrorHandler"));
const model_1 = require("./model");
const initCredits = (user) => __awaiter(void 0, void 0, void 0, function* () {
    const creditData = model_1.Credit.create({
        free: 2,
        regular: 0,
        sticky: 0,
        agent: 0,
        user,
    });
    yield model_1.Credit.save(creditData);
});
exports.initCredits = initCredits;
const findCreditByUserId = (user_id) => __awaiter(void 0, void 0, void 0, function* () {
    const credit = yield model_1.Credit.findOne({ where: { user: { id: user_id } } });
    return credit;
});
exports.findCreditByUserId = findCreditByUserId;
const updateCredit = (userId, typeOfCredit, numberOfCredits, operation, // ADD or SUB
creditData) => __awaiter(void 0, void 0, void 0, function* () {
    let credit;
    if (!creditData) {
        credit = yield findCreditByUserId(userId);
        if (!credit)
            throw new ErrorHandler_1.default(500, 'Something went wrong');
    }
    else
        credit = creditData;
    const currCredit = credit[typeOfCredit.toString()] || 0;
    const creditsToUpdate = operation === 'ADD' ? currCredit + numberOfCredits : currCredit - numberOfCredits;
    const updatedCredit = yield model_1.Credit.save(Object.assign(Object.assign({}, credit), { [typeOfCredit]: creditsToUpdate }));
    return updatedCredit;
});
exports.updateCredit = updateCredit;
const typeOfCreditToDeduct = (userId, is_agent, isStickyPost, isStickyOnly) => __awaiter(void 0, void 0, void 0, function* () {
    const credit = yield findCreditByUserId(userId);
    if (!credit)
        throw new ErrorHandler_1.default(500, 'Something went wrong');
    let typeOfCredit;
    if (isStickyOnly === 'true') {
        if (credit.sticky > 0)
            typeOfCredit = 'sticky';
    }
    else if (isStickyPost === 'true') {
        if (credit.sticky > 0)
            typeOfCredit = 'sticky';
    }
    else if (credit.free > 0)
        typeOfCredit = 'free';
    else if (credit.agent > 0 && is_agent)
        typeOfCredit = 'agent';
    else if (credit.regular > 0)
        typeOfCredit = 'regular';
    return { typeOfCredit, credit };
});
exports.typeOfCreditToDeduct = typeOfCreditToDeduct;
const updateAgentCredit = (ids, value) => __awaiter(void 0, void 0, void 0, function* () {
    yield model_1.Credit.update({ user: { id: (0, typeorm_1.In)(ids) } }, { agent: value });
});
exports.updateAgentCredit = updateAgentCredit;
const findStickyCredits = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const credits = yield model_1.Credit.findOne({ where: { user: { id: userId } } });
    if (!credits)
        return 0;
    return credits.sticky;
});
exports.findStickyCredits = findStickyCredits;
const findFreeCredits = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const credits = yield model_1.Credit.findOne({ where: { user: { id: userId } } });
    if (!credits)
        return 0;
    return credits.free;
});
exports.findFreeCredits = findFreeCredits;
const setCreditsToZeroByUserId = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const credits = yield model_1.Credit.findOne({ where: { user: { id: userId } } });
    yield model_1.Credit.save(Object.assign(Object.assign({}, credits), { regular: 0, free: 0, sticky: 0, agent: 0 }));
});
exports.setCreditsToZeroByUserId = setCreditsToZeroByUserId;
//# sourceMappingURL=service.js.map