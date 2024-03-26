const { nanoid } = require("nanoid");
const { queryDB } = require("../../utils/db");
const { NotFoundError, InvariantError } = require("../../exceptions");
const { mapSongDbToModel } = require("../../utils/modelMapper");

class SongsService {
  constructor(cacheService) {
    this._cacheService = cacheService;
  }

  async getAllSongs(searchQuery) {
    const searchQueryKeys = Object.keys(searchQuery);
    const queryText = searchQueryKeys.length
      ? `WHERE ${searchQueryKeys
          .map((key, idx) => `${key} ILIKE $${idx + 1}`)
          .join(" AND ")}`
      : "";

    const queryValues = Object.values(searchQuery).map((query) => `%${query}%`);

    const query = {
      text: `SELECT id, title, performer FROM songs ${queryText}`,
      values: queryValues,
    };

    const result = await queryDB(query);

    return result.rows;
  }

  async addSong({ title, performer, year, genre, duration, albumId }) {
    const id = `song-${nanoid()}`;

    const query = {
      text: `INSERT INTO 
      songs(id, title, performer, year, genre, duration, album_id) 
      VALUES($1, $2, $3, $4, $5, $6, $7) 
      RETURNING id`,
      values: [id, title, performer, year, genre, duration, albumId],
    };

    const result = await queryDB(query);
    const resultId = result.rows[0].id;

    if (!resultId) throw new InvariantError("Failed to add song!");

    return resultId;
  }

  async getSongById(id) {
    try {
      const cachedData = await this._cacheService.get(`song:${id}`);
      return {
        data: JSON.parse(cachedData),
        dataSource: "cache",
      };
    } catch {
      const query = {
        text: "SELECT * FROM songs WHERE id=$1",
        values: [id],
      };

      const result = await queryDB(query);

      if (!result.rowCount)
        throw new NotFoundError(`Can't find song with id: ${id}!`);

      await this._cacheService.set(
        `song:${id}`,
        JSON.stringify(result.rows[0])
      );

      return {
        data: mapSongDbToModel(result.rows[0]),
        dataSource: "db",
      };
    }
  }

  async deleteSongById(id) {
    const query = {
      text: "DELETE FROM songs WHERE id=$1 RETURNING id",
      values: [id],
    };

    const result = await queryDB(query);

    if (!result.rowCount)
      throw new NotFoundError(
        `Can't delete song with id: ${id}, song not found!`
      );

    await this._cacheService.delete(`song:${id}`);
  }

  async editSongById({ id, title, year, performer, genre, duration, albumId }) {
    const query = {
      text: "UPDATE songs SET title=$1, year=$2, performer=$3, genre=$4, duration=$5, album_id=$6 WHERE id=$7 RETURNING id",
      values: [title, year, performer, genre, duration, albumId, id],
    };

    const result = await queryDB(query);

    if (!result.rowCount)
      throw new NotFoundError(
        `Can't edit song with id: ${id}, song not found!`
      );

    await this._cacheService.delete(`song:${id}`);
  }
}

module.exports = SongsService;
