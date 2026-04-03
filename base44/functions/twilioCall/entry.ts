import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import twilio from 'npm:twilio@4.19.0';

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

        const { action, to, message, participants } = await req.json();
        const client = twilio(accountSid, authToken);

        if (action === 'call') {
            const call = await client.calls.create({
                to: to,
                from: twilioPhone,
                url: 'http://demo.twilio.com/docs/voice.xml'
            });
            
            await base44.entities.CallLog.create({
                phone_number: to,
                type: 'outgoing',
                status: 'completed',
                duration: 0
            });

            return Response.json({ success: true, callSid: call.sid });
        }

        if (action === 'sms') {
            const smsResult = await client.messages.create({
                to: to,
                from: twilioPhone,
                body: message
            });

            await base44.entities.Message.create({
                type: 'sms',
                from_user: user.email,
                to_user: to,
                content: message,
                status: 'sent',
                conversation_id: to
            });

            return Response.json({ success: true, messageSid: smsResult.sid });
        }

        if (action === 'conference') {
            const conferenceName = `conf_${Date.now()}`;
            const results = [];
            
            for (const participant of participants) {
                const call = await client.calls.create({
                    to: participant,
                    from: twilioPhone,
                    twiml: `<Response><Dial><Conference>${conferenceName}</Conference></Dial></Response>`
                });
                results.push({ phone: participant, callSid: call.sid });
            }

            await base44.entities.CallLog.create({
                phone_number: participants[0],
                type: 'conference',
                status: 'completed',
                conference_participants: participants
            });

            return Response.json({ success: true, conference: conferenceName, calls: results });
        }

        return Response.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});