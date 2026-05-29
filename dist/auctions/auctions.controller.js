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
exports.AuctionsController = void 0;
const common_1 = require("@nestjs/common");
const auctions_service_1 = require("./auctions.service");
const jwt_guard_1 = require("../common/guards/jwt.guard");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
let AuctionsController = class AuctionsController {
    constructor(auctionsService) {
        this.auctionsService = auctionsService;
    }
    getAll() { return this.auctionsService.getAll(); }
    getLive() { return this.auctionsService.getLive(); }
    getOne(id) { return this.auctionsService.getOne(id); }
    schedule(body) {
        return this.auctionsService.schedule(body.listingId, body.scheduledStart);
    }
    testSchedule(listingId) {
        const start = new Date(Date.now() - 1000).toISOString();
        return this.auctionsService.schedule(listingId, start);
    }
    goLive(id) { return this.auctionsService.goLive(id); }
    testGoLive(id) { return this.auctionsService.goLive(id); }
    payEmd(id, user, body) {
        return this.auctionsService.payEmd(id, user.id, body.razorpayPayId);
    }
    emdStatus(id, user) {
        return this.auctionsService.getEmdStatus(id, user.id);
    }
    complete(id) { return this.auctionsService.completeAuction(id); }
};
exports.AuctionsController = AuctionsController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AuctionsController.prototype, "getAll", null);
__decorate([
    (0, common_1.Get)('live'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AuctionsController.prototype, "getLive", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AuctionsController.prototype, "getOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuctionsController.prototype, "schedule", null);
__decorate([
    (0, common_1.Post)('test-schedule/:listingId'),
    __param(0, (0, common_1.Param)('listingId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AuctionsController.prototype, "testSchedule", null);
__decorate([
    (0, common_1.Post)(':id/go-live'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AuctionsController.prototype, "goLive", null);
__decorate([
    (0, common_1.Post)('test-go-live/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AuctionsController.prototype, "testGoLive", null);
__decorate([
    (0, common_1.Post)(':id/emd'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], AuctionsController.prototype, "payEmd", null);
__decorate([
    (0, common_1.Get)(':id/emd/status'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AuctionsController.prototype, "emdStatus", null);
__decorate([
    (0, common_1.Post)(':id/complete'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AuctionsController.prototype, "complete", null);
exports.AuctionsController = AuctionsController = __decorate([
    (0, common_1.Controller)('auctions'),
    __metadata("design:paramtypes", [auctions_service_1.AuctionsService])
], AuctionsController);
//# sourceMappingURL=auctions.controller.js.map