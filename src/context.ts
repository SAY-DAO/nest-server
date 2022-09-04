import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';
import config from './config';

let context: INestApplication = null;
export const ApplicationContext = async () => {
  if (!context) {
    context = await NestFactory.create(AppModule, {
      cors: {
        allowedHeaders: ['Content-Type', 'Authorization'],
        origin: '*',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      },
    });
    const options = new DocumentBuilder()
      .setTitle('SAY DAO')
      .setDescription('DAO API')
      .setVersion('v0.1.0')
      // .addTag('Needs')
      .addServer(
        `http://localhost:${config().serverPort}/api/dao`,
        "Codefi's Example Server",
      )
      .build();
    const document = SwaggerModule.createDocument(context, options);
    SwaggerModule.setup('docs', context, document);
    return context;
  }
};
