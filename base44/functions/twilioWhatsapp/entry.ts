import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import twilio from 'npm:twilio';

const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
const twilioWhatsAppNumber = Deno.env.get("TWILIO_WHATSAPP_NUMBER") || 'whatsapp:+14155238886';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const client = twilio(accountSid, authToken);
        const { action, to, body, mediaUrl, templateSid, templateVariables } = await req.json();

        if (!action) {
            return Response.json({ error: 'Action is required' }, { status: 400 });
        }

        let result;
        const whatsAppTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;

        switch (action) {
            case 'send':
                if (!to || !body) {
                    return Response.json({ error: 'to and body are required' }, { status: 400 });
                }
                const messageOptions = {
                    body,
                    from: twilioWhatsAppNumber,
                    to: whatsAppTo
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

            case 'sendTemplate':
                if (!to || !templateSid) {
                    return Response.json({ error: 'to and templateSid are required' }, { status: 400 });
                }
                result = await client.messages.create({
                    contentSid: templateSid,
                    contentVariables: JSON.stringify(templateVariables || {}),
                    from: twilioWhatsAppNumber,
                    to: whatsAppTo
                });
                return Response.json({ 
                    success: true, 
                    messageSid: result.sid,
                    status: result.status
                });

            case 'getMessages':
                const { limit = 50 } = await req.json();
                result = await client.messages.list({ 
                    limit,
                    from: twilioWhatsAppNumber
                });
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

            default:
                return Response.json({ error: 'Invalid action' }, { status: 400 });
        }
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});