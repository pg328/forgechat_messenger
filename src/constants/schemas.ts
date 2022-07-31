import z, {date, object, string, TypeOf} from 'zod';

export const sendMessageSchema = object({
    roomId: string(),
    message: string(),
    sender: string(),
});

const messageSchema = object({
    id: string(),
    message: string(),
    roomId: string(),
    sentAt: date(),
    sender: string(),
});

export type Message = TypeOf<typeof messageSchema>;

export const messageSubSchema = object({
    roomId: string(),
});
