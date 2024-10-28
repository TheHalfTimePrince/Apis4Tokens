'use server'
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { getUserFromCredentials } from "@/app/(login)/actions";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/lib/db/drizzle";
import { accounts, sessions, users } from "./lib/db/schema";
import type { Provider } from "next-auth/providers";

const providers: Provider[] = [
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
        const user = await getUserFromCredentials({
          email: credentials.email as string,
          password: credentials.password as string
        });
        if (!user || 'error' in user) return null;
        
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
]

const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
  }),
  pages: {
    signIn: "/login",
  },
  providers
});

export async function getSignIn() {
  return signIn;
}

export async function getSignOut() {
  return signOut;
}

export async function getAuth() {
  return auth;
}
export async function getHandlers() {
  return handlers;
}

export async function getProviderMap() {
  return providers
    .map((provider) => {
      if (typeof provider === "function") {
        const providerData = provider();
        return { id: providerData.id, name: providerData.name };
      } else {
        return { id: provider.id, name: provider.name };
      }
    })
    .filter((provider) => provider.id !== "credentials");
}
