import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import type { Provider } from "next-auth/providers"
import { getUserFromCredentials } from "@/app/(login)/actions";

export const providers: Provider[] = [
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
