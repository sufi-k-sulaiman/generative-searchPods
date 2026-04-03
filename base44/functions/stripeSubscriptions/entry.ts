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

        const { action, customerId, priceId, subscriptionId, trialDays, metadata } = await req.json();

        if (!action) {
            return Response.json({ error: 'Action is required' }, { status: 400 });
        }

        let result;

        switch (action) {
            case 'createProduct':
                const { productName, productDescription, prices } = await req.json();
                const product = await stripe.products.create({
                    name: productName,
                    description: productDescription
                });
                
                const createdPrices = [];
                if (prices && Array.isArray(prices)) {
                    for (const p of prices) {
                        const price = await stripe.prices.create({
                            product: product.id,
                            unit_amount: Math.round(p.amount * 100),
                            currency: p.currency || 'usd',
                            recurring: p.interval ? { interval: p.interval } : undefined
                        });
                        createdPrices.push(price);
                    }
                }
                return Response.json({ success: true, product, prices: createdPrices });

            case 'createSubscription':
                if (!customerId || !priceId) {
                    return Response.json({ error: 'customerId and priceId are required' }, { status: 400 });
                }
                result = await stripe.subscriptions.create({
                    customer: customerId,
                    items: [{ price: priceId }],
                    trial_period_days: trialDays,
                    metadata: { userId: user.id, ...metadata }
                });
                return Response.json({ success: true, subscription: result });

            case 'cancelSubscription':
                if (!subscriptionId) {
                    return Response.json({ error: 'subscriptionId is required' }, { status: 400 });
                }
                result = await stripe.subscriptions.cancel(subscriptionId);
                return Response.json({ success: true, subscription: result });

            case 'updateSubscription':
                if (!subscriptionId || !priceId) {
                    return Response.json({ error: 'subscriptionId and priceId are required' }, { status: 400 });
                }
                const sub = await stripe.subscriptions.retrieve(subscriptionId);
                result = await stripe.subscriptions.update(subscriptionId, {
                    items: [{
                        id: sub.items.data[0].id,
                        price: priceId
                    }]
                });
                return Response.json({ success: true, subscription: result });

            case 'listSubscriptions':
                result = await stripe.subscriptions.list({
                    customer: customerId,
                    status: 'all'
                });
                return Response.json({ success: true, subscriptions: result.data });

            case 'createBillingPortal':
                if (!customerId) {
                    return Response.json({ error: 'customerId is required' }, { status: 400 });
                }
                result = await stripe.billingPortal.sessions.create({
                    customer: customerId,
                    return_url: `${req.headers.get('origin')}/settings`
                });
                return Response.json({ success: true, url: result.url });

            default:
                return Response.json({ error: 'Invalid action' }, { status: 400 });
        }
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});