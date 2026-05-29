import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useWebSocketAdapter(new IoAdapter(app));
  app.enableCors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true });
  await app.listen(process.env.PORT || 3001);
  console.log(`🚛 TruckBid API running on http://localhost:${process.env.PORT || 3001}`);
  console.log(`📡 WebSocket ready on ws://localhost:${process.env.PORT || 3001}`);
}
bootstrap();
