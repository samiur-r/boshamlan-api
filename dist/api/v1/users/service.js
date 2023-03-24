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
exports.findUnVerifiedUsers = exports.updateBulkIsUserAnAgent = exports.updateIsUserAnAgent = exports.updateUserPassword = exports.updateUserStatus = exports.saveUser = exports.findUserByPhone = exports.findUserById = void 0;
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
const findUnVerifiedUsers = () => __awaiter(void 0, void 0, void 0, function* () {
    const lessThanFiveMins = new Date(Date.now() - 1 * 60 * 1000); // 5 minutes ago
    const users = yield model_1.User.find({ where: { status: 'not_verified', created_at: (0, typeorm_1.MoreThan)(lessThanFiveMins) } });
    return users;
});
exports.findUnVerifiedUsers = findUnVerifiedUsers;
//# sourceMappingURL=service.js.map