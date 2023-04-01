import { ApplicationContext } from './context';
import session from 'express-session';
import config from './config';
import * as bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import connect from 'connect-pg-simple';
import pg from 'pg';

async function startServer() {
  console.log('Environment:' + process.env.NODE_ENV);
  console.log('Started server');
  console.log('Host:' + config().host);
  console.log('Port:' + config().serverPort);
  console.log('db Host:' + config().db1.host);
  console.log('db Port:' + config().db1.port);
  console.log('db password:' + config().db1.password);
  console.log('Cors Enabled:' + process.env.AUTHORIZED_DAPP_LOCAL);
  console.log('Cors Enabled:' + process.env.AUTHORIZED_PANEL_LOCAL);
  console.log('Cors Enabled:' + process.env.AUTHORIZED_PANEL_PRODUCTION);
  console.log('Cors Enabled:' + process.env.AUTHORIZED_HOST_PRODUCTION);
  console.log('Cors Enabled:' + process.env.AUTHORIZED_HOST_STAGING);
  console.log('Cors Enabled:' + process.env.AUTHORIZED_DOCS_LOCAL);

  const app = await ApplicationContext();
  app.enableShutdownHooks();
  app.setGlobalPrefix('api/dao');
  // For large transactions
  app.use(bodyParser.json({ limit: '50mb' }));
  // app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
  app.enableCors({
    origin: [
      "http://localhost:3000",
      process.env.AUTHORIZED_DAPP_LOCAL,
      process.env.AUTHORIZED_PANEL_LOCAL,
      process.env.AUTHORIZED_PANEL_PRODUCTION,
      process.env.AUTHORIZED_HOST_PRODUCTION,
      process.env.AUTHORIZED_HOST_STAGING,
      process.env.AUTHORIZED_DOCS_LOCAL,
    ],
    allowedHeaders: [
      'Origin,X-Requested-With,Content-Type ,Accept,X-TAKE, X-SKIP, authorization',
      'Access-Control-Allow-Headers',
      'Access-Control-Allow-Credentials',
      'Access-Control-Allow-Methods',
      'Access-Control-Allow-Origin',
    ],

    methods: ['GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS'],
    optionsSuccessStatus: 200,
    credentials: true,
  });


  app.use(cookieParser());

  const pgPool = new pg.Pool({
    port: 5432,
    user: process.env.DB_USER ?? 'postgres',
    host:
      process.env.NODE_ENV === 'development'
        ? 'localhost'
        : process.env.DB_HOST,
    password: process.env.DB_PASS ?? 'postgres',
    database: process.env.DB_NAME ?? 'say_dapp',
  });

  app.use(
    session({
      store: new (connect(session))({
        pool: pgPool, // Connection pool
        // Insert connect-pg-simple options here
      }),
      name: 'SAY-DAO-SESSION',
      secret: 'mySecret',
      resave: true,
      saveUninitialized: true,
      cookie: {
        domain: '127.0.0.1',
        path: '/api/dao', secure: false, sameSite: false, maxAge: 1000 * 60 * 60
      }
    }),
  );

  await app.listen(config().serverPort);
}

async function stopServer() {
  const app = await ApplicationContext();
  app.close();
}

export { startServer, stopServer };
