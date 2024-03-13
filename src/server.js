const Hapi = require("@hapi/hapi");
const Dotenv = require("dotenv");
const Jwt = require("@hapi/jwt");

const ClientError = require("./exceptions/ClientError");

const AlbumsService = require("./infra/postgres/AlbumsService");
const AlbumsValidator = require("./validator/albums");
const AlbumsPlugin = require("./api/albums/index");

const SongsService = require("./infra/postgres/SongsService");
const SongsValidator = require("./validator/songs");
const SongsPlugin = require("./api/songs/index");

const UsersPlugin = require("./api/users");
const UsersService = require("./infra/postgres/UsersService");
const UsersValidator = require("./validator/users");

const AuthenticationsPlugin = require("./api/authentications");
const AuthenticationsService = require("./infra/postgres/AuthenticationsService");
const TokenManager = require("./tokenize/TokenManager");
const AuthenticationsValidator = require("./validator/authentications");

Dotenv.config({
  path:
    process.env.NODE_ENV === "development"
      ? ".env"
      : `.env.${process.env.NODE_ENV}`,
});

const port = process.env.PORT;
const host = process.env.HOST;

const startServer = async () => {
  const server = Hapi.server({
    debug: { request: ["error"] },
    port,
    host,
    routes: {
      cors: {
        origin: ["*"],
      },
    },
  });

  await server.register([
    {
      plugin: Jwt,
    },
  ]);

  await server.register({
    plugin: AlbumsPlugin,
    options: {
      service: new AlbumsService(),
      validator: AlbumsValidator,
    },
  });

  await server.register({
    plugin: SongsPlugin,
    options: {
      service: new SongsService(),
      validator: SongsValidator,
    },
  });

  await server.register({
    plugin: UsersPlugin,
    options: {
      service: new UsersService(),
      validator: UsersValidator,
    },
  });

  await server.register({
    plugin: AuthenticationsPlugin,
    options: {
      authenticationsService: AuthenticationsService,
      usersService: new UsersService(),
      tokenManager: TokenManager,
      validator: AuthenticationsValidator,
    },
  });

  server.auth.strategy("openmusic_jwt", "jwt", {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
  });

  server.ext("onPreResponse", (request, h) => {
    const { response } = request;
    if (response instanceof Error) {
      if (response instanceof ClientError) {
        const newResponse = h
          .response({
            status: "fail",
            message: response.message,
          })
          .code(response.statusCode);
        return newResponse;
      }
      if (!response.isServer) {
        return h.continue;
      }

      const newResponse = h
        .response({
          status: "error",
          message: "Something went wrong!",
        })
        .code(500);
      return newResponse;
    }
    return h.continue;
  });

  await server.start();
  console.log(`Server started on ${server.info.uri}`);
};

startServer();
