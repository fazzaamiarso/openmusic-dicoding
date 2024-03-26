const envConfig = {
  app: {
    host: process.env.HOST,
    port: process.env.PORT,
    access_token_key: process.env.ACCESS_TOKEN_KEY,
    refresh_token_key: process.env.REFRESH_TOKEN_KEY,
    access_token_age: process.env.ACCESS_TOKEN_AGE,
  },
  rabbitmq: {
    server: process.env.RABBITMQ_SERVER,
  },
  redis: {
    server: process.env.REDIS_SERVER,
  },
};

module.exports = { envConfig };
