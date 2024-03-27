const Hapi = require("@hapi/hapi");
const Dotenv = require("dotenv");
const JWT = require("@hapi/jwt");
const Inert = require("@hapi/inert");
const path = require("path");

Dotenv.config({
  path:
    process.env.NODE_ENV === "development"
      ? ".env"
      : `.env.${process.env.NODE_ENV}`,
});

const ClientError = require("./exceptions/ClientError");

const {
  AlbumsService,
  SongsService,
  UsersService,
  AuthenticationsService,
  PlaylistsService,
  CollaborationsService,
  ActivitiesService,
} = require("./infra/postgres");

const {
  AlbumsValidator,
  SongsValidator,
  UsersValidator,
  AuthenticationsValidator,
  PlaylistsValidator,
  CollaborationsValidator,
  ExportsValidator,
} = require("./validator");

const {
  AlbumsPlugin,
  SongsPlugin,
  UsersPlugin,
  AuthenticationsPlugin,
  PlaylistsPlugin,
  CollaborationsPlugin,
  ExportsPlugin,
} = require("./api");

const TokenManager = require("./tokenize/TokenManager");

const SenderService = require("./infra/rabbitmq/SenderService");

const CacheService = require("./infra/redis/CacheService");

const StorageService = require("./infra/storage/StorageService");

const { envConfig } = require("./utils/env");

const port = envConfig.app.port;
const host = envConfig.app.host;

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

  const cacheService = new CacheService();
  const albumsService = new AlbumsService(cacheService);
  const songsService = new SongsService(cacheService);
  const usersService = new UsersService();
  const authenticationsService = new AuthenticationsService();
  const collaborationService = new CollaborationsService();
  const playlistsService = new PlaylistsService(
    collaborationService,
    cacheService
  );
  const activitiesService = new ActivitiesService(cacheService);
  const storageService = new StorageService(
    path.resolve(__dirname, "api/albums/uploads")
  );

  await server.register(JWT);
  await server.register(Inert);

  server.auth.strategy("openmusic_jwt", "jwt", {
    keys: envConfig.app.access_token_key,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: envConfig.app.access_token_age,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
  });

  await server.register([
    {
      plugin: AuthenticationsPlugin,
      options: {
        usersService,
        authenticationsService,
        tokenManager: TokenManager,
        validator: AuthenticationsValidator,
      },
    },
    {
      plugin: AlbumsPlugin,
      options: {
        storageService,
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
      plugin: PlaylistsPlugin,
      options: {
        songsService,
        activitiesService,
        service: playlistsService,
        validator: PlaylistsValidator,
      },
    },
    {
      plugin: CollaborationsPlugin,
      options: {
        playlistsService,
        usersService,
        service: collaborationService,
        validator: CollaborationsValidator,
      },
    },
    {
      plugin: ExportsPlugin,
      options: {
        playlistsService,
        service: SenderService,
        validator: ExportsValidator,
      },
    },
  ]);

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
          message: response.message || "Something went wrong!",
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
