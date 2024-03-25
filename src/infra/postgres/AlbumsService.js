const { nanoid } = require("nanoid");
const { queryDB } = require("../../utils/db");
const { NotFoundError, InvariantError } = require("../../exceptions");

class AlbumsService {
  constructor(cacheService) {
    this._cacheService = cacheService;
  }

  async addAlbum({ name, year }) {
    const id = `album-${nanoid()}`;

    const query = {
      text: "INSERT INTO albums VALUES($1, $2, $3) RETURNING id",
      values: [id, name, year],
    };

    const result = await queryDB(query);
    const resultId = result.rows[0].id;

    if (!resultId) throw new InvariantError("Failed to add album!");

    return resultId;
  }

  async getAlbumById(id) {
    const query = {
      text: "SELECT * FROM albums WHERE id=$1",
      values: [id],
    };

    const result = await queryDB(query);

    if (!result.rowCount)
      throw new NotFoundError(`Can't find album with id: ${id}!`);

    return result.rows[0];
  }

  async getSongsInAlbum(id) {
    const query = {
      text: "SELECT id, title, performer FROM songs WHERE album_id=$1",
      values: [id],
    };

    const result = await queryDB(query);

    return result.rows;
  }

  async editAlbumById({ id, name, year }) {
    const query = {
      text: "UPDATE albums SET name=$1, year=$2  WHERE id=$3 RETURNING id",
      values: [name, year, id],
    };

    const result = await queryDB(query);

    if (!result.rowCount)
      throw new NotFoundError(
        `Can't edit album with id: ${id}, album not found!`
      );
  }

  async deleteAlbumById(id) {
    const query = {
      text: "DELETE FROM albums WHERE id=$1 RETURNING id",
      values: [id],
    };

    const result = await queryDB(query);

    if (!result.rowCount)
      throw new NotFoundError(
        `Can't delete album with id: ${id}, album not found!`
      );
  }

  async postLikeAlbum({ userId, albumId }) {
    const id = `album-like-${nanoid()}`;

    const query = {
      text: "INSERT INTO user_album_likes(id, user_id, album_id) VALUES($1, $2, $3) RETURNING id",
      values: [id, userId, albumId],
    };

    const result = await queryDB(query);

    if (!result.rowCount)
      throw new NotFoundError(
        `Can't like album with id: ${albumId}, album not found!`
      );

    await this._cacheService.delete(`likes:${albumId}`);

    return result.rows[0];
  }

  async checkAlbumLike({ userId, albumId }) {
    const query = {
      text: "SELECT * FROM user_album_likes WHERE album_id = $1 AND user_id = $2",
      values: [albumId, userId],
    };

    const result = await queryDB(query);

    if (result.rowCount > 0)
      throw new InvariantError(
        `User: ${userId}, have liked the album: ${albumId}`
      );
  }

  async deleteLikeAlbum({ userId, albumId }) {
    const query = {
      text: "DELETE FROM user_album_likes WHERE user_id = $1 AND album_id = $2 RETURNING id",
      values: [userId, albumId],
    };

    const result = await queryDB(query);

    if (!result.rowCount)
      throw new NotFoundError(
        `Can't unlike album with id: ${albumId}, album not found!`
      );

    await this._cacheService.delete(`likes:${albumId}`);
  }

  async getLikesAlbum({ albumId }) {
    try {
      const cachedData = await this._cacheService.get(`likes:${albumId}`);

      return {
        data: JSON.parse(cachedData),
        dataSource: "cache",
      };
    } catch (e) {
      const query = {
        text: "SELECT COUNT(*) FROM user_album_likes WHERE album_id = $1",
        values: [albumId],
      };

      const result = await queryDB(query);
      const likesCount = result.rows[0].count;

      await this._cacheService.set(
        `likes:${albumId}`,
        JSON.stringify(likesCount)
      );

      return {
        data: likesCount,
        dataSource: "db",
      };
    }
  }

  async postUploadCover({ albumId, coverUrl }) {
    const query = {
      text: "UPDATE albums SET cover = $1 WHERE id = $2 RETURNING id",
      values: [coverUrl, albumId],
    };

    const result = await queryDB(query);

    if (!result.rowCount) {
      throw new NotFoundError(`Cover not uploaded. Album with id: ${albumId}`);
    }
  }
}

module.exports = AlbumsService;
