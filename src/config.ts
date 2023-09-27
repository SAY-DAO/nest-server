import 'dotenv/config'; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
import DataCache from './utils/dataCache';

let configObject;

const Environments = {
  development: 'development',
  docker: 'docker-local',
  staging: 'staging',
  production: 'production',
};

function loadConfig() {
  const NODE_ENV = process.env.NODE_ENV ?? Environments.development;

  const configs = {
    serverPort: process.env.PORT || 8002,
    host:
      process.env.NODE_ENV === 'development' ||
      process.env.NODE_ENV === undefined
        ? 'localHost'
        : process.env.NODE_ENV === 'docker-local'
        ? 'localHost'
        : process.env.NODE_ENV === 'staging'
        ? process.env.AUTHORIZED_HOST_STAGING
        : process.env.NEST_SERVER_PROD,
    logLevel: 'debug',
    documentUrl: '',
    db1: {
      type: 'postgres' as const,
      port: 5432,
      host: NODE_ENV === 'development' ? 'localhost' : process.env.DB_HOST,
      username: process.env.DB_USER ?? 'postgres',
      password: process.env.DB_PASS ?? 'postgres',
      database: process.env.DB_NAME ?? 'say_dapp',
      enabled: true,
      synchronize: NODE_ENV === 'development' ? false : false, // true shouldn't be used in production - otherwise you can lose production data.
      logging: true,
      dropSchema: false,
      autoLoadEntities: true,
      migrationsRun: true,
      migrations: [`dist/db/migrations/*.js`],
    },
    db2: {
      name: 'flaskPostgres',
      type: 'postgres' as const,
      port: 35432,
      host: process.env.DB_FLASK_HOST,
      username: process.env.DB_FLASK_USER,
      password: process.env.DB_FLASK_PASS,
      database: process.env.DB_FLASK_NAME,
      enabled: true,
      synchronize: false,
      logging: true,
      dropSchema: false,
      autoLoadEntities: true,
      // entities: [`${__dirname}/entities/flaskEntities/*.js`],
    },
    logPretty: 'LOG_PRETTY_PRINT',
    dataCache: new DataCache(),
  };

  configs.documentUrl =
    NODE_ENV === Environments.staging || NODE_ENV === Environments.production
      ? `https://${configs.host}/api/dao`
      : `http://${configs.host}:${configs.serverPort}/api/dao`;

  return configs;
}
export type ConfigType = ReturnType<typeof loadConfig>;

export default function config(): ConfigType {
  if (!configObject) {
    configObject = loadConfig();
  }

  return configObject;
}

export const PRODUCT_UNPAYABLE_PERIOD = 24;
