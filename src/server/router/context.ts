// src/server/router/context.ts
import * as trpc from '@trpc/server';
import * as trpcNext from '@trpc/server/adapters/next';
import EventEmitter from 'events';
import {IncomingMessage} from 'http';
import ws from 'ws';

import {NodeHTTPCreateContextFnOptions} from '@trpc/server/dist/declarations/src/adapters/node-http';
import {prisma} from '../db/client';

const ee = new EventEmitter();

export const createContext = async (
    opts?: trpcNext.CreateNextContextOptions | NodeHTTPCreateContextFnOptions<IncomingMessage, ws>,
) => {
    const req = opts?.req;
    const res = opts?.res;

    return {
        req,
        res,
        prisma,
        ee,
    };
};

type Context = trpc.inferAsyncReturnType<typeof createContext>;

export const createRouter = () => trpc.router<Context>();
