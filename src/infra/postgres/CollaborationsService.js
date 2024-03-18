const { nanoid } = require("nanoid");
const { queryDB } = require("../../utils/db");
const { InvariantError, NotFoundError } = require("../../exceptions");

class CollaborationsService {
  async addCollaborator({ playlistId, userId }) {
    const id = `collaborator-${nanoid()}`;

    const query = {
      text: `INSERT INTO collaborations(id, playlist_id, user_id) VALUES($1, $2, $3) RETURNING id`,
      values: [id, playlistId, userId],
    };

    const result = await queryDB(query);

    if (!result.rowCount) {
      throw new InvariantError("Failed to add collaborator!");
    }
    return result.rows[0].id;
  }

  async deleteCollaborator({ playlistId, userId }) {
    const query = {
      text: `DELETE FROM collaborations WHERE playlist_id = $1 AND user_id = $2 RETURNING id`,
      values: [playlistId, userId],
    };

    const result = await queryDB(query);

    if (!result.rowCount)
      throw new NotFoundError(
        `Can't delete collaborator with id: ${userId}, collaborator not found!`
      );
  }

  async verifyCollaborator({ playlistId, userId }) {
    const query = {
      text: `SELECT * FROM collaborations WHERE playlist_id = $1 AND user_id = $2`,
      values: [playlistId, userId],
    };

    const result = await queryDB(query);

    if (!result.rowCount) {
      throw new NotFoundError("Collaborator not found!");
    }
  }
}

module.exports = CollaborationsService;
