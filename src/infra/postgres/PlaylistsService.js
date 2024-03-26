const { nanoid } = require("nanoid");
const { queryDB } = require("../../utils/db");
const {
  InvariantError,
  NotFoundError,
  AuthorizationError,
} = require("../../exceptions");

class PlaylistsService {
  constructor(collaborationService, cacheService) {
    this._collaborationService = collaborationService;
    this._cacheService = cacheService;
  }

  async addPlaylist({ name, ownerId }) {
    const id = `playlist-${nanoid()}`;
    const query = {
      text: `INSERT INTO playlists(id, name, owner) VALUES($1, $2, $3) RETURNING id`,
      values: [id, name, ownerId],
    };

    const result = await queryDB(query);

    if (!result.rows.length) {
      throw new InvariantError("Failed to add playlist!");
    }
    return result.rows[0].id;
  }

  async addSongToPlaylist({ songId, playlistId }) {
    const id = `playlist-songs-${nanoid()}`;

    const query = {
      text: `INSERT INTO playlist_songs(id, song_id, playlist_id) VALUES($1, $2, $3) RETURNING id`,
      values: [id, songId, playlistId],
    };

    const result = await queryDB(query);

    if (!result.rowCount) {
      throw new InvariantError("Failed to add song to playlist!");
    }
    return result.rows[0].id;
  }

  async getAllPlaylists({ ownerId }) {
    const query = {
      text: `SELECT playlists.id, playlists.name, users.username
      FROM playlists 
      LEFT JOIN users ON users.id = playlists.owner
      LEFT JOIN collaborations ON collaborations.playlist_id = playlists.id
      WHERE collaborations.user_id = $1 OR playlists.owner = $1`,
      values: [ownerId],
    };

    const result = await queryDB(query);

    return result.rows;
  }

  async deletePlaylist({ playlistId }) {
    const query = {
      text: `DELETE FROM playlists WHERE id=$1 RETURNING id`,
      values: [playlistId],
    };

    const result = await queryDB(query);

    if (!result.rowCount)
      throw new NotFoundError(
        `Can't delete playlist with id: ${playlistId}, playlist not found!`
      );

    // removing activities cache when playlist deleted
    await this._cacheService.delete(`activities:${playlistId}`);
  }

  async deletePlaylistSong({ playlistId, songId }) {
    const query = {
      text: `DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING id`,
      values: [playlistId, songId],
    };

    const result = await queryDB(query);

    if (!result.rowCount)
      throw new NotFoundError(
        `Can't delete song with id: ${songId}, in playlist ${playlistId}!`
      );
  }

  async getPlaylistSongs({ playlistId }) {
    const query = {
      text: `SELECT songs.id, songs.title, songs.performer
      FROM songs
      INNER JOIN playlist_songs ps ON songs.id = ps.song_id 
      WHERE ps.playlist_id = $1`,
      values: [playlistId],
    };

    const result = await queryDB(query);

    if (!result.rowCount) {
      throw new NotFoundError(`Can't get songs from playlist ${playlistId}`);
    }

    return result.rows;
  }

  async getPlaylistMeta({ playlistId }) {
    const query = {
      text: `SELECT p.*, u.username FROM playlists p 
      INNER JOIN users u ON u.id = p.owner
      WHERE p.id = $1`,
      values: [playlistId],
    };

    const result = await queryDB(query);

    if (!result.rowCount) {
      throw new InvariantError("Can't get playlist metadata!");
    }

    return result.rows[0];
  }

  async verifyPlaylistOwner(id, owner) {
    const query = {
      text: "SELECT * FROM playlists WHERE id = $1",
      values: [id],
    };

    const result = await queryDB(query);

    if (!result.rowCount) {
      throw new NotFoundError("Playlist not found!");
    }

    const playlist = result.rows[0];
    if (playlist.owner !== owner) {
      throw new AuthorizationError(
        "You aren't allowed to access this resources!"
      );
    }
  }

  async verifyPlaylistAccess({ playlistId, userId }) {
    try {
      await this.verifyPlaylistOwner(playlistId, userId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      try {
        await this._collaborationService.verifyCollaborator({
          playlistId,
          userId,
        });
      } catch {
        throw error;
      }
    }
  }
}

module.exports = PlaylistsService;
