import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import config from './config';
import { NestExpressApplication } from '@nestjs/platform-express';

let context: NestExpressApplication
export const ApplicationContext = async () => {
  if (!context) {
    context = await NestFactory.create<NestExpressApplication>(AppModule);

    const options = new DocumentBuilder()
      .setTitle('SAY DAO')
      .setDescription('DAO API')
      .setVersion('v0.1.0')
      .addServer(config().documentUrl, 'The Server')
      .build();
    const document = SwaggerModule.createDocument(context, options);
    SwaggerModule.setup('docs', context, document);
    return context;
  }
};
