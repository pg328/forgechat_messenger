import ws from 'ws';
import {applyWSSHandler} from '@trpc/server/adapters/ws';
import {appRouter} from './router';
import {createContext} from './router/context';
import {handleClientScriptLoad} from 'next/script';

const wss = new ws.Server({
    port: 3001,
});

const handler = applyWSSHandler({wss, createContext, router: appRouter});

wss.on('connection', () => {
    console.log('connection!');
    wss.on('close', () => {
        console.log('connection closed!');
    });
});

console.log('WS Server Started!');

process.on('SIGTERM', () => {
    handler.broadcastReconnectNotification();

    wss.close();
});
