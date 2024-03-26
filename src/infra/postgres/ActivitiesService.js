const { nanoid } = require("nanoid");
const { queryDB } = require("../../utils/db");
const InvariantError = require("../../exceptions/InvariantError");

class ActivitiesService {
  constructor(cacheService) {
    this._cacheService = cacheService;
  }

  async addActivity({ songId, userId, playlistId, action }) {
    const id = `activity-${nanoid()}`;

    const query = {
      text: `INSERT INTO 
      playlist_song_activities(id, user_id, playlist_id, song_id, action) 
      VALUES($1, $2, $3, $4, $5) 
      RETURNING id`,
      values: [id, userId, playlistId, songId, action],
    };

    const result = await queryDB(query);

    if (!result.rowCount) {
      throw new InvariantError("Failed to add activity!");
    }
  }

  async getPlaylistActivities({ playlistId }) {
    try {
      const cachedData = await this._cacheService.get(
        `activities:${playlistId}`
      );
      return {
        data: JSON.parse(cachedData),
        dataSource: "cache",
      };
    } catch (error) {
      const query = {
        text: `SELECT u.username, s.title, a.action, a.time FROM playlist_song_activities a
          LEFT JOIN users u ON u.id = a.user_id
          LEFT JOIN songs s ON s.id = a.song_id
          WHERE a.playlist_id = $1
          `,
        values: [playlistId],
      };

      const result = await queryDB(query);

      if (!result.rowCount) {
        throw new InvariantError(
          `Failed to retrieve playlist: ${playlistId} activities!`
        );
      }

      await this._cacheService.set(
        `activities:${playlistId}`,
        JSON.stringify(result.rows)
      );

      return { data: result.rows, dataSource: "db" };
    }
  }
}

module.exports = ActivitiesService;
