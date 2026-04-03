import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import twilio from 'npm:twilio';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID") || Deno.env.get("Twilio");
        const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
        
        if (!accountSid || !authToken) {
            return Response.json({ 
                success: false,
                error: 'Missing Twilio credentials. Please set TWILIO_ACCOUNT_SID (or Twilio) and TWILIO_AUTH_TOKEN secrets.',
                hasAccountSid: !!accountSid,
                hasAuthToken: !!authToken
            }, { status: 400 });
        }

        const client = twilio(accountSid, authToken);

        // Test connection by fetching account info
        const account = await client.api.accounts(accountSid).fetch();

        return Response.json({ 
            success: true,
            message: 'Twilio connection successful!',
            account_name: account.friendlyName,
            status: account.status
        });
    } catch (error) {
        return Response.json({ 
            success: false,
            error: error.message 
        }, { status: 500 });
    }
});