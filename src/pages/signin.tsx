import {useSession, signIn, signOut} from 'next-auth/react';

const SignIn = () => {
    const {data, status} = useSession();

    console.warn(status, 'data: ', data);

    return <div> Sign In!</div>;
};

export default SignIn;
