"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transaction = void 0;
const typeorm_1 = require("typeorm");
const model_1 = require("../packages/model");
const model_2 = require("../users/model");
let Transaction = class Transaction extends typeorm_1.BaseEntity {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Transaction.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        unique: true,
        type: 'bigint',
    }),
    __metadata("design:type", String)
], Transaction.prototype, "track_id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        default: null,
        nullable: true,
    }),
    __metadata("design:type", String)
], Transaction.prototype, "reference_id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        default: null,
        nullable: true,
    }),
    __metadata("design:type", String)
], Transaction.prototype, "tran_id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        default: null,
    }),
    __metadata("design:type", String)
], Transaction.prototype, "response", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Transaction.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({
        default: 'created',
    }),
    __metadata("design:type", String)
], Transaction.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Transaction.prototype, "package_title", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => model_2.User, { nullable: false, eager: true }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", Object)
], Transaction.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => model_1.Package, { nullable: false, eager: true }),
    (0, typeorm_1.JoinColumn)({ name: 'package_id' }),
    __metadata("design:type", Object)
], Transaction.prototype, "package", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Transaction.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Transaction.prototype, "updated_at", void 0);
Transaction = __decorate([
    (0, typeorm_1.Entity)('transactions')
], Transaction);
exports.Transaction = Transaction;
//# sourceMappingURL=model.js.map