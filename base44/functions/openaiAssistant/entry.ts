import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import OpenAI from 'npm:openai';

const openai = new OpenAI({
    apiKey: Deno.env.get("OPENAI_API_KEY"),
});

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { action, assistantId, threadId, message, instructions, name, model = 'gpt-4o-mini' } = await req.json();

        if (!action) {
            return Response.json({ error: 'Action is required' }, { status: 400 });
        }

        let result;

        switch (action) {
            case 'createAssistant':
                result = await openai.beta.assistants.create({
                    name: name || 'AI Assistant',
                    instructions: instructions || 'You are a helpful assistant.',
                    model,
                });
                return Response.json({ success: true, assistant: result });

            case 'createThread':
                result = await openai.beta.threads.create();
                return Response.json({ success: true, thread: result });

            case 'addMessage':
                if (!threadId || !message) {
                    return Response.json({ error: 'threadId and message are required' }, { status: 400 });
                }
                result = await openai.beta.threads.messages.create(threadId, {
                    role: 'user',
                    content: message,
                });
                return Response.json({ success: true, message: result });

            case 'runAssistant':
                if (!threadId || !assistantId) {
                    return Response.json({ error: 'threadId and assistantId are required' }, { status: 400 });
                }
                const run = await openai.beta.threads.runs.createAndPoll(threadId, {
                    assistant_id: assistantId,
                });
                
                if (run.status === 'completed') {
                    const messages = await openai.beta.threads.messages.list(threadId);
                    const assistantMessages = messages.data.filter(m => m.role === 'assistant');
                    return Response.json({ 
                        success: true, 
                        status: run.status,
                        messages: assistantMessages.map(m => ({
                            id: m.id,
                            content: m.content[0]?.text?.value || ''
                        }))
                    });
                }
                return Response.json({ success: true, status: run.status, run });

            case 'getMessages':
                if (!threadId) {
                    return Response.json({ error: 'threadId is required' }, { status: 400 });
                }
                const threadMessages = await openai.beta.threads.messages.list(threadId);
                return Response.json({ 
                    success: true, 
                    messages: threadMessages.data.map(m => ({
                        id: m.id,
                        role: m.role,
                        content: m.content[0]?.text?.value || ''
                    }))
                });

            default:
                return Response.json({ error: 'Invalid action' }, { status: 400 });
        }
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});