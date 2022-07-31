import {createRouter} from './context';
import {z} from 'zod';
import {messageSubSchema, sendMessageSchema} from '../../constants/schemas';
import type {Message} from '../../constants/schemas';
import {Events} from '../../constants/events';
import {randomUUID} from 'crypto';
import * as trpc from '@trpc/server';
import {createEmitAndSemanticDiagnosticsBuilderProgram} from 'typescript';

export const roomRouter = createRouter()
    .mutation('send-message', {
        input: sendMessageSchema,
        resolve({ctx, input}) {
            const message: Message = {
                id: randomUUID(),
                ...input,
                sentAt: new Date(),
            };

            ctx.ee.emit(Events.SEND_MESSAGE, message);
            return true;
        },
    })
    .subscription('onSendMessage', {
        input: messageSubSchema,
        resolve({ctx, input}) {
            return new trpc.Subscription<Message>((emit) => {
                const onMessage = (data: Message) => {
                    if (input.roomId === data.roomId) {
                        emit.data(data);
                    }
                };
                ctx.ee.on(Events.SEND_MESSAGE, onMessage);
                return () => {
                    ctx.ee.off(Events.SEND_MESSAGE, onMessage);
                };
            });
        },
    });
