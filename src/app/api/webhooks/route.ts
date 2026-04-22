import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const customerId = session.customer as string;
        const userId = session.client_reference_id;

        if (userId) {
          await supabaseAdmin
            .from('profiles')
            .update({ 
              stripe_customer_id: customerId, 
              subscription_status: 'active' 
            })
            .eq('id', userId);
        }
        break;
      }
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const status = subscription.status;
        const customerId = subscription.customer as string;

        await supabaseAdmin
          .from('profiles')
          .update({ subscription_status: status })
          .eq('stripe_customer_id', customerId);
        break;
      }
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
  } catch (error) {
    return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
