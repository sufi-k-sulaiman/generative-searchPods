// Google Translate TTS (free, unofficial)
async function googleTranslateTTS(text, lang = 'en') {
    const maxLength = 200;
    const chunks = [];
    
    // Split text into chunks
    let remaining = text;
    while (remaining.length > 0) {
        if (remaining.length <= maxLength) {
            chunks.push(remaining);
            break;
        }
        let splitIndex = remaining.lastIndexOf(' ', maxLength);
        if (splitIndex === -1) splitIndex = maxLength;
        chunks.push(remaining.substring(0, splitIndex));
        remaining = remaining.substring(splitIndex).trim();
    }
    
    const audioBuffers = [];
    
    for (const chunk of chunks) {
        const encodedText = encodeURIComponent(chunk);
        const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodedText}&tl=${lang}&client=tw-ob`;
        
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        
        if (!response.ok) {
            throw new Error(`Google TTS failed: ${response.status}`);
        }
        
        const buffer = await response.arrayBuffer();
        audioBuffers.push(new Uint8Array(buffer));
    }
    
    // Combine all chunks
    const totalLength = audioBuffers.reduce((sum, buf) => sum + buf.length, 0);
    const combined = new Uint8Array(totalLength);
    let offset = 0;
    for (const buf of audioBuffers) {
        combined.set(buf, offset);
        offset += buf.length;
    }
    
    return combined;
}

// ElevenLabs TTS
async function elevenLabsTTS(text, voiceId = 'EXAVITQu4vr4xnSDxMaL') {
    const apiKey = Deno.env.get('ELEVENLABS_API_KEY');
    if (!apiKey) {
        throw new Error('ElevenLabs API key not configured');
    }
    
    // Truncate to 5000 chars for API limit
    const truncatedText = text.length > 5000 ? text.substring(0, 5000) : text;
    
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': apiKey
        },
        body: JSON.stringify({
            text: truncatedText,
            model_id: 'eleven_monolingual_v1',
            voice_settings: {
                stability: 0.5,
                similarity_boost: 0.5
            }
        })
    });
    
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`ElevenLabs failed: ${response.status} - ${errorText}`);
    }
    
    const buffer = await response.arrayBuffer();
    return new Uint8Array(buffer);
}

// Edge/StreamElements TTS (free)
async function edgeTTS(text, lang = 'en-gb') {
    const voiceMap = {
        'en-us': 'Brian',
        'en-gb': 'Amy',
        'en-au': 'Russell',
        'de-de': 'Hans',
        'fr-fr': 'Mathieu',
        'es-es': 'Miguel'
    };
    
    const voice = voiceMap[lang] || 'Brian';
    const maxLength = 500;
    const chunks = [];
    
    let remaining = text;
    while (remaining.length > 0) {
        if (remaining.length <= maxLength) {
            chunks.push(remaining);
            break;
        }
        let splitIndex = remaining.lastIndexOf(' ', maxLength);
        if (splitIndex === -1) splitIndex = maxLength;
        chunks.push(remaining.substring(0, splitIndex));
        remaining = remaining.substring(splitIndex).trim();
    }
    
    const audioBuffers = [];
    
    for (const chunk of chunks) {
        const encodedText = encodeURIComponent(chunk);
        const url = `https://api.streamelements.com/kappa/v2/speech?voice=${voice}&text=${encodedText}`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`EdgeTTS failed: ${response.status}`);
        }
        
        const buffer = await response.arrayBuffer();
        audioBuffers.push(new Uint8Array(buffer));
    }
    
    const totalLength = audioBuffers.reduce((sum, buf) => sum + buf.length, 0);
    const combined = new Uint8Array(totalLength);
    let offset = 0;
    for (const buf of audioBuffers) {
        combined.set(buf, offset);
        offset += buf.length;
    }
    
    return combined;
}

// Convert bytes to base64
function bytesToBase64(bytes) {
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response(null, {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            }
        });
    }
    
    try {
        const { text, lang = 'en', voice_id } = await req.json();
        
        if (!text) {
            return Response.json({ error: 'Text is required' }, { status: 400 });
        }
        
        let audioBytes;
        let usedService = '';
        const errors = [];
        
        // Try ElevenLabs first if voice_id is provided AND API key exists
        const hasElevenLabsKey = Deno.env.get('ELEVENLABS_API_KEY');
        if (voice_id && hasElevenLabsKey) {
            try {
                console.log('Trying ElevenLabs TTS with voice:', voice_id);
                audioBytes = await elevenLabsTTS(text, voice_id);
                usedService = 'elevenlabs';
                console.log('ElevenLabs TTS succeeded');
            } catch (elevenError) {
                console.log('ElevenLabs TTS failed:', elevenError.message);
                errors.push(`ElevenLabs: ${elevenError.message}`);
            }
        }
        
        // If no ElevenLabs or different voices needed, use Web Speech API on client
        if (!audioBytes && voice_id) {
            console.log('Using Web Speech API for voice selection');
            return Response.json({ 
                useWebSpeech: true,
                text: text,
                lang: lang,
                voiceId: voice_id
            });
        }
        
        // Otherwise try Google Translate TTS
        if (!audioBytes) {
            try {
                console.log('Trying Google Translate TTS...');
                audioBytes = await googleTranslateTTS(text, lang.split('-')[0]);
                usedService = 'google';
                console.log('Google Translate TTS succeeded');
            } catch (googleError) {
                console.log('Google Translate TTS failed:', googleError.message);
                errors.push(`Google: ${googleError.message}`);
                
                // Try EdgeTTS
                try {
                    console.log('Trying EdgeTTS...');
                    audioBytes = await edgeTTS(text, lang);
                    usedService = 'edge';
                    console.log('EdgeTTS succeeded');
                } catch (edgeError) {
                    console.log('EdgeTTS failed:', edgeError.message);
                    errors.push(`Edge: ${edgeError.message}`);
                    
                    // Return signal to use Web Speech API on client
                    return Response.json({ 
                        useWebSpeech: true,
                        text: text,
                        lang: lang,
                        errors: errors
                    });
                }
            }
        }
        
        const base64Audio = bytesToBase64(audioBytes);
        
        return Response.json({ 
            audio: base64Audio,
            service: usedService
        });
        
    } catch (error) {
        console.error('TTS error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});