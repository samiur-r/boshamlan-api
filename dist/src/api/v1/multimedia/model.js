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
exports.PostMultimedia = exports.Multimedia = void 0;
// eslint-disable-next-line max-classes-per-file
const typeorm_1 = require("typeorm");
let Multimedia = class Multimedia extends typeorm_1.BaseEntity {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Multimedia.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Multimedia.prototype, "url", void 0);
Multimedia = __decorate([
    (0, typeorm_1.Entity)('multimedia')
], Multimedia);
exports.Multimedia = Multimedia;
let PostMultimedia = class PostMultimedia extends typeorm_1.BaseEntity {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], PostMultimedia.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)('Post', 'post_multimedia'),
    (0, typeorm_1.JoinColumn)({ name: 'post_id' }),
    __metadata("design:type", Object)
], PostMultimedia.prototype, "post", void 0);
__decorate([
    (0, typeorm_1.OneToOne)('Multimedia'),
    (0, typeorm_1.JoinColumn)({ name: 'multimedia_id' }),
    __metadata("design:type", Object)
], PostMultimedia.prototype, "multimedia", void 0);
PostMultimedia = __decorate([
    (0, typeorm_1.Entity)('post_multimedia')
], PostMultimedia);
exports.PostMultimedia = PostMultimedia;
//# sourceMappingURL=model.js.map