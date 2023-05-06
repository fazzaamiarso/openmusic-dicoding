const Hapi = require("@hapi/hapi");
const Dotenv = require("dotenv");
const ClientError = require("./exceptions/ClientError");

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

  server.ext("onPreResponse", (request, h) => {
    const { response } = request;
    if (response instanceof Error) {
      if (response instanceof ClientError) {
        const newResponse = h.response({
          status: "fail",
          message: response.message,
        });
        newResponse.code(response.statusCode);
        return newResponse;
      }
      if (!response.isServer) {
        return h.continue;
      }
      const newResponse = h.response({
        status: "error",
        message: "Something went wrong!",
      });
      newResponse.code(500);
      return newResponse;
    }
    return h.continue;
  });

  await server.start();
  console.log(`Server started on ${server.info.uri}`);
};

startServer();
