/* eslint-disable no-underscore-dangle */
const { nanoid } = require("nanoid");
const { Pool } = require("pg");
const NotFoundError = require("../../exceptions/NotFoundError");

class AlbumsService {
  constructor() {
    this._pool = new Pool();
  }

  async addAlbum({ name, year }) {
    const id = `album-${nanoid()}`;

    const query = {
      text: "INSERT INTO albums VALUES($1, $2, $3) RETURNING id",
      values: [id, name, year],
    };

    const result = await this._pool.query(query);

    const resultId = result.rows[0].id;

    if (!resultId) {
      throw new NotFoundError("Can't find what you're looking for!");
    }
    return resultId;
  }

  async getAlbumById(id) {
    const query = {
      text: "SELECT * FROM albums WHERE id=$1",
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("Can't find what you're looking for!");
    }
    return result.rows[0];
  }

  async getSongsInAlbum(id) {
    const query = {
      text: "SELECT id, title, performer FROM songs WHERE album_id=$1",
      values: [id],
    };

    const result = await this._pool.query(query);

    return result.rows;
  }

  async editAlbumById({ id, name, year }) {
    const query = {
      text: "UPDATE albums SET name=$1, year=$2  WHERE id=$3 RETURNING id",
      values: [name, year, id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("Can't find what you're looking for!");
    }
  }

  async deleteAlbumById(id) {
    const query = {
      text: "DELETE FROM albums WHERE id=$1 RETURNING id",
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("Can't find what you're looking for!");
    }
  }
}

module.exports = AlbumsService;