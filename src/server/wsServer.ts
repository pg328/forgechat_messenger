import ws from 'ws';
import {applyWSSHandler} from '@trpc/server/adapters/ws';
import {appRouter} from './router';
import {createContext} from './router/context';

const wss = new ws.Server({
    port: parseInt(process.env.PORT || '3001'),
});

const handler = applyWSSHandler({wss, createContext, router: appRouter});

wss.on('connection', () => {
    console.log('connection!');
    wss.on('close', () => {
        console.log('connection closed!');
    });
});

console.log(`WS Server Started, listening on port ${process.env.PORT}`);

process.on('SIGTERM', () => {
    handler.broadcastReconnectNotification();

    wss.close();
});
