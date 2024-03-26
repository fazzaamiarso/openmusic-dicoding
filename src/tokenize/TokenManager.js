const Jwt = require("@hapi/jwt");
const InvariantError = require("../exceptions/InvariantError");
const { envConfig } = require("../utils/env");

const TokenManager = {
  generateAccessToken: (payload) =>
    Jwt.token.generate(payload, envConfig.app.access_token_key),
  generateRefreshToken: (payload) =>
    Jwt.token.generate(payload, envConfig.app.refresh_token_key),
  verifyRefreshToken: (refreshToken) => {
    try {
      const artifacts = Jwt.token.decode(refreshToken);
      Jwt.token.verifySignature(artifacts, envConfig.app.refresh_token_key);
      const { payload } = artifacts.decoded;
      return payload;
    } catch (error) {
      throw new InvariantError("Refresh token is invalid!");
    }
  },
};

module.exports = TokenManager;
