/* eslint-disable class-methods-use-this */
/* eslint-disable no-underscore-dangle */
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
    return h.response({ status: "success", data: { album } });
  }

  async postAlbumHandler(request, h) {
    const { name, year } = request.payload;

    const albumId = await this._service.addAlbum({ name, year });

    return h.response({ status: "success", data: { albumId } });
  }

  async putAlbumHandler(request, h) {
    const { id } = request.params;
    const { name, year } = request.payload;

    await this._service.editAlbumById({ id, name, year });

    return h.response({ status: "success", message: "Edit successful!" });
  }

  async deleteAlbumHandler(request, h) {
    const { id } = request.params;

    await this._service.deleteAlbumById(id);

    return h.response({ status: "success", message: "Delete successful!" });
  }
}

module.exports = AlbumsHandler;
