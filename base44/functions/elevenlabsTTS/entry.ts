Deno.serve(async (req) => {
    try {
        const body = await req.json();
        
        // Handle test mode
        if (body.test === true) {
            const apiKey = Deno.env.get('ELEVENLABS_API_KEY');
            
            // Test API key by fetching user info
            const testResponse = await fetch('https://api.elevenlabs.io/v1/user', {
                headers: { 'xi-api-key': apiKey || '' }
            });
            
            if (testResponse.ok) {
                const userData = await testResponse.json();
                return Response.json({ 
                    status: 'API key valid', 
                    subscription: userData.subscription,
                    character_count: userData.subscription?.character_count,
                    character_limit: userData.subscription?.character_limit
                });
            } else {
                const error = await testResponse.text();
                return Response.json({ status: 'API key invalid', error }, { status: 401 });
            }
        }
        
        const { text, voice_id = 'EXAVITQu4vr4xnSDxMaL' } = body;
        
        if (!text) {
            return Response.json({ error: 'Text is required' }, { status: 400 });
        }

        const apiKey = Deno.env.get('ELEVENLABS_API_KEY');
        if (!apiKey) {
            return Response.json({ error: 'ElevenLabs API key not configured' }, { status: 500 });
        }

        // Truncate text if too long (ElevenLabs has limits)
        const maxChars = 5000;
        const truncatedText = text.length > maxChars ? text.substring(0, maxChars) + '...' : text;

        console.log('Using API key:', apiKey ? apiKey.substring(0, 8) + '...' : 'MISSING');
        console.log('Voice ID:', voice_id);
        console.log('Text length:', truncatedText.length);

        // Call ElevenLabs API
        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice_id}`, {
            method: 'POST',
            headers: {
                'Accept': 'audio/mpeg',
                'Content-Type': 'application/json',
                'xi-api-key': apiKey
            },
            body: JSON.stringify({
                text: truncatedText,
                model_id: 'eleven_multilingual_v2',
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.75
                }
            })
        });

        if (!response.ok) {
            const error = await response.text();
            console.error('ElevenLabs error:', response.status, error);
            return Response.json({ error: 'Failed to generate speech: ' + error }, { status: response.status });
        }

        const audioBuffer = await response.arrayBuffer();
        const bytes = new Uint8Array(audioBuffer);
        
        console.log('Audio generated, bytes:', bytes.length);
        
        // Convert to base64 in chunks to avoid stack overflow for large files
        let binary = '';
        const chunkSize = 8192;
        for (let i = 0; i < bytes.length; i += chunkSize) {
            const chunk = bytes.subarray(i, Math.min(i + chunkSize, bytes.length));
            binary += String.fromCharCode.apply(null, chunk);
        }
        const base64Audio = btoa(binary);
        
        return Response.json({ 
            audio: base64Audio,
            contentType: 'audio/mpeg'
        });
    } catch (error) {
        console.error('TTS Error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});