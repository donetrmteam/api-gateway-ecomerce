import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import { parse } from 'path';
import * as dotenv from 'dotenv'

dotenv.config()

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Habilitar CORS
  app.enableCors();
  
  // Configuración Swagger 
  const config = new DocumentBuilder()
    .setTitle('API Gateway')
    .setDescription('API Gateway para los servicios de productos y usuarios')
    .setVersion('1.0')
    .addTag('auth', 'Operaciones de autenticación')
    .addTag('products', 'Operaciones relacionadas con productos')
    .addTag('users', 'Operaciones relacionadas con usuarios')
    .addTag('cart', 'Operaciones relacionadas con el carrito de compras')
    .addServer("/", "Producción")
    .addServer("/dev", "Desarrollo")
    .addServer("/qa", "QA")
    .addBearerAuth({
      type: 'http', 
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'JWT',
      description: 'Ingrese el token JWT',
      in: 'header',
    })
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Configuración de validación global
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }));

  console.log(`API Gateway iniciado en puerto `, process.env.TCP_PORT);
  await app.listen(parseInt(process.env.TCP_PORT || '3012'));
}
bootstrap();
