import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

// Map voice names for StreamElements
const VOICE_MAP = {
    'en-gb': 'Amy',      // British female
    'en-us': 'Matthew',  // American male
    'en-au': 'Nicole',   // Australian female
    'en-za': 'Brian'     // British male (closest to SA)
};

async function generateTTS(text, lang = "en-gb") {
    const voice = VOICE_MAP[lang] || 'Amy';
    
    // Split text into chunks
    const maxLen = 400;
    const chunks = [];
    
    let remaining = text;
    while (remaining.length > 0) {
        let chunk = remaining.substring(0, maxLen);
        if (remaining.length > maxLen) {
            const lastSpace = chunk.lastIndexOf(' ');
            if (lastSpace > 50) {
                chunk = remaining.substring(0, lastSpace);
            }
        }
        chunks.push(chunk.trim());
        remaining = remaining.substring(chunk.length).trim();
    }

    const audioChunks = [];
    
    for (const chunk of chunks) {
        if (!chunk) continue;
        
        const url = `https://api.streamelements.com/kappa/v2/speech?voice=${voice}&text=${encodeURIComponent(chunk)}`;
        
        console.log(`Fetching TTS chunk: ${chunk.substring(0, 50)}...`);
        
        const response = await fetch(url);
        
        if (!response.ok) {
            console.error(`StreamElements failed: ${response.status}`);
            throw new Error(`TTS service error: ${response.status}`);
        }
        
        const buffer = await response.arrayBuffer();
        audioChunks.push(new Uint8Array(buffer));
    }

    if (audioChunks.length === 0) {
        throw new Error('No audio generated');
    }

    // Combine all chunks
    const totalLength = audioChunks.reduce((sum, c) => sum + c.length, 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of audioChunks) {
        result.set(chunk, offset);
        offset += chunk.length;
    }
    
    return result;
}

// Convert Uint8Array to base64
function toBase64(bytes) {
    let binary = "";
    for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

Deno.serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response(null, {
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST",
                "Access-Control-Allow-Headers": "Content-Type, Authorization"
            }
        });
    }

    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        if (!user) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { text, lang = "en" } = body;

        if (!text) {
            return Response.json({ error: "No text provided" }, { status: 400 });
        }

        console.log(`Generating TTS for ${text.length} chars with lang: ${lang}`);

        const audio = await generateTTS(text, lang);
        
        console.log(`Generated ${audio.length} bytes`);

        return Response.json({
            audio: toBase64(audio),
            format: "mp3",
            bytes: audio.length
        });

    } catch (error) {
        console.error("TTS Error:", error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});