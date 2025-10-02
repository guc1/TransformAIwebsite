import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import type { NextAuthOptions } from "next-auth";
import type { Adapter } from "next-auth/adapters";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { compare } from "bcryptjs";

import { db } from "@/lib/db/client";
import { serverEnv } from "@/lib/env";
import { accounts, sessions, users, verificationTokens } from "@/lib/db/schema";

const env = serverEnv();

const adapter = DrizzleAdapter(
  db as any,
  {
    users,
    accounts,
    sessions,
    verificationTokens,
  } as any,
) as Adapter;

export const authOptions: NextAuthOptions = {
  adapter,
  secret: env.NEXTAUTH_SECRET,
  session: {
    strategy: "database",
  },
  providers: [
    Google({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.toLowerCase();
        const password = credentials?.password;

        if (!email || !password) {
          return null;
        }

        const existingUser = await db.query.users.findFirst({
          where: eq(users.email, email),
        });

        if (!existingUser?.passwordHash) {
          return null;
        }

        const isPasswordValid = await compare(password, existingUser.passwordHash);

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: existingUser.id,
          email: existingUser.email,
          name: existingUser.name,
          role: existingUser.role,
        } as any;
      },
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (!session.user) {
        return session;
      }

      if (user) {
        session.user.id = user.id;
        session.user.role = (user as any).role ?? "client";
        return session;
      }

      if (!session.user.email) {
        return session;
      }

      const dbUser = await db.query.users.findFirst({
        where: eq(users.email, session.user.email.toLowerCase()),
        columns: {
          id: true,
          role: true,
        },
      });

      if (dbUser) {
        session.user.id = dbUser.id;
        session.user.role = dbUser.role;
      }

      return session;
    },
  },
};

export const getAuthSession = () => getServerSession(authOptions);
