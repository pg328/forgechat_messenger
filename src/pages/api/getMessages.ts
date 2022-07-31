// src/pages/api/examples.ts
import type {NextApiRequest, NextApiResponse} from 'next';
import {prisma} from '../../server/db/client';

const getMessages = async (req: NextApiRequest, res: NextApiResponse) => {
    const messages = await prisma.messagesToUser.findMany({
        include: {
            User: true,
            Message: true,
        },
    });
    res.status(200).json(messages);
};

export default getMessages;
