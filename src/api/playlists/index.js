const PlaylistsHandler = require("./handler");
const { registerRoutes } = require("./routes");

const plugin = {
  version: "1.0.0",
  name: "playlists",
  register: (server, options) => {
    const { service, songsService, validator } = options;
    const playlistsHandler = new PlaylistsHandler(
      service,
      songsService,
      validator
    );

    server.route(registerRoutes(playlistsHandler));
  },
};

module.exports = plugin;
