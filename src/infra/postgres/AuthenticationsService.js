const { queryDB } = require("../../utils/db");
const InvariantError = require("../../exceptions/InvariantError");

class AuthenticationsService {
  async addRefreshToken(token) {
    const query = {
      text: "INSERT INTO authentications VALUES($1)",
      values: [token],
    };

    await queryDB(query);
  }

  async verifyRefreshToken(token) {
    const query = {
      text: "SELECT token FROM authentications WHERE token = $1",
      values: [token],
    };

    const result = await queryDB(query);

    if (!result.rows.length) {
      throw new InvariantError("Refresh token is invalid!");
    }
  }

  async deleteRefreshToken(token) {
    const query = {
      text: "DELETE FROM authentications WHERE token = $1",
      values: [token],
    };

    await queryDB(query);
  }
}

module.exports = AuthenticationsService;
