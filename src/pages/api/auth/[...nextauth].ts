import NextAuth, {type NextAuthOptions} from 'next-auth';
import GithubProvider from 'next-auth/providers/github';
import CredentialsProvider from 'next-auth/providers/credentials';
import Auth0Provider from 'next-auth/providers/auth0';

// Prisma adapter for NextAuth, optional and can be removed
import {PrismaAdapter} from '@next-auth/prisma-adapter';
import {prisma} from '../../../server/db/client';

export const authOptions: NextAuthOptions = {
    //callbacks: {
    //    session({session, user}) {
    //        return session;
    //    },
    //},
    // Configure one or more authentication providers
    adapter: PrismaAdapter(prisma),
    providers: [
        Auth0Provider({
            clientId: process.env.CLIENT_ID as string,
            clientSecret: process.env.CLIENT_SECRET as string,
            issuer: process.env.ISSUER,
            authorization: {params: {prompt: 'login', response_type: 'code'}},
        }),
        //GithubProvider({
        //  clientId: process.env.GITHUB_ID,
        //  clientSecret: process.env.GITHUB_SECRET,
        //}),
        // ...add more providers here
        //CredentialsProvider({
        //    name: 'Credentials',
        //    credentials: {
        //        username: {label: 'Username', type: 'text', placeholder: 'name'},
        //    },
        //    async authorize(credentials, _req) {
        //        const user = {id: 1, name: credentials?.username ?? 'philly_g'};
        //        return user;
        //    },
        //}),
    ],
    secret: process.env.NEXTAUTH_SECRET,
    session: {
        strategy: 'database',
    },
    pages: {},
};

export default NextAuth(authOptions);
