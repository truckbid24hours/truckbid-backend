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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListingsController = void 0;
const common_1 = require("@nestjs/common");
const listings_service_1 = require("./listings.service");
const jwt_guard_1 = require("../common/guards/jwt.guard");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
let ListingsController = class ListingsController {
    constructor(listingsService) {
        this.listingsService = listingsService;
    }
    getAll(filters) {
        return this.listingsService.getAll(filters);
    }
    getPending() {
        return this.listingsService.getPendingListings();
    }
    getMy(user) {
        return this.listingsService.getMyListings(user.id);
    }
    getOne(id) {
        return this.listingsService.getOne(id);
    }
    create(user, body) {
        return this.listingsService.create(user.id, body);
    }
    testApprove(id) {
        return this.listingsService.approveListing(id, true);
    }
    update(id, user, body) {
        return this.listingsService.update(id, user.id, body);
    }
    addPhotos(id, user, body) {
        return this.listingsService.addPhotos(id, user.id, body.urls);
    }
    approve(id, body) {
        return this.listingsService.approveListing(id, body.approved);
    }
    feePaid(id, body) {
        return this.listingsService.markListingFeePaid(id, body.txnId);
    }
};
exports.ListingsController = ListingsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ListingsController.prototype, "getAll", null);
__decorate([
    (0, common_1.Get)('pending-admin'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ListingsController.prototype, "getPending", null);
__decorate([
    (0, common_1.Get)('my'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ListingsController.prototype, "getMy", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ListingsController.prototype, "getOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ListingsController.prototype, "create", null);
__decorate([
    (0, common_1.Put)('test-approve/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ListingsController.prototype, "testApprove", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], ListingsController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/photos'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], ListingsController.prototype, "addPhotos", null);
__decorate([
    (0, common_1.Put)(':id/approve'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ListingsController.prototype, "approve", null);
__decorate([
    (0, common_1.Put)(':id/fee-paid'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ListingsController.prototype, "feePaid", null);
exports.ListingsController = ListingsController = __decorate([
    (0, common_1.Controller)('listings'),
    __metadata("design:paramtypes", [listings_service_1.ListingsService])
], ListingsController);
//# sourceMappingURL=listings.controller.js.map