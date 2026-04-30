import { NextResponse } from "next/server";
import { requireSession, toRouteErrorResponse } from "@/lib/server-auth";
import {
  getWalletById,
  listWallets,
  resolveWorkspaceIdForSession,
} from "@/demo/server/repos/demoData";
import { getStripe } from "@/lib/stripe-server";

export const runtime = "nodejs";

const MIN_AMOUNT = 0.5;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const stripe = getStripe();
    if (!stripe) {
      return NextResponse.json(
        { message: "Stripe is not configured (missing STRIPE_SECRET_KEY)." },
        { status: 501 }
      );
    }

    const session = await requireSession();
    const workspaceId = await resolveWorkspaceIdForSession(session);
    const { id } = await params;

    const wallets = await listWallets(workspaceId);
    if (!wallets.some((w) => w.id === id)) {
      return NextResponse.json({ message: "Wallet not found" }, { status: 404 });
    }

    const wallet = await getWalletById(id);
    if (!wallet) {
      return NextResponse.json({ message: "Wallet not found" }, { status: 404 });
    }

    const body = await request.json();
    const amount = Number(body?.amount);
    if (!Number.isFinite(amount) || amount < MIN_AMOUNT) {
      return NextResponse.json(
        { message: `Amount must be at least ${MIN_AMOUNT}.` },
        { status: 400 }
      );
    }

    const amountCents = Math.round(amount * 100);
    if (amountCents < 50) {
      return NextResponse.json({ message: "Amount too small after rounding." }, { status: 400 });
    }

    const currency =
      wallet.currency && /^[a-zA-Z]{3}$/.test(wallet.currency.trim())
        ? wallet.currency.trim().toLowerCase()
        : "usd";

    const intent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency,
      automatic_payment_methods: { enabled: true },
      metadata: {
        walletId: id,
        workspaceId,
      },
      description: `Custos wallet top-up · ${wallet.name}`,
    });

    if (!intent.client_secret) {
      return NextResponse.json({ message: "Stripe did not return a client secret." }, { status: 502 });
    }

    return NextResponse.json({ clientSecret: intent.client_secret });
  } catch (e) {
    return toRouteErrorResponse(e);
  }
}
