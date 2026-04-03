import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        // Get webhook secret from query params for validation
        const url = new URL(req.url);
        const secret = url.searchParams.get('secret');
        const expectedSecret = Deno.env.get("WEBHOOK_SECRET");
        
        // Validate secret if configured
        if (expectedSecret && secret !== expectedSecret) {
            return Response.json({ error: 'Invalid webhook secret' }, { status: 401 });
        }

        const contentType = req.headers.get('content-type') || '';
        let payload;

        if (contentType.includes('application/json')) {
            payload = await req.json();
        } else if (contentType.includes('application/x-www-form-urlencoded')) {
            const formData = await req.formData();
            payload = Object.fromEntries(formData);
        } else {
            payload = await req.text();
        }

        // Log webhook for debugging
        console.log('Webhook received:', {
            method: req.method,
            headers: Object.fromEntries(req.headers),
            payload
        });

        // Get webhook type from headers or payload
        const webhookType = req.headers.get('x-webhook-type') || 
                           payload?.type || 
                           payload?.event || 
                           'generic';

        // Process based on webhook type
        switch (webhookType) {
            case 'order.created':
                // Handle new order
                console.log('New order:', payload);
                break;

            case 'user.created':
                // Handle new user
                console.log('New user:', payload);
                break;

            case 'payment.received':
                // Handle payment
                console.log('Payment received:', payload);
                break;

            case 'form.submitted':
                // Handle form submission
                console.log('Form submitted:', payload);
                break;

            default:
                // Generic webhook handling
                console.log('Generic webhook:', webhookType, payload);
        }

        // You can store webhook data in an entity
        // await base44.asServiceRole.entities.WebhookLog.create({
        //     type: webhookType,
        //     payload: JSON.stringify(payload),
        //     received_at: new Date().toISOString()
        // });

        return Response.json({ 
            success: true, 
            received: true,
            type: webhookType,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Webhook error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});