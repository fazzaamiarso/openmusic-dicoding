const registerRoutes = (handler) => [
  { path: "/albums", method: "POST", handler: handler.postAlbumHandler },
  { path: "/albums/{id}", method: "GET", handler: handler.getAlbumByIdHandler },
  { path: "/albums/{id}", method: "PUT", handler: handler.putAlbumHandler },
  {
    path: "/albums/{id}",
    method: "DELETE",
    handler: handler.deleteAlbumHandler,
  },
];

module.exports = { registerRoutes };
