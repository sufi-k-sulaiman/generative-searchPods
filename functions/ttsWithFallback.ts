// Google Cloud TTS
async function googleCloudTTS(text, voiceId = 'en-GB-Wavenet-A') {
    const apiKey = Deno.env.get('GOOGLE_CLOUD_API_KEY');
    if (!apiKey) {
        throw new Error('Google Cloud API key not configured');
    }
    
    const languageCode = voiceId.substring(0, 5); // e.g., 'en-GB'
    
    const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            input: { text: text },
            voice: {
                languageCode: languageCode,
                name: voiceId
            },
            audioConfig: {
                audioEncoding: 'MP3',
                pitch: 0,
                speakingRate: 1.0
            }
        })
    });
    
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Google Cloud TTS failed: ${response.status} - ${errorText}`);
    }
    
    const result = await response.json();
    
    // Google returns base64 audio in audioContent field
    if (!result.audioContent) {
        throw new Error('No audio content in Google TTS response');
    }
    
    // Decode base64 to bytes
    const binaryString = atob(result.audioContent);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    
    return bytes;
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

        // Try Google Cloud TTS first if voice_id is provided
        if (voice_id && voice_id.includes('Wavenet')) {
            try {
                console.log('Trying Google Cloud TTS with voice:', voice_id);
                audioBytes = await googleCloudTTS(text, voice_id);
                usedService = 'google-cloud';
                console.log('Google Cloud TTS succeeded');
            } catch (googleError) {
                console.log('Google Cloud TTS failed:', googleError.message);
                errors.push(`Google Cloud: ${googleError.message}`);
            }
        }

        // Try ElevenLabs if voice_id starts with EX (ElevenLabs ID format)
        if (!audioBytes && voice_id && voice_id.startsWith('EX')) {
            const hasElevenLabsKey = Deno.env.get('ELEVENLABS_API_KEY');
            if (hasElevenLabsKey) {
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
        }

        // Try EdgeTTS as fallback
        if (!audioBytes) {
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