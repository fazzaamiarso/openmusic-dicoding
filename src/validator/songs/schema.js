const Joi = require("joi");

const songPayloadSchema = Joi.object({
  title: Joi.string().required(),
  performer: Joi.string().required(),
  genre: Joi.string().required(),
  year: Joi.number().required(),
  duration: Joi.number(),
  albumId: Joi.string(),
});

module.exports = { songPayloadSchema };
