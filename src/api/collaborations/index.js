const CollaborationsHandler = require("./handler");
const { registerRoutes } = require("./routes");

const plugin = {
  version: "1.0.0",
  name: "collaborations",
  register: (server, options) => {
    const { service, playlistsService, usersService, validator } = options;
    const collaborationsHandler = new CollaborationsHandler(
      service,
      playlistsService,
      usersService,
      validator
    );

    server.route(registerRoutes(collaborationsHandler));
  },
};

module.exports = plugin;
