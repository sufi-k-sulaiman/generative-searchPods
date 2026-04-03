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

        const { texts, model = 'text-embedding-3-small' } = await req.json();

        if (!texts || !Array.isArray(texts) || texts.length === 0) {
            return Response.json({ error: 'Texts array is required' }, { status: 400 });
        }

        const response = await openai.embeddings.create({
            model,
            input: texts,
        });

        return Response.json({
            success: true,
            embeddings: response.data.map(d => d.embedding),
            usage: response.usage,
            model: response.model
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});