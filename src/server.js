const Hapi = require("@hapi/hapi");
const Dotenv = require("dotenv");
const ClientError = require("./exceptions/ClientError");

const AlbumsService = require("./infra/postgres/AlbumsService");
const AlbumsValidator = require("./validator/albums");
const AlbumsPlugin = require("./api/albums/index");

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
    port,
    host,
    routes: {
      cors: {
        origin: ["*"],
      },
    },
  });

  await server.register({
    plugin: AlbumsPlugin,
    options: {
      service: new AlbumsService(),
      validator: AlbumsValidator,
    },
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
