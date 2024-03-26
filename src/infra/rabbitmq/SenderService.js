const amqp = require("amqplib");
const { envConfig } = require("../../utils/env");

class SenderService {
  static async sendMessage(queue, message) {
    const connection = await amqp.connect(envConfig.rabbitmq.server);
    const channel = await connection.createChannel();

    await channel.assertQueue(queue, { durable: true });

    channel.sendToQueue(queue, Buffer.from(message));

    console.log(" [x] Sent %s", message);

    setTimeout(() => {
      connection.close();
    }, 1000);
  }
}

module.exports = SenderService;
