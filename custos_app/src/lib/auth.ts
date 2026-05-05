import type { NextAuthOptions } from "next-auth";
import { PHASE_PRODUCTION_BUILD } from "next/constants";
import { DynamoDBAdapter } from "@next-auth/dynamodb-adapter";
import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import CredentialsProvider from "next-auth/providers/credentials";
import EmailProvider from "next-auth/providers/email";

// NextAuth requires NEXTAUTH_URL to match the browser origin. Production usually sets it
// explicitly; Vercel previews expose VERCEL_URL per deployment but rarely set NEXTAUTH_URL.
if (!process.env.NEXTAUTH_URL && process.env.VERCEL_URL) {
  const v = process.env.VERCEL_URL;
  process.env.NEXTAUTH_URL = v.startsWith("http") ? v : `https://${v}`;
}

const isProduction = process.env.NODE_ENV === "production";

const hasEmailProvider =
  Boolean(process.env.EMAIL_SERVER_HOST) &&
  Boolean(process.env.EMAIL_SERVER_PORT) &&
  Boolean(process.env.EMAIL_SERVER_USER) &&
  Boolean(process.env.EMAIL_SERVER_PASSWORD) &&
  Boolean(process.env.EMAIL_FROM);

const hasDynamoAdapter = Boolean(process.env.AWS_REGION) && Boolean(process.env.NEXTAUTH_DYNAMODB_TABLE);

/** Public demo login — bypasses magic link (instant session). */
const DEMO_BYPASS_EMAIL = "demo@custos-ai.com";

function demoInstantCredentialsProvider() {
  return CredentialsProvider({
    id: "demo-instant",
    name: "Demo instant",
    credentials: {
      email: { label: "Email", type: "email" },
    },
    authorize: async (credentials) => {
      const email = credentials?.email?.toString().trim().toLowerCase();
      if (email !== DEMO_BYPASS_EMAIL) return null;
      return {
        id: `demo_${email}`,
        email,
        name: "Custos Demo",
      };
    },
  });
}

const providers: NextAuthOptions["providers"] = [];

const dynamoDocumentClient = hasDynamoAdapter
  ? DynamoDBDocument.from(
      new DynamoDB({
        region: process.env.AWS_REGION,
        ...(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
          ? {
              credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
              },
            }
          : {}),
      }),
      {
        marshallOptions: {
          convertEmptyValues: true,
          removeUndefinedValues: true,
          convertClassInstanceToMap: true,
        },
      },
    )
  : null;

if (hasEmailProvider && hasDynamoAdapter) {
  providers.push(
    EmailProvider({
      from: process.env.EMAIL_FROM,
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      maxAge: 10 * 60,
    }),
  );
  providers.push(demoInstantCredentialsProvider());
}

if (hasEmailProvider && !hasDynamoAdapter && isProduction) {
  throw new Error(
    "Email auth requires DynamoDB adapter config. Set AWS_REGION and NEXTAUTH_DYNAMODB_TABLE.",
  );
}

if (providers.length === 0) {
  // `next build` imports route modules; a no-op credentials provider satisfies NextAuth without OAuth.
  if (process.env.NEXT_PHASE === PHASE_PRODUCTION_BUILD) {
    providers.push(
      CredentialsProvider({
        id: "build-stub",
        name: "Build",
        credentials: {},
        authorize: () => null,
      }),
    );
  } else if (!isProduction) {
    // Local/dev fallback so the app can boot without SMTP + DynamoDB.
    providers.push(
      CredentialsProvider({
        id: "email",
        name: "Development Email",
        credentials: {
          email: { label: "Email", type: "email" },
        },
        authorize: async (credentials) => {
          const email = credentials?.email?.toString().trim().toLowerCase();
          if (!email) return null;
          return {
            id: email,
            email,
            name: email.split("@")[0] || "Developer",
          };
        },
      }),
    );
    providers.push(demoInstantCredentialsProvider());
  } else {
    throw new Error(
      "No auth provider configured. Set Email sign-in env vars: SMTP server fields, EMAIL_FROM, AWS_REGION, and NEXTAUTH_DYNAMODB_TABLE.",
    );
  }
}

export const authOptions: NextAuthOptions = {
  adapter:
    hasEmailProvider && hasDynamoAdapter
      ? DynamoDBAdapter(dynamoDocumentClient!, {
          tableName: process.env.NEXTAUTH_DYNAMODB_TABLE,
        })
      : undefined,
  providers,
  callbacks: {
    async signIn() {
      return true;
    },
    async jwt({ token, user }) {
      // Email + DynamoDB sign-in: ensure JWT carries identity so /api/auth/session stays stable after navigations.
      if (user) {
        token.email = user.email ?? token.email;
        token.name = user.name ?? token.name;
        if (user.id) token.sub = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.email = (token.email as string | undefined) ?? session.user.email ?? "";
        session.user.name = (token.name as string | null | undefined) ?? session.user.name ?? null;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    // Avoid default `/api/auth/error` HTML on App Router (often 500s); send users to login with ?error=
    error: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
};
