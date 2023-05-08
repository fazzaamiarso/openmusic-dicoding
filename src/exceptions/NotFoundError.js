const ClientError = require("./ClientError");

class NotFoundError extends ClientError {
  constructor(message = "Can't find what you're looking for!") {
    super(message, 404);
    this.name = "NotFoundError";
  }
}
module.exports = NotFoundError;
