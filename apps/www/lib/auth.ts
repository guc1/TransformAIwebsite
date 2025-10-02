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
import {
  accounts,
  sessions,
  users,
  verificationTokens,
  type UserRole,
} from "@/lib/db/schema";

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
    strategy: "jwt",
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
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role ?? "client";
      } else if (!token.role && token.email) {
        const dbUser = await db.query.users.findFirst({
          where: eq(users.email, token.email.toLowerCase()),
          columns: {
            role: true,
          },
        });

        if (dbUser) {
          token.role = dbUser.role;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (!session.user) {
        return session;
      }

      if (token.sub) {
        session.user.id = token.sub;
      }

      if (token.role) {
        session.user.role = token.role as UserRole;
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

      if (!session.user.role) {
        session.user.role = "client";
      }

      return session;
    },
  },
};

export const getAuthSession = () => getServerSession(authOptions);
