import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import Stripe from 'npm:stripe';

const stripe = new Stripe(Deno.env.get("STRIPE_API_KEY"));

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { action, amount, currency = 'usd', description, customerId, paymentMethodId, metadata } = await req.json();

        if (!action) {
            return Response.json({ error: 'Action is required' }, { status: 400 });
        }

        let result;

        switch (action) {
            case 'createCustomer':
                result = await stripe.customers.create({
                    email: user.email,
                    name: user.full_name,
                    metadata: { userId: user.id, ...metadata }
                });
                return Response.json({ success: true, customer: result });

            case 'createPaymentIntent':
                if (!amount) {
                    return Response.json({ error: 'Amount is required' }, { status: 400 });
                }
                result = await stripe.paymentIntents.create({
                    amount: Math.round(amount * 100),
                    currency,
                    description,
                    customer: customerId,
                    payment_method: paymentMethodId,
                    metadata: { userId: user.id, ...metadata }
                });
                return Response.json({ 
                    success: true, 
                    clientSecret: result.client_secret,
                    paymentIntent: result 
                });

            case 'createCheckoutSession':
                if (!amount) {
                    return Response.json({ error: 'Amount is required' }, { status: 400 });
                }
                result = await stripe.checkout.sessions.create({
                    payment_method_types: ['card'],
                    line_items: [{
                        price_data: {
                            currency,
                            product_data: { name: description || 'Payment' },
                            unit_amount: Math.round(amount * 100),
                        },
                        quantity: 1,
                    }],
                    mode: 'payment',
                    success_url: `${req.headers.get('origin')}/success?session_id={CHECKOUT_SESSION_ID}`,
                    cancel_url: `${req.headers.get('origin')}/cancel`,
                    customer_email: user.email,
                    metadata: { userId: user.id, ...metadata }
                });
                return Response.json({ success: true, url: result.url, sessionId: result.id });

            case 'listPayments':
                result = await stripe.paymentIntents.list({
                    customer: customerId,
                    limit: 100
                });
                return Response.json({ success: true, payments: result.data });

            case 'refund':
                const { paymentIntentId } = await req.json();
                if (!paymentIntentId) {
                    return Response.json({ error: 'paymentIntentId is required' }, { status: 400 });
                }
                result = await stripe.refunds.create({
                    payment_intent: paymentIntentId,
                    amount: amount ? Math.round(amount * 100) : undefined
                });
                return Response.json({ success: true, refund: result });

            default:
                return Response.json({ error: 'Invalid action' }, { status: 400 });
        }
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});