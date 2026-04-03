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

        const { prompt, model = 'gpt-4o-mini', systemPrompt, temperature = 0.7, maxTokens = 2000, stream = false } = await req.json();

        if (!prompt) {
            return Response.json({ error: 'Prompt is required' }, { status: 400 });
        }

        const messages = [];
        if (systemPrompt) {
            messages.push({ role: 'system', content: systemPrompt });
        }
        messages.push({ role: 'user', content: prompt });

        const response = await openai.chat.completions.create({
            model,
            messages,
            temperature,
            max_tokens: maxTokens,
        });

        return Response.json({
            success: true,
            content: response.choices[0].message.content,
            usage: response.usage,
            model: response.model
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});