const registerRoutes = (handler) => [
  { path: "/songs", method: "GET", handler: handler.getAllSongsHandler },
  { path: "/songs", method: "POST", handler: handler.postSongHandler },
  { path: "/songs/{id}", method: "GET", handler: handler.getSongByIdHandler },
  { path: "/songs/{id}", method: "PUT", handler: handler.putSongHandler },
  {
    path: "/songs/{id}",
    method: "DELETE",
    handler: handler.deleteSongByIdHandler,
  },
];

module.exports = { registerRoutes };
