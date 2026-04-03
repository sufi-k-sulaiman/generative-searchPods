import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import Stripe from 'npm:stripe';

Deno.serve(async (req) => {
    try {
        const stripe = new Stripe(Deno.env.get("Stripe"));
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Test connection by fetching account info
        const account = await stripe.accounts.retrieve();

        return Response.json({ 
            success: true,
            message: 'Stripe connection successful!',
            account_id: account.id,
            country: account.country,
            default_currency: account.default_currency
        });
    } catch (error) {
        return Response.json({ 
            success: false,
            error: error.message 
        }, { status: 500 });
    }
});