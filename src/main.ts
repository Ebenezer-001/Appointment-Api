import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.setGlobalPrefix('api/v1');

  app.enableCors({
    origin: ['http://localhost:5173','https://appointment-frontend-phi.vercel.app'],
    credentials: true,
  });

  const port = process.env.PORT || 4000;

  await app.listen(port);
  console.log(`Backend running on http://localhost:${port}`);
}
bootstrap();
