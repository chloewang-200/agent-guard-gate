import type { NextAuthOptions } from "next-auth";
import { PHASE_PRODUCTION_BUILD } from "next/constants";
import { DynamoDBAdapter } from "@next-auth/dynamodb-adapter";
import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import CredentialsProvider from "next-auth/providers/credentials";
import EmailProvider from "next-auth/providers/email";

const isProduction = process.env.NODE_ENV === "production";

const hasEmailProvider =
  Boolean(process.env.EMAIL_SERVER_HOST) &&
  Boolean(process.env.EMAIL_SERVER_PORT) &&
  Boolean(process.env.EMAIL_SERVER_USER) &&
  Boolean(process.env.EMAIL_SERVER_PASSWORD) &&
  Boolean(process.env.EMAIL_FROM);

const hasDynamoAdapter = Boolean(process.env.AWS_REGION) && Boolean(process.env.NEXTAUTH_DYNAMODB_TABLE);

const providers: NextAuthOptions["providers"] = [];

const dynamoDocumentClient = hasDynamoAdapter
  ? DynamoDBDocument.from(
      new DynamoDB({
        region: process.env.AWS_REGION,
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
    async session({ session }) {
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
};
