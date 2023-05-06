/* eslint-disable no-underscore-dangle */
const { nanoid } = require("nanoid");
const { Pool } = require("pg");

class AlbumsService {
  constructor() {
    this._pool = new Pool();
  }

  async addAlbum({ name, year }) {
    const id = nanoid();

    const query = {
      text: "INSERT INTO albums VALUES($1, $2, $3) RETURNING id",
      values: [id, name, year],
    };

    const result = await this._pool.query(query);

    const resultId = result.rows[0].id;

    if (!resultId) {
      // Create exceptions
      throw Error("NO ID");
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
      // Create exceptions
      throw Error("NO ID");
    }
    return result.rows[0];
  }

  async editAlbumById({ id, name, year }) {
    const query = {
      text: "UPDATE albums SET name=$1, year=$2  WHERE id=$3",
      values: [name, year, id],
    };

    const result = await this._pool.query(query);

    const resultId = result.rows[0].id;

    if (!resultId) {
      // Create exceptions
      throw Error("NO ID");
    }
    return resultId;
  }

  async deleteAlbumById(id) {
    const query = {
      text: "DELETE FROM albums WHERE id=$1",
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      // Create exceptions
      throw Error("NO ID");
    }
    return result.rows[0];
  }
}

module.exports = AlbumsService;
