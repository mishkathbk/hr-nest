import "dotenv/config";
import { NestFactory, Reflector } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";
import { ResponseInterceptor } from "./common/interceptors/response.interceptor";
// import { JwtAuthGuard } from "./common/guards/jwt-auth.guard";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ── CORS
  app.enableCors();

  // ── Global prefix — all routes under /api
  app.setGlobalPrefix("api");

  // ── Global JWT guard — validates every route
  // app.useGlobalGuards(new JwtAuthGuard());

  // ── Global validation pipe (class-validator DTOs)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strip unknown properties
      forbidNonWhitelisted: false,
      transform: true, // auto-cast types (e.g. string → number)
    }),
  );

  // ── Global exception filter (formats all errors into standard shape)
  app.useGlobalFilters(new HttpExceptionFilter());

  // ── Global response interceptor (wraps all success responses)
  app.useGlobalInterceptors(new ResponseInterceptor(app.get(Reflector)));

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Server running on http://localhost:${port}/api`);
}

bootstrap();
