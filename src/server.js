const Hapi = require("@hapi/hapi");
const Dotenv = require("dotenv");
const Jwt = require("@hapi/jwt");

const ClientError = require("./exceptions/ClientError");

const {
  AlbumsService,
  SongsService,
  UsersService,
  AuthenticationsService,
} = require("./infra/postgres");

const {
  AlbumsValidator,
  SongsValidator,
  UsersValidator,
  AuthenticationsValidator,
} = require("./validator");

const {
  AlbumsPlugin,
  SongsPlugin,
  UsersPlugin,
  AuthenticationsPlugin,
} = require("./api");

const TokenManager = require("./tokenize/TokenManager");

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

  const albumsService = new AlbumsService();
  const songsService = new SongsService();
  const usersService = new UsersService();
  const authenticationsService = new AuthenticationsService();

  await server.register([
    {
      plugin: Jwt,
    },
    {
      plugin: AlbumsPlugin,
      options: {
        service: albumsService,
        validator: AlbumsValidator,
      },
    },
    {
      plugin: SongsPlugin,
      options: {
        service: songsService,
        validator: SongsValidator,
      },
    },
    {
      plugin: UsersPlugin,
      options: {
        service: usersService,
        validator: UsersValidator,
      },
    },
    {
      plugin: AuthenticationsPlugin,
      options: {
        usersService,
        authenticationsService,
        tokenManager: TokenManager,
        validator: AuthenticationsValidator,
      },
    },
  ]);

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
