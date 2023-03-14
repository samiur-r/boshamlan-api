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
exports.PropertyType = void 0;
const typeorm_1 = require("typeorm");
let PropertyType = class PropertyType extends typeorm_1.BaseEntity {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], PropertyType.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], PropertyType.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: null }),
    __metadata("design:type", String)
], PropertyType.prototype, "title_plural", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', default: null }),
    __metadata("design:type", String)
], PropertyType.prototype, "article_rent", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', default: null }),
    __metadata("design:type", String)
], PropertyType.prototype, "article_sale", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', default: null }),
    __metadata("design:type", String)
], PropertyType.prototype, "article_exchange", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', default: null }),
    __metadata("design:type", String)
], PropertyType.prototype, "article_rent_city", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', default: null }),
    __metadata("design:type", String)
], PropertyType.prototype, "article_sale_city", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', default: null }),
    __metadata("design:type", String)
], PropertyType.prototype, "article_exchange_city", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', default: null }),
    __metadata("design:type", String)
], PropertyType.prototype, "article_rent_state", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', default: null }),
    __metadata("design:type", String)
], PropertyType.prototype, "article_sale_state", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', default: null }),
    __metadata("design:type", String)
], PropertyType.prototype, "article_exchange_state", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', default: null }),
    __metadata("design:type", String)
], PropertyType.prototype, "meta_title_rent", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', default: null }),
    __metadata("design:type", String)
], PropertyType.prototype, "meta_title_sale", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', default: null }),
    __metadata("design:type", String)
], PropertyType.prototype, "meta_title_exchange", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', default: null }),
    __metadata("design:type", String)
], PropertyType.prototype, "meta_title_rent_city", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', default: null }),
    __metadata("design:type", String)
], PropertyType.prototype, "meta_title_sale_city", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', default: null }),
    __metadata("design:type", String)
], PropertyType.prototype, "meta_title_exchange_city", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', default: null }),
    __metadata("design:type", String)
], PropertyType.prototype, "meta_title_rent_state", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', default: null }),
    __metadata("design:type", String)
], PropertyType.prototype, "meta_title_sale_state", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', default: null }),
    __metadata("design:type", String)
], PropertyType.prototype, "meta_title_exchange_state", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', default: null }),
    __metadata("design:type", String)
], PropertyType.prototype, "meta_description_rent", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', default: null }),
    __metadata("design:type", String)
], PropertyType.prototype, "meta_description_sale", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', default: null }),
    __metadata("design:type", String)
], PropertyType.prototype, "meta_description_exchange", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', default: null }),
    __metadata("design:type", String)
], PropertyType.prototype, "meta_description_rent_city", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', default: null }),
    __metadata("design:type", String)
], PropertyType.prototype, "meta_description_sale_city", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', default: null }),
    __metadata("design:type", String)
], PropertyType.prototype, "meta_description_exchange_city", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', default: null }),
    __metadata("design:type", String)
], PropertyType.prototype, "meta_description_rent_state", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', default: null }),
    __metadata("design:type", String)
], PropertyType.prototype, "meta_description_sale_state", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', default: null }),
    __metadata("design:type", String)
], PropertyType.prototype, "meta_description_exchange_state", void 0);
__decorate([
    (0, typeorm_1.OneToMany)('Post', 'property_type'),
    __metadata("design:type", Array)
], PropertyType.prototype, "post", void 0);
PropertyType = __decorate([
    (0, typeorm_1.Entity)('property_types')
], PropertyType);
exports.PropertyType = PropertyType;
//# sourceMappingURL=model.js.map