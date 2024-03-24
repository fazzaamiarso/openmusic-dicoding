const amqp = require("amqplib");

class SenderService {
  static async sendMessage(queue, message) {
    const connection = await amqp.connect(process.env.RABBITMQ_SERVER);
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
