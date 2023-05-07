const SongsHandler = require("./handler");
const { registerRoutes } = require("./routes");

const plugin = {
  version: "1.0.0",
  name: "songs",
  register: (server, options) => {
    const { service, validator } = options;
    const songsHandler = new SongsHandler(service, validator);

    server.route(registerRoutes(songsHandler));
  },
};

module.exports = plugin;
