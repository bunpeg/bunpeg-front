import { type DefaultSession, getServerSession, type NextAuthOptions } from 'next-auth';
import EmailProvider, { type SendVerificationRequestParams } from 'next-auth/providers/email';

import { PsqlAdapter } from '@/utils/psql-adapter';
import { sendVerificationEmail } from '@/utils/resend';

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string;
      isSetup: boolean;
      // ...other properties
      // role: UserRole;
    } & DefaultSession['user'];
  }

  interface User {
    isSetup: boolean;
    // ...other properties
    // role: UserRole;
  }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  callbacks: {
    session: ({ session, user }) => {
      return {
        ...session,
        user: {
          ...session.user,
          id: user.id,
          isSetup: user.isSetup,
        },
      };
    },
  },
  pages: {
    signIn: '/intake',
    verifyRequest: '/verify-email',
    error: '/?sign-in-error=true',
    newUser: '/onboarding',
  },
  adapter: PsqlAdapter(),
  providers: [
    EmailProvider({
      sendVerificationRequest: async (params: SendVerificationRequestParams) => {
        const { identifier, url } = params;
        await sendVerificationEmail({
          url,
          email: identifier,
        });
      }
    }),
    /**
     * ...add more providers here.
     *
     * Most other providers require a bit more work than the Discord provider. For example, the
     * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
     * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
     *
     * @see https://next-auth.js.org/providers/github
     */
  ],
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = () => getServerSession(authOptions);
