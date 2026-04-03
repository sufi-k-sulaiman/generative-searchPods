import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import twilio from 'npm:twilio';

const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
const twilioPhone = Deno.env.get("TWILIO_PHONE_NUMBER");

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const client = twilio(accountSid, authToken);
        const { action, to, body, mediaUrl, from } = await req.json();

        if (!action) {
            return Response.json({ error: 'Action is required' }, { status: 400 });
        }

        let result;

        switch (action) {
            case 'send':
                if (!to || !body) {
                    return Response.json({ error: 'to and body are required' }, { status: 400 });
                }
                const messageOptions = {
                    body,
                    from: from || twilioPhone,
                    to
                };
                if (mediaUrl) {
                    messageOptions.mediaUrl = Array.isArray(mediaUrl) ? mediaUrl : [mediaUrl];
                }
                result = await client.messages.create(messageOptions);
                return Response.json({ 
                    success: true, 
                    messageSid: result.sid,
                    status: result.status
                });

            case 'getMessages':
                const { limit = 50, dateSent } = await req.json();
                const filters = { limit };
                if (dateSent) filters.dateSent = new Date(dateSent);
                result = await client.messages.list(filters);
                return Response.json({ 
                    success: true, 
                    messages: result.map(m => ({
                        sid: m.sid,
                        from: m.from,
                        to: m.to,
                        body: m.body,
                        status: m.status,
                        dateSent: m.dateSent
                    }))
                });

            case 'getMessage':
                const { messageSid } = await req.json();
                if (!messageSid) {
                    return Response.json({ error: 'messageSid is required' }, { status: 400 });
                }
                result = await client.messages(messageSid).fetch();
                return Response.json({ 
                    success: true, 
                    message: {
                        sid: result.sid,
                        from: result.from,
                        to: result.to,
                        body: result.body,
                        status: result.status,
                        dateSent: result.dateSent,
                        errorCode: result.errorCode,
                        errorMessage: result.errorMessage
                    }
                });

            default:
                return Response.json({ error: 'Invalid action' }, { status: 400 });
        }
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});