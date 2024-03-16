const autoBind = require("auto-bind");

class PlaylistsHandler {
  constructor(service, songsService, validator) {
    this._service = service;
    this._songsService = songsService;
    this._validator = validator;

    autoBind(this);
  }

  async postPlaylistHandler(request, h) {
    this._validator.validatePostPlaylistPayload(request.payload);

    const { name } = request.payload;
    const { id: ownerId } = request.auth.credentials;

    const playlistId = await this._service.addPlaylist({ name, ownerId });

    const response = h
      .response({ status: "success", data: { playlistId } })
      .code(201);
    return response;
  }

  async getAllPlaylistHandler(request, h) {
    const { id: ownerId } = request.auth.credentials;

    const playlists = await this._service.getAllPlaylists({ ownerId });

    const response = h
      .response({ status: "success", data: { playlists } })
      .code(200);
    return response;
  }

  async deletePlaylistHandler(request, h) {
    const { id: playlistId } = request.params;
    const { id: ownerId } = request.auth.credentials;

    await this._service.verifyPlaylistOwner(playlistId, ownerId);

    await this._service.deletePlaylist({ playlistId });

    return h
      .response({
        status: "success",
        message: `Playlist with id:${playlistId}, succesfully deleted!`,
      })
      .code(200);
  }

  async deletePlaylistSongHandler(request, h) {
    this._validator.validateDeletePlaylistSongPayload(request.payload);

    const { id: playlistId } = request.params;
    const { songId } = request.payload;
    const { id: ownerId } = request.auth.credentials;

    await this._service.verifyPlaylistOwner(playlistId, ownerId);

    await this._service.deletePlaylistSong({ playlistId, songId });

    return h
      .response({
        status: "success",
        message: `Song with id:${songId}, succesfully deleted!`,
      })
      .code(200);
  }

  async addSongToPlaylistHandler(request, h) {
    const { songId } = request.payload;
    const { id: playlistId } = request.params;
    const { id: ownerId } = request.auth.credentials;

    this._validator.validatePostPlaylistSongPayload(request.payload);

    await this._songsService.getSongById(songId);

    await this._service.verifyPlaylistOwner(playlistId, ownerId);

    await this._service.addSongToPlaylist({ playlistId, songId });

    const response = h
      .response({ status: "success", message: "Song added successfully!" })
      .code(201);
    return response;
  }

  async getPlaylistSongsHandler(request, h) {
    const { id: playlistId } = request.params;
    const { id: ownerId } = request.auth.credentials;

    await this._service.verifyPlaylistOwner(playlistId, ownerId);

    const playlistSongs = await this._service.getPlaylistSongs({ playlistId });
    const playlistMeta = await this._service.getPlaylistMeta({ playlistId });

    const response = h
      .response({
        status: "success",
        data: {
          playlist: {
            id: playlistMeta.id,
            username: playlistMeta.username,
            name: playlistMeta.name,
            songs: playlistSongs,
          },
        },
      })
      .code(200);
    return response;
  }
}

module.exports = PlaylistsHandler;
