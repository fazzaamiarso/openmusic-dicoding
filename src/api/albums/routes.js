const path = require("path");

const registerRoutes = (handler) => [
  { path: "/albums", method: "POST", handler: handler.postAlbumHandler },
  { path: "/albums/{id}", method: "GET", handler: handler.getAlbumByIdHandler },
  { path: "/albums/{id}", method: "PUT", handler: handler.putAlbumHandler },
  {
    path: "/albums/{id}",
    method: "DELETE",
    handler: handler.deleteAlbumHandler,
  },
  {
    path: "/albums/{id}/likes",
    method: "DELETE",
    handler: handler.deleteAlbumLikeHandler,
    options: {
      auth: "openmusic_jwt",
    },
  },
  {
    path: "/albums/{id}/likes",
    method: "POST",
    handler: handler.postAlbumLikeHandler,
    options: {
      auth: "openmusic_jwt",
    },
  },
  {
    path: "/albums/{id}/likes",
    method: "GET",
    handler: handler.getAlbumLikesHandler,
  },
  {
    method: "POST",
    path: "/albums/{id}/covers",
    handler: handler.postUploadCoverHandler,
    options: {
      payload: {
        allow: "multipart/form-data",
        multipart: true,
        maxBytes: 512000,
        output: "stream",
      },
    },
  },
  {
    method: "GET",
    path: "/albums/{param*}",
    handler: {
      directory: {
        path: path.resolve(__dirname, "uploads"),
      },
    },
  },
];

module.exports = { registerRoutes };
