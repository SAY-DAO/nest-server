import { ApplicationContext } from './context';
import { NestFactory } from '@nestjs/core';
// import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AppModule } from './app.module';
import config from './config';
import * as bodyParser from 'body-parser';

async function startServer() {
  console.log('Environment:' + process.env.NODE_ENV);
  console.log('Started server');
  console.log('Host:' + config().host);
  console.log('Port:' + config().serverPort);
  console.log('db Host:' + config().db.host);
  console.log('db Port:' + config().db.port);

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
  // For large transactions
  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
  app.enableCors({
//     origin: [
//       'localhost',
//       process.env.AUTHORIZED_DAPP_LOCAL,
//       process.env.AUTHORIZED_PANEL_LOCAL,
//       process.env.AUTHORIZED_PANEL_PRODUCTION,
//       process.env.AUTHORIZED_HOST_PRODUCTION,
//       process.env.AUTHORIZED_HOST_STAGING,
//       process.env.AUTHORIZED_DOCS_LOCAL,
//     ],
    allowedHeaders: ['Origin,X-Requested-With,Content-Type,Accept'],
    methods: ['GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS'],
    optionsSuccessStatus: 200,
    credentials: true,
  });
  console.log('Cors Enabled:' + process.env.AUTHORIZED_DAPP_LOCAL);
  console.log('Cors Enabled:' + process.env.AUTHORIZED_PANEL_LOCAL);
  console.log('Cors Enabled:' + process.env.AUTHORIZED_PANEL_PRODUCTION);
  console.log('Cors Enabled:' + process.env.AUTHORIZED_DOCS_PRODUCTION_1);
  console.log('Cors Enabled:' + process.env.AUTHORIZED_DOCS_PRODUCTION_2);
  console.log('Cors Enabled:' + process.env.AUTHORIZED_DOCS_STAGING_1);
  console.log('Cors Enabled:' + process.env.AUTHORIZED_DOCS_STAGING_2);
  console.log('Cors Enabled:' + process.env.AWS_SERVER);

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
