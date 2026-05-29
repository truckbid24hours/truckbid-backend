"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const platform_socket_io_1 = require("@nestjs/platform-socket.io");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new common_1.ValidationPipe({ whitelist: true, transform: true }));
    app.useWebSocketAdapter(new platform_socket_io_1.IoAdapter(app));
    app.enableCors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true });
    await app.listen(process.env.PORT || 3001);
    console.log(`🚛 TruckBid API running on http://localhost:${process.env.PORT || 3001}`);
    console.log(`📡 WebSocket ready on ws://localhost:${process.env.PORT || 3001}`);
}
bootstrap();
//# sourceMappingURL=main.js.map