import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      username?: string;
      email?: string;
      image?: string;
      // add any other custom properties here
    } & DefaultSession['user'];
  }
}
