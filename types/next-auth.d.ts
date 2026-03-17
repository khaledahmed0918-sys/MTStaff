import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      profile?: any;
    } & DefaultSession["user"];
  }
}
