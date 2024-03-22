const { nanoid } = require("nanoid");
const bcrypt = require("bcrypt");
const { queryDB } = require("../../utils/db");
const {
  NotFoundError,
  InvariantError,
  AuthenticationError,
} = require("../../exceptions");

class UsersService {
  async addUser({ username, password, fullname }) {
    await this.verifyNewUsername(username);

    const id = `user-${nanoid(16)}`;
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = {
      text: "INSERT INTO users VALUES($1, $2, $3, $4) RETURNING id",
      values: [id, username, hashedPassword, fullname],
    };

    const result = await queryDB(query);

    if (!result.rowCount) {
      throw new InvariantError("Failed to add user!");
    }
    return result.rows[0].id;
  }

  async getUserById(userId) {
    const query = {
      text: "SELECT id, username, fullname FROM users WHERE id = $1",
      values: [userId],
    };

    const result = await queryDB(query);

    if (!result.rowCount) {
      throw new NotFoundError("User not found!");
    }

    return result.rows[0];
  }

  async verifyNewUsername(username) {
    const query = {
      text: "SELECT username FROM users WHERE username = $1",
      values: [username],
    };

    const result = await queryDB(query);

    if (result.rowCount > 0) {
      throw new InvariantError(
        "Failed to add user. Username is already registered!"
      );
    }
  }

  async verifyUserCredential(username, password) {
    const query = {
      text: "SELECT id, password FROM users WHERE username = $1",
      values: [username],
    };

    const result = await queryDB(query);

    if (!result.rowCount) {
      throw new AuthenticationError("Kredensial yang Anda berikan salah");
    }

    const { id, password: hashedPassword } = result.rows[0];

    const match = await bcrypt.compare(password, hashedPassword);

    if (!match) {
      throw new AuthenticationError("Kredensial yang Anda berikan salah");
    }
    return id;
  }
}

module.exports = UsersService;
