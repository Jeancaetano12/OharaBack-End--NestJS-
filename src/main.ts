import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle ('Ohara API')
    .setDescription('Descricao da API')
    .setVersion('1.0')
    .addApiKey({ type: 'apiKey', name: 'X-SITE-KEY', in: 'header' }, 'SITE_KEY')
    .addApiKey({ type: 'apiKey', name: 'X-API-KEY', in: 'header' }, 'BOT_KEY')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api-docs', app, document, {
    customCssUrl: '/swagger-ui/swagger-ui.css',
    customJs: [
      '/swagger-ui/swagger-ui-bundle.js',
      '/swagger-ui/swagger-ui-standalone-preset.js',
    ],
    customfavIcon: '/swagger-ui/favicon-32x32.png',
  });

  app.use(helmet());

  app.useGlobalPipes(new ValidationPipe({
    transform: true, 
    whitelist: true,
    forbidNonWhitelisted: true,
  }));

  app.enableCors({
    origin:['http://localhost:3001', 'http://localhost:3000', 'https://ohara-back-end.vercel.app', 'https://ohara-site.vercel.app'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();