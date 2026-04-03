import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import Stripe from 'npm:stripe';

const stripe = new Stripe(Deno.env.get("STRIPE_API_KEY"));
const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        const body = await req.text();
        const signature = req.headers.get('stripe-signature');

        let event;
        
        if (webhookSecret && signature) {
            event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
        } else {
            event = JSON.parse(body);
        }

        const { type, data } = event;

        switch (type) {
            case 'checkout.session.completed':
                console.log('Checkout completed:', data.object.id);
                // Handle successful checkout
                break;

            case 'payment_intent.succeeded':
                console.log('Payment succeeded:', data.object.id);
                // Handle successful payment
                break;

            case 'payment_intent.payment_failed':
                console.log('Payment failed:', data.object.id);
                // Handle failed payment
                break;

            case 'customer.subscription.created':
                console.log('Subscription created:', data.object.id);
                // Handle new subscription
                break;

            case 'customer.subscription.updated':
                console.log('Subscription updated:', data.object.id);
                // Handle subscription update
                break;

            case 'customer.subscription.deleted':
                console.log('Subscription cancelled:', data.object.id);
                // Handle subscription cancellation
                break;

            case 'invoice.paid':
                console.log('Invoice paid:', data.object.id);
                // Handle paid invoice
                break;

            case 'invoice.payment_failed':
                console.log('Invoice payment failed:', data.object.id);
                // Handle failed invoice payment
                break;

            default:
                console.log('Unhandled event type:', type);
        }

        return Response.json({ received: true, type });
    } catch (error) {
        console.error('Webhook error:', error.message);
        return Response.json({ error: error.message }, { status: 400 });
    }
});