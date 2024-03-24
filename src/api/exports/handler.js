const autoBind = require("auto-bind");

class ExportsHandler {
  constructor(service, playlistsService, validator) {
    this._service = service;
    this._playlistsService = playlistsService;
    this._validator = validator;

    autoBind(this);
  }

  async postExportNotesHandler(request, h) {
    this._validator.validateExportNotesPayload(request.payload);
    const { id: userId } = request.auth.credentials;
    const { playlistId } = request.params;

    await this._playlistsService.verifyPlaylistOwner(playlistId, userId);

    const message = {
      playlistId,
      targetEmail: request.payload.targetEmail,
    };

    await this._service.sendMessage("export:playlist", JSON.stringify(message));

    const response = h.response({
      status: "success",
      message: "Your message is queued!",
    });
    response.code(201);
    return response;
  }
}

module.exports = ExportsHandler;
