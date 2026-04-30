import { NextResponse } from "next/server";
import { requireSession, toRouteErrorResponse } from "@/lib/server-auth";
import {
  creditWalletFromStripePaymentIntent,
  getWalletById,
  listWallets,
  resolveWorkspaceIdForSession,
} from "@/demo/server/repos/demoData";
import { getStripe } from "@/lib/stripe-server";

export const runtime = "nodejs";

/**
 * Confirms a succeeded PaymentIntent and credits the wallet (idempotent with webhook).
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const stripe = getStripe();
    if (!stripe) {
      return NextResponse.json({ message: "Stripe is not configured." }, { status: 501 });
    }

    const session = await requireSession();
    const workspaceId = await resolveWorkspaceIdForSession(session);
    const { id } = await params;

    const wallets = await listWallets(workspaceId);
    if (!wallets.some((w) => w.id === id)) {
      return NextResponse.json({ message: "Wallet not found" }, { status: 404 });
    }

    const body = await request.json();
    const paymentIntentId =
      typeof body?.paymentIntentId === "string" ? body.paymentIntentId.trim() : "";
    if (!paymentIntentId) {
      return NextResponse.json({ message: "paymentIntentId required" }, { status: 400 });
    }

    const pi = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (pi.status !== "succeeded") {
      return NextResponse.json(
        { message: `PaymentIntent status is ${pi.status}, expected succeeded.` },
        { status: 400 }
      );
    }
    if (pi.metadata?.walletId !== id) {
      return NextResponse.json({ message: "PaymentIntent does not match this wallet." }, { status: 400 });
    }
    if (pi.metadata?.workspaceId !== workspaceId) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const result = await creditWalletFromStripePaymentIntent({
      id: pi.id,
      metadata: pi.metadata,
      amount_received: pi.amount_received,
      amount: pi.amount,
    });

    const wallet = await getWalletById(id);
    return NextResponse.json({ ...result, wallet });
  } catch (e) {
    return toRouteErrorResponse(e);
  }
}
