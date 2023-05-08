const { nanoid } = require("nanoid");
const { Pool } = require("pg");
const NotFoundError = require("../../exceptions/NotFoundError");
const InvariantError = require("../../exceptions/InvariantError");
const { mapSongDbToModel } = require("../../utils/modelMapper");

class SongsService {
  constructor() {
    this._pool = new Pool();
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

    const result = await this._pool.query(query);

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

    const result = await this._pool.query(query);
    const resultId = result.rows[0].id;

    if (!resultId) throw new InvariantError("Failed to add song!");

    return resultId;
  }

  async getSongById(id) {
    const query = {
      text: "SELECT * FROM songs WHERE id=$1",
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length)
      throw new NotFoundError(`Can't find song with id: ${id}!`);

    return mapSongDbToModel(result.rows[0]);
  }

  async deleteSongById(id) {
    const query = {
      text: "DELETE FROM songs WHERE id=$1 RETURNING id",
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length)
      throw new NotFoundError(
        `Can't delete song with id: ${id}, song not found!`
      );
  }

  async editSongById({ id, title, year, performer, genre, duration, albumId }) {
    const query = {
      text: "UPDATE songs SET title=$1, year=$2, performer=$3, genre=$4, duration=$5, album_id=$6 WHERE id=$7 RETURNING id",
      values: [title, year, performer, genre, duration, albumId, id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length)
      throw new NotFoundError(
        `Can't edit song with id: ${id}, song not found!`
      );
  }
}

module.exports = SongsService;
