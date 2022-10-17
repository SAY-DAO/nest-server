import 'dotenv/config'; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import

let configObject;

function loadConfig() {
  return {
    serverPort: 8002,
    logLevel: 'debug',
    db: {
      type: 'postgres' as const,
      port: 5432,
      host: 'say_nest_db',
      username: 'postgres',
      password: 'postgres',
      database: 'say_nest',
      enabled: true,
      synchronize: true,
      logging: true,
      dropSchema: false,
      autoLoadEntities: true,
      entities: [`${__dirname}/entity/*.js`]

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
