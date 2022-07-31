import moment from 'moment';
import {Session, unstable_getServerSession} from 'next-auth';
import {signIn, signOut, useSession} from 'next-auth/react';
import {useRouter} from 'next/router';
import {createRef, forwardRef, LegacyRef, MouseEventHandler, useEffect, useRef, useState} from 'react';
import {Message} from '../../constants/schemas';
import {trpc} from '../../utils/trpc';
import {authOptions} from '../api/auth/[...nextauth]';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const duration = (sentAt: Date) => moment.duration(moment(sentAt).diff(moment(Date.now()))).humanize(true);

const MessageList = forwardRef<HTMLDivElement, {messages: Message[]; session: Session}>((props, ref) => {
    const {messages, session} = props;

    const containerRef = useRef();
    const [showScrollButton, setShowScrollButton] = useState<boolean>(false);
    const [newMessage, setNewMessage] = useState<number>(0);
    const onScroll = () => {
        if (containerRef.current) {
            const {scrollTop, scrollHeight, clientHeight} = containerRef.current;
            const isAtBottom = scrollTop + clientHeight === scrollHeight;
            setShowScrollButton(!isAtBottom);
            isAtBottom && setNewMessage(0);
        }
    };
    const scrollToLastMessage = () => {
        (ref as any).current?.scrollIntoView({behavior: 'smooth'});
        setNewMessage(0);
    };

    useEffect(() => {
        if ((ref as any)?.current) {
            console.log('Last Showed', !!(ref as any).current.showScrollButton, 'Currently', showScrollButton);
            if (!!(ref as any).current.showScrollButton === false && showScrollButton) {
                setNewMessage((m) => m + 1);
            }
            (ref as any).current.showScrollButton = showScrollButton;
        }
    }, [messages.length]);
    useEffect(() => {
        if ((ref as any)?.current) {
            (ref as any).current.showScrollButton = showScrollButton;
        }
    }, [showScrollButton]);

    return (
        <div
            ref={containerRef as any}
            onScroll={onScroll}
            className="flex flex-col gap-1 flex-1  snap-y overflow-auto scroll-p-1 px-2 pt-1"
        >
            {showScrollButton && (
                <button
                    onClick={scrollToLastMessage}
                    type="button"
                    className={`${
                        newMessage ? 'animate-bounce' : ''
                    } absolute bottom-48 bg-dark p-4 rounded-lg text-light`}
                >
                    Latest Messages
                </button>
            )}
            {messages.slice(0, -1).map(({id, message, sentAt, sender}) => {
                const timeStamp = duration(sentAt);
                return (
                    <div
                        key={id}
                        className={`group flex snap-end flex-col max-w-prose rounded-xl break-words w-fit p-2 ${
                            sender === session.user?.name
                                ? 'self-end rounded-br-sm bg-primary text-light'
                                : 'rounded-bl-sm bg-secondary text-light'
                        } group-hover:scale-110 transition-all`}
                    >
                        <span className="text-lg pl-2 ">{message}</span>
                        <span className="text-xs h-0 opacity-0 group-hover:opacity-100 group-hover:h-full transition-all delay-300">
                            {`${sender === session.user?.name ? '' : `${sender} |`} ${timeStamp}`}
                        </span>
                    </div>
                );
            })}
            {messages.at(-1) && (
                <div
                    ref={ref as LegacyRef<HTMLDivElement>}
                    key={messages.at(-1)!.id}
                    className={`group snap-end flex flex-col rounded-xl max-w-prose w-fit p-2 break-words ${
                        messages.at(-1)?.sender === session.user?.name
                            ? 'self-end animate-slide-from-right rounded-br-sm bg-primary text-light'
                            : 'animate-slide-from-left  rounded-bl-sm bg-secondary text-light'
                    } group-hover:scale-110 transition-all`}
                >
                    <span className="text-lg pl-2 ">{messages.at(-1)?.message}</span>
                    <span className="text-xs h-0 opacity-0 group-hover:opacity-100 group-hover:h-full transition-all delay-300">
                        {`${
                            messages.at(-1)!.sender === session.user?.name ? '' : `${messages.at(-1)?.sender} |`
                        } ${duration(messages.at(-1)!.sentAt || new Date())}`}
                    </span>
                </div>
            )}
        </div>
    );
});

MessageList.displayName = 'Message List';
const RoomPage = () => {
    const ref = createRef<HTMLDivElement>();
    const {
        query: {roomId},
    } = useRouter();

    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);

    const scrollToLastMessage = () => ref.current?.scrollIntoView({behavior: 'smooth'});

    const {data: session} = useSession();
    trpc.useSubscription(
        [
            'room.onSendMessage',
            {
                roomId: roomId as string,
            },
        ],
        {
            onNext: (arg) => {
                setMessages((mgs) => [...mgs, arg]);
            },
        },
    );
    const {mutateAsync: sendMessage} = trpc.useMutation(['room.send-message']);

    if (!session) {
        return (
            <div>
                Log In! <button onClick={signIn as MouseEventHandler<HTMLButtonElement>}>Log in</button>
            </div>
        );
    }
    const onSubmit = (e: any) => {
        e.preventDefault();
        message &&
            sendMessage({
                roomId: roomId as string,
                message,
                sender: session.user?.name || 'Anonymous',
            });

        scrollToLastMessage();
        setMessage('');
    };

    return (
        <div className="flex flex-col bg-light h-screen w-screen text-dark">
            <div className="h-24 flex p-8 bg-light border-black border-2 border-x-0 gap-14">
                <h1 className="text-3xl w-5/6 flex items-center">
                    <span className="hidden sm:flex">
                        Welcome to Room
                        {roomId}, {session.user?.name}!
                    </span>
                </h1>
                <div className="p-1 text-xl flex items-center justify-center">
                    <button
                        className="border-2 border-black p-2 rounded-lg"
                        onClick={signOut as MouseEventHandler<HTMLButtonElement>}
                    >
                        Log Out!
                    </button>
                </div>
            </div>

            <MessageList ref={ref} session={session} messages={messages} />

            <form onSubmit={onSubmit} className="h-40 mt-2 flex p-8 bg-light border-black border-x-0 border-2 gap-6">
                <input
                    type="text"
                    placeholder="Message"
                    value={message}
                    onChange={(e) => {
                        setMessage(e.target.value);
                    }}
                    className="w-9/12 sm:w-11/12 bg-light placeholder-current rounded-lg p-2 text-2xl border-black border-2"
                ></input>
                <button type="submit" className="bg-primary text-light rounded-lg p-2 w-3/12 text-2xl">
                    Send
                </button>
            </form>
        </div>
    );
};

export async function getServerSideProps(context: any) {
    return {
        props: {
            session: await unstable_getServerSession(context.req, context.res, authOptions),
        },
    };
}

export default RoomPage;
