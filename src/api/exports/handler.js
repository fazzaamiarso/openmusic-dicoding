const autoBind = require("auto-bind");

class ExportsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    autoBind(this);
  }

  async postExportNotesHandler(request, h) {
    this._validator.validateExportNotesPayload(request.payload);

    const message = {
      userId: request.auth.credentials.id,
      targetEmail: request.payload.targetEmail,
    };

    await this._service.sendMessage("export:musics", JSON.stringify(message));

    const response = h.response({
      status: "success",
      message: "Your message is queued!",
    });
    response.code(201);
    return response;
  }
}

module.exports = ExportsHandler;
