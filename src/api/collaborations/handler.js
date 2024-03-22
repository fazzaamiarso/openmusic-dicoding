const autoBind = require("auto-bind");

class CollaborationsHandler {
  constructor(service, playlistsService, usersService, validator) {
    this._service = service;
    this._playlistsService = playlistsService;
    this._usersService = usersService;
    this._validator = validator;

    autoBind(this);
  }

  async postCollaborationHandler(request, h) {
    await this._validator.validatePostCollaborationPayload(request.payload);

    const { id: credentialId } = request.auth.credentials;
    const { userId, playlistId } = request.payload;

    await this._usersService.getUserById(userId);
    await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId);

    const collaborationId = await this._service.addCollaborator({
      playlistId,
      userId,
    });

    const response = h
      .response({ status: "success", data: { collaborationId } })
      .code(201);
    return response;
  }

  async deleteCollaborationHandler(request, h) {
    await this._validator.validateDeleteCollaborationPayload(request.payload);

    const { id: credentialId } = request.auth.credentials;
    const { userId, playlistId } = request.payload;

    await this._usersService.getUserById(userId);

    await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId);

    await this._service.deleteCollaborator({ playlistId, userId });

    return h
      .response({
        status: "success",
        message: `Collaborations succesfully deleted!`,
      })
      .code(200);
  }
}

module.exports = CollaborationsHandler;
