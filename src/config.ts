import 'dotenv/config'; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
import { readFileSync } from 'fs';

let configObject;

const Environments = {
  development: 'development',
  docker: 'docker-local',
  staging: 'staging',
  production: 'production',
};

function loadConfig() {
  let dbPassword = undefined;
  const NODE_ENV = process.env.NODE_ENV ?? Environments.development;
  try {
    if (process.env.DB_PASS_FILE)
      dbPassword = readFileSync(process.env.DB_PASS_FILE, 'utf-8');
  } catch {
    console.log(`${process.env.DB_PASS_FILE} DOES NOT EXISTS!`);
  }

  const configs = {
    serverPort: process.env.PORT ?? 8002,
    host:
      process.env.NODE_ENV === 'development'
        ? 'localHost'
        : process.env.NODE_ENV === 'docker-local'
          ? 'localHost'
          : process.env.NODE_ENV === 'staging' ? process.env.AUTHORIZED_STAGING : 'localHost',
    logLevel: 'debug',
    documentUrl: '',
    db: {
      type: 'postgres' as const,
      port: 5432,
      host: NODE_ENV === 'development' ? 'localhost' : process.env.DB_HOST,
      username: process.env.DB_USER ?? 'postgres',
      password: dbPassword ?? process.env.DB_PASS ?? 'postgres',
      database: process.env.DB_NAME ?? 'say_nest',
      enabled: true,
      synchronize: true,
      logging: true,
      dropSchema: false,
      autoLoadEntities: true,
      entities: [`${__dirname}/entity/*.js`],
    },
    logPretty: 'LOG_PRETTY_PRINT',
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
