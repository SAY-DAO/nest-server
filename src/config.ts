import 'dotenv/config'; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import

let configObject;

function loadConfig() {
  return {
    serverPort: 8002,
    host:
      process.env.NODE_ENV === 'development'
        ? 'localHost'
        : process.env.NODE_ENV === 'docker-local'
          ? 'localHost'
          : process.env.NODE_ENV === 'staging' ? process.env.AUTHORIZED_DOCS_STAGING_2 : 'localHost',
    logLevel: 'debug',
    db: {
      type: 'postgres' as const,
      port: 5432,
      host:
        process.env.NODE_ENV === 'development'
          ? 'localHost'
          : process.env.DB_HOST,
      username: 'postgres',
      password: 'postgres',
      database: 'say_nest',
      enabled: true,
      synchronize: true,
      logging: true,
      dropSchema: false,
      autoLoadEntities: true,
      entities: [`${__dirname}/entity/*.js`],
    },
    logPretty: 'LOG_PRETTY_PRINT',
  };
}

export type ConfigType = ReturnType<typeof loadConfig>;

export default function config(): ConfigType {
  if (!configObject) {
    configObject = loadConfig();
  }

  return configObject;
}
