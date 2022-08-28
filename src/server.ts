import { ApplicationContext } from './context';
import { NestFactory } from '@nestjs/core';
// import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AppModule } from './app.module';
import config from './config';

async function startServer() {
  console.log('Started server');
  // const app = await NestFactory.createMicroservice<MicroserviceOptions>(
  //   AppModule,
  //   {
  //     transport: Transport.RMQ,
  //     options: {
  //       urls: [
  //         'amqps://erfsyjet:FArnrq1t2YJW9ZLGzBIrYcBUz2HvHpNS@shark.rmq.cloudamqp.com/erfsyjet',
  //       ],
  //       queue: 'main_queue',
  //       queueOptions: {
  //         durable: false,
  //       },
  //     },
  //   },
  // );

  // await app.listen();

  const app = await ApplicationContext();
  app.enableShutdownHooks();
  app.setGlobalPrefix('api/dao');
  app.enableCors({
    origin: 'http://localhost:3000',
  });
  app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    next();
  });
  await app.listen(config().serverPort);
}

async function stopServer() {
  const app = await ApplicationContext();
  app.close();
}

export { startServer, stopServer };
