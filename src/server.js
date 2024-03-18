const Hapi = require("@hapi/hapi");
const Dotenv = require("dotenv");
const JWT = require("@hapi/jwt");

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
} = require("./validator");

const {
  AlbumsPlugin,
  SongsPlugin,
  UsersPlugin,
  AuthenticationsPlugin,
  PlaylistsPlugin,
  CollaborationsPlugin,
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
  const collaborationService = new CollaborationsService();
  const playlistsService = new PlaylistsService(collaborationService);
  const activitiesService = new ActivitiesService();

  await server.register(JWT);

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
