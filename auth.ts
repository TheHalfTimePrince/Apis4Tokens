import NextAuth from "next-auth"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { db } from "@/lib/db/drizzle"
import { accounts, sessions, users } from "./lib/db/schema"
import GitHub from "next-auth/providers/github"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import type { NextAuthConfig, User } from "next-auth"
import { getUserFromCredentials } from "@/app/(login)/actions"

const config: NextAuthConfig = {
  pages: {
    signIn: "/login",
  },
  providers: [
    GitHub,
    Google,
    Credentials({
      credentials: {
        email: { type: "text" },
        password: { type: "password" },
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          const user: User = await getUserFromCredentials({
            email: credentials.email as string,
            password: credentials.password as string,
          });
          if (!user || "error" in user) return null;

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
          };
        } catch (error) {
          return null;
        }
      },
    }),
  ],
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
  }),
  session: { strategy: "jwt" },
  ...config,
})

export function getProviderMap() {
  return config.providers
    .map((provider) => {
      if (typeof provider === "function") {
        const providerData = provider({});
        return { id: providerData.id, name: providerData.name };
      } else {
        return { id: provider.id, name: provider.name };
      }
    })
    .filter((provider) => provider.id !== "credentials");
}