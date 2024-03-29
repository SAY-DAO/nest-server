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
      .addBearerAuth(
        { 
          description: `[just text field] Please enter token in following format: Bearer <JWT>`,
          name: 'authorization',
          bearerFormat: 'Bearer',
          scheme: 'Bearer',
          type: 'http', 
          in: 'Header'
        },
        'flask-access-token', // This name here is important for matching up with @ApiBearerAuth() in your controller!
      )
      .build();
    const document = SwaggerModule.createDocument(context, options);
    SwaggerModule.setup('docs', context, document);
    return context;
  }
};
