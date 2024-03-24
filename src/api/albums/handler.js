const autoBind = require("auto-bind");

class AlbumsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    autoBind(this);
  }

  async getAlbumByIdHandler(request, h) {
    const { id } = request.params;

    const album = await this._service.getAlbumById(id);
    const songsInAlbum = await this._service.getSongsInAlbum(id);

    const albumData = {
      ...album,
      songs: songsInAlbum,
    };

    return h
      .response({ status: "success", data: { album: albumData } })
      .code(200);
  }

  async postAlbumHandler(request, h) {
    const payload = request.payload;
    this._validator.validateAlbumPayload(payload);

    const albumId = await this._service.addAlbum(payload);

    const response = h
      .response({ status: "success", data: { albumId } })
      .code(201);
    return response;
  }

  async putAlbumHandler(request, h) {
    const payload = request.payload;
    this._validator.validateAlbumPayload(payload);

    const { id } = request.params;

    await this._service.editAlbumById({ id, ...payload });

    return h
      .response({
        status: "success",
        message: `Album with id:${id}, succesfully edited!`,
      })
      .code(200);
  }

  async deleteAlbumHandler(request, h) {
    const { id } = request.params;

    await this._service.deleteAlbumById(id);

    return h
      .response({
        status: "success",
        message: `Album with id:${id}, succesfully deleted!`,
      })
      .code(200);
  }

  async deleteAlbumLikeHandler(request, h) {
    const { id: albumId } = request.params;
    const { id: userId } = request.auth.credentials;

    await this._service.deleteLikeAlbum({ userId, albumId });

    return h
      .response({
        status: "success",
        message: `Album id: ${albumId}, succesfully unliked!`,
      })
      .code(200);
  }

  async postAlbumLikeHandler(request, h) {
    const { id: albumId } = request.params;
    const { id: userId } = request.auth.credentials;

    await this._service.getAlbumById(albumId);
    await this._service.checkAlbumLike({ albumId, userId });
    await this._service.postLikeAlbum({ userId, albumId });

    return h
      .response({
        status: "success",
        message: `Album id: ${albumId}, succesfully liked!`,
      })
      .code(201);
  }

  async getAlbumLikesHandler(request, h) {
    const { id: albumId } = request.params;

    const { count: likes } = await this._service.getLikesAlbum({ albumId });

    return h
      .response({
        status: "success",
        data: {
          likes: Number(likes),
        },
      })
      .code(200);
  }
}

module.exports = AlbumsHandler;
