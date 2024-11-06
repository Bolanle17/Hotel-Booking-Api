const Joi = require("joi");

const validator = (schema) => (payload) => schema.validate(payload, { abortEarly: false });

const hotelSchema = Joi.object({
  name: Joi.string().required(),
  img: Joi.string().required(),
  description: Joi.string().required(),
  amenities: Joi.array().items(Joi.string()).required(),
  address: Joi.object({
    street: Joi.string().required(),
    area: Joi.string().required(),
    city: Joi.string().required(),
    country: Joi.string().required()
  }).required(),
  gallery: Joi.array().items(Joi.string()).required(),
  rooms: Joi.array().items(Joi.string())
});

const roomSchema = Joi.object({
  hotel: Joi.string().required(),
  roomType: Joi.string().required(),
  image: Joi.string().required(),
  price: Joi.number().required(),
  description:Joi.string().required()
});

exports.validateHotel = validator(hotelSchema);
exports.validateRoom = validator(roomSchema);