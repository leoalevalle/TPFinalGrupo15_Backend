class MessageModel {
  constructor(text) {
    this.message = text;
    this.timestamp = new Date();
  }
}

module.exports = MessageModel;