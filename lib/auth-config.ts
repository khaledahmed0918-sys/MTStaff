import DiscordProvider from "next-auth/providers/discord";
import { SessionStrategy } from "next-auth";

export const authOptions = {
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt" as SessionStrategy,
  },
  callbacks: {
    async jwt({ token, user, account, profile }: { token: any; user: any; account: any; profile?: any; }) {
      if (account) {
        token.id = user.id;
        token.accessToken = account.access_token;
      }
      if (profile) {
        token.profile = profile;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any; }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.profile = token.profile;
      }
      return session;
    },
  },
  cookies: {
    sessionToken: {
      name: "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax", // Lax is safer for HTTP
        path: "/",
        secure: false, // Must be false for HTTP
      },
    },
  },
};

export default authOptions;
