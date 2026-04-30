import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

// Avoid Edge/runtime quirks for JWT encode/decode vs dev; keeps cookies consistent with Node session routes.
export const runtime = "nodejs";
