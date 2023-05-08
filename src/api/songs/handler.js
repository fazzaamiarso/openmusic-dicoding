/* eslint-disable class-methods-use-this */
/* eslint-disable no-underscore-dangle */
const autoBind = require("auto-bind");

class SongsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    autoBind(this);
  }

  async getAllSongsHandler(request, h) {
    const songs = await this._service.getAllSongs(request.query);

    return h.response({ status: "success", data: { songs } }).code(200);
  }

  async getSongByIdHandler(request, h) {
    const { id } = request.params;

    const song = await this._service.getSongById(id);
    return h.response({ status: "success", data: { song } }).code(200);
  }

  async postSongHandler(request, h) {
    const payload = request.payload;
    this._validator.validateSongPayload(payload);

    const songId = await this._service.addSong(payload);

    const response = h
      .response({ status: "success", data: { songId } })
      .code(201);
    return response;
  }

  async putSongHandler(request, h) {
    const payload = request.payload;
    this._validator.validateSongPayload(payload);

    const { id } = request.params;

    await this._service.editSongById({ id, ...payload });

    return h
      .response({ status: "success", message: "Edit successful!" })
      .code(200);
  }

  async deleteSongByIdHandler(request, h) {
    const { id } = request.params;

    await this._service.deleteSongById(id);

    return h
      .response({ status: "success", message: "Delete successful!" })
      .code(200);
  }
}

module.exports = SongsHandler;
