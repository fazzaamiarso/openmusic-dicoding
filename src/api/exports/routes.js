const registerRoutes = (handler) => [
  {
    method: "POST",
    path: "/export/notes",
    handler: handler.postExportNotesHandler,
    options: {
      auth: "openmusic_jwt",
    },
  },
];

module.exports = { registerRoutes };
