import { NextResponse } from "next/server";
import Stripe from "stripe";
import { creditWalletFromStripePaymentIntent } from "@/demo/server/repos/demoData";
import { getStripe } from "@/lib/stripe-server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const stripe = getStripe();
  const whSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!stripe || !whSecret) {
    return NextResponse.json(
      { message: "Missing STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET" },
      { status: 500 }
    );
  }

  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ message: "No signature" }, { status: 400 });
  }

  const buf = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(buf, sig, whSecret);
  } catch {
    return NextResponse.json({ message: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "payment_intent.succeeded") {
    const pi = event.data.object as Stripe.PaymentIntent;
    await creditWalletFromStripePaymentIntent({
      id: pi.id,
      metadata: pi.metadata,
      amount_received: pi.amount_received,
      amount: pi.amount,
    });
  }

  return NextResponse.json({ received: true });
}
