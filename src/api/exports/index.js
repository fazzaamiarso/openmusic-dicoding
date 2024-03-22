const ExportsHandler = require("./handler");
const { registerRoutes } = require("./routes");

module.exports = {
  name: "exports",
  version: "1.0.0",
  register: async (server, { service, validator }) => {
    const exportsHandler = new ExportsHandler(service, validator);
    server.route(registerRoutes(exportsHandler));
  },
};
