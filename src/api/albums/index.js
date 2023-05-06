const AlbumsHandler = require("./handler");
const { registerRoutes } = require("./routes");

const plugin = {
  version: "1.0.0",
  name: "albums",
  register: (server, options) => {
    const { service, validator } = options;
    const albumsHandler = new AlbumsHandler(service, validator);

    server.route(registerRoutes(albumsHandler));
  },
};

module.exports = plugin;
