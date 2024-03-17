const PlaylistsHandler = require("./handler");
const { registerRoutes } = require("./routes");

const plugin = {
  version: "1.0.0",
  name: "playlists",
  register: (server, options) => {
    const { service, songsService, activitiesService, validator } = options;
    const playlistsHandler = new PlaylistsHandler(
      service,
      songsService,
      activitiesService,
      validator
    );

    server.route(registerRoutes(playlistsHandler));
  },
};

module.exports = plugin;
