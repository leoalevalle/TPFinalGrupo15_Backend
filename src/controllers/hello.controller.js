const MessageModel = require('../models/message.model');

const getHello = (req, res) => {
  try {
    const helloMessage = new MessageModel("¡Hola Mundo desde el Backend!");
    res.status(200).json(helloMessage);
  } catch (error) {
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

module.exports = {
  getHello
};