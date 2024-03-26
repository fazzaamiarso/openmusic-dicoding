const autoBind = require("auto-bind");

class PlaylistsHandler {
  constructor(service, songsService, activitiesService, validator) {
    this._service = service;
    this._songsService = songsService;
    this._activitiesService = activitiesService;
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

    await this._service.verifyPlaylistAccess({ playlistId, userId: ownerId });

    await this._service.deletePlaylistSong({ playlistId, songId });

    await this._activitiesService.addActivity({
      playlistId,
      userId: ownerId,
      songId,
      action: "delete",
    });

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

    await this._service.verifyPlaylistAccess({ playlistId, userId: ownerId });

    await this._service.addSongToPlaylist({ playlistId, songId });

    await this._activitiesService.addActivity({
      playlistId,
      userId: ownerId,
      songId,
      action: "add",
    });

    const response = h
      .response({ status: "success", message: "Song added successfully!" })
      .code(201);
    return response;
  }

  async getPlaylistSongsHandler(request, h) {
    const { id: playlistId } = request.params;
    const { id: ownerId } = request.auth.credentials;

    await this._service.verifyPlaylistAccess({ playlistId, userId: ownerId });

    const [playlistSongs, playlistMeta] = await Promise.all([
      this._service.getPlaylistSongs({ playlistId }),
      this._service.getPlaylistMeta({ playlistId }),
    ]);

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

  async getPlaylistActivitiesHandler(request, h) {
    const { id: playlistId } = request.params;
    const { id: ownerId } = request.auth.credentials;

    await this._service.verifyPlaylistAccess({ playlistId, userId: ownerId });

    const { data: activities, dataSource } =
      await this._activitiesService.getPlaylistActivities({
        playlistId,
      });

    const response = h
      .response({
        status: "success",
        data: {
          playlistId,
          activities,
        },
      })
      .code(200)
      .header("X-Data-Source", dataSource);
    return response;
  }
}

module.exports = PlaylistsHandler;
