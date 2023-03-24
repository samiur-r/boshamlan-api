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
exports.handleKpayError = exports.handleKpayResponse = exports.updateStatus = exports.insert = void 0;
const ErrorHandler_1 = __importDefault(require("../../../utils/ErrorHandler"));
const logger_1 = __importDefault(require("../../../utils/logger"));
const service_1 = require("../agents/service");
const service_2 = require("../credits/service");
const service_3 = require("../packages/service");
const service_4 = require("../users/service");
const service_5 = require("./service");
const validation_1 = require("./validation");
const config_1 = __importDefault(require("../../../config"));
const aesDecrypt_1 = __importDefault(require("../../../utils/aesDecrypt"));
const jwtUtils_1 = require("../../../utils/jwtUtils");
const service_6 = require("../posts/service");
const service_7 = require("../logs/service");
const insert = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f;
    const { payload } = req.body;
    payload.user = res.locals.user.payload;
    try {
        yield validation_1.transactionSchema.validate(payload);
        const packageObj = yield (0, service_3.findPackageById)(payload.packageId);
        payload.packageObj = packageObj;
        yield (0, service_5.saveTransaction)(payload);
        logger_1.default.info(`Transaction created by user ${(_a = payload.user) === null || _a === void 0 ? void 0 : _a.phone}`);
        yield (0, service_7.saveUserLog)([
            {
                post_id: undefined,
                transaction: payload.trackId,
                user: (_c = (_b = payload.user) === null || _b === void 0 ? void 0 : _b.phone) !== null && _c !== void 0 ? _c : undefined,
                activity: 'Transaction created successfully',
            },
        ]);
        return res.status(200).json({ success: 'Transaction  created successfully' });
    }
    catch (error) {
        logger_1.default.error(`${error.name}: ${error.message}`);
        if (error.name === 'ValidationError') {
            error.message = 'Invalid payload passed';
        }
        logger_1.default.error(`Transaction creation failed by user ${(_d = payload.user) === null || _d === void 0 ? void 0 : _d.phone}`);
        yield (0, service_7.saveUserLog)([
            {
                post_id: undefined,
                transaction: payload.trackId,
                user: (_f = (_e = payload.user) === null || _e === void 0 ? void 0 : _e.phone) !== null && _f !== void 0 ? _f : undefined,
                activity: 'Transaction creation failed',
            },
        ]);
        return next(error);
    }
});
exports.insert = insert;
const updateStatus = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { trackId, status } = req.body;
    try {
        yield validation_1.transactionUpdateStatusSchema.validate({ trackId, status });
        const response = yield (0, service_5.editTransactionStatus)(trackId, status);
        if (response.status === 404)
            throw new ErrorHandler_1.default(404, 'Track id not found');
        return res.status(200).json({ success: 'Transaction  updated successfully' });
    }
    catch (error) {
        logger_1.default.error(`${error.name}: ${error.message}`);
        if (error.name === 'ValidationError') {
            error.message = 'Invalid payload passed';
            return next(error);
        }
        return next(error);
    }
});
exports.updateStatus = updateStatus;
const handleKpayResponse = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _g, _h, _j, _k, _l, _m, _o, _p, _q;
    let isOperationSucceeded = false;
    let redirectUrl = `${config_1.default.origin}/topup?`;
    let nextOperation = false;
    if ((_g = req.body) === null || _g === void 0 ? void 0 : _g.trandata) {
        const decryptedText = (0, aesDecrypt_1.default)(req.body.trandata);
        const urlParams = new URLSearchParams(decryptedText);
        const trackId = urlParams.get('trackid');
        const referenceId = urlParams.get('ref');
        const tranId = urlParams.get('tranid');
        const result = urlParams.get('result');
        const numOfCredits = urlParams.get('udf1');
        let status;
        if (tranId) {
            if (result === 'CAPTURED') {
                status = 'completed';
                isOperationSucceeded = true;
            }
            else {
                status = 'failed';
                yield (0, service_6.removeTempPostByTrackId)(trackId);
            }
            try {
                const response = yield (0, service_5.editTransaction)(trackId, referenceId.toString(), tranId.toString(), status);
                logger_1.default.info(`Transaction ${(_h = response.data) === null || _h === void 0 ? void 0 : _h.id} status updated to ${status}`);
                yield (0, service_7.saveUserLog)([
                    {
                        post_id: undefined,
                        transaction: (_j = response.data) === null || _j === void 0 ? void 0 : _j.track_id,
                        user: (_m = (_l = (_k = response === null || response === void 0 ? void 0 : response.data) === null || _k === void 0 ? void 0 : _k.user) === null || _l === void 0 ? void 0 : _l.phone) !== null && _m !== void 0 ? _m : undefined,
                        activity: `Transaction ${(_o = response.data) === null || _o === void 0 ? void 0 : _o.track_id} status updated to ${status}`,
                    },
                ]);
                if (status === 'completed' && response.data) {
                    let { package_title: packageTitle } = response.data;
                    packageTitle = packageTitle.slice(0, -1);
                    if (packageTitle === 'stickyDirec') {
                        yield (0, service_6.moveTempPost)(trackId);
                        redirectUrl = `${config_1.default.origin}/redirect?`;
                    }
                    else {
                        yield (0, service_2.updateCredit)(response.data.user.id, packageTitle, parseInt(numOfCredits, 10), 'ADD');
                        if (packageTitle === 'agent') {
                            const user = yield (0, service_4.updateIsUserAnAgent)(response.data.user.id, true);
                            yield (0, service_1.initOrUpdateAgent)(response.data.user);
                            logger_1.default.info(`Agent subscription initiated for user ${user.phone}`);
                            yield (0, service_7.saveUserLog)([
                                {
                                    post_id: undefined,
                                    transaction: (_p = response.data) === null || _p === void 0 ? void 0 : _p.track_id,
                                    user: (_q = user === null || user === void 0 ? void 0 : user.phone) !== null && _q !== void 0 ? _q : undefined,
                                    activity: `Agent subscription initiated for user ${user.phone}`,
                                },
                            ]);
                            res.clearCookie('token');
                            const userPayload = {
                                id: user.id,
                                phone: user.phone,
                                is_admin: user.is_admin,
                                is_agent: user.is_agent,
                                status: user.status,
                            };
                            const token = yield (0, jwtUtils_1.signJwt)(userPayload);
                            // @ts-ignore
                            res.cookie('token', token, config_1.default.cookieOptions);
                            nextOperation = true;
                        }
                    }
                }
            }
            catch (error) {
                logger_1.default.error(`${error.name}: ${error.message}`);
                logger_1.default.error(`Transaction failed for track id: ${trackId}`);
                yield (0, service_7.saveUserLog)([
                    {
                        post_id: undefined,
                        transaction: trackId !== null && trackId !== void 0 ? trackId : undefined,
                        user: undefined,
                        activity: `Transaction failed for tran id: ${trackId}`,
                    },
                ]);
            }
        }
        else {
            status = 'canceled';
            try {
                yield (0, service_5.editTransactionStatus)(trackId, status);
                yield (0, service_6.removeTempPostByTrackId)(trackId);
            }
            catch (error) {
                logger_1.default.error(`${error.name}: ${error.message}`);
            }
            logger_1.default.error(`Transaction failed for track id: ${trackId}`);
            yield (0, service_7.saveUserLog)([
                {
                    post_id: undefined,
                    transaction: trackId !== null && trackId !== void 0 ? trackId : undefined,
                    user: undefined,
                    activity: `Transaction failed for track id: ${trackId}`,
                },
            ]);
        }
    }
    const message = `success=${!!isOperationSucceeded}`;
    return res.redirect(301, `${redirectUrl}${message}${nextOperation ? '&redirect=true' : ''}`);
});
exports.handleKpayResponse = handleKpayResponse;
const handleKpayError = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const trackId = req.query.trackid;
    const redirectUrl = `${config_1.default.origin}/topup?`;
    try {
        yield (0, service_5.editTransactionStatus)(trackId, 'failed');
        yield (0, service_6.removeTempPostByTrackId)(trackId);
    }
    catch (error) {
        logger_1.default.error(`${error.name}: ${error.message}`);
    }
    logger_1.default.error(`Transaction failed for track id: ${trackId}`);
    yield (0, service_7.saveUserLog)([
        {
            post_id: undefined,
            transaction: trackId ? trackId : undefined,
            user: undefined,
            activity: `Transaction failed for track id: ${trackId}`,
        },
    ]);
    return res.redirect(301, `${redirectUrl}success=false`);
});
exports.handleKpayError = handleKpayError;
//# sourceMappingURL=controller.js.map