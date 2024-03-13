const UsersHandler = require("./handler");
const { registerRoutes } = require("./routes");

const plugin = {
  version: "1.0.0",
  name: "users",
  register: (server, options) => {
    const { service, validator } = options;
    const usersHandler = new UsersHandler(service, validator);

    server.route(registerRoutes(usersHandler));
  },
};

module.exports = plugin;
