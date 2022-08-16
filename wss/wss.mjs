import {WebSocketServer} from 'ws';
import {Kafka} from 'kafkajs';

const APPID = process.env.APPID || 'NO_ID';

const kafka = new Kafka({
    logLevel: 1,
    clientId: `${APPID}`,
    brokers: ['broker:9092'],
});

const producer = kafka.producer();

await producer.connect();

const sendMessage = async (str) => {
    return await producer.send({
        topic: 'messages',
        messages: [
            {
                partition: 0,
                value: str,
            },
        ],
    });
};

const consumer = kafka.consumer({groupId: 'test-group'});
await consumer.connect();
await consumer.subscribe({
    topic: 'messages',
    fromBeginning: true,
});
const wss = new WebSocketServer({
    port: 8080,
});

wss.on('connection', async (ws) => {
    console.log(`Connections++ -> ${wss.clients.size} `);
    ws.on('message', (data) => {
        console.log(data.toString('utf8'));
        sendMessage(data.toString('utf8'));
    });
    ws.once('close', () => {
        console.log(`Connections-- -. ${wss.clients.size}`);
    });
    await consumer.run({
        eachMessage: ({message}) => {
            ws.emit(message.value.toString('utf8'));
        },
    });
});

console.log('Listening on port ' + wss.options.port);
