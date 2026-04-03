import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

// Common 404 page indicators in HTML content
const NOT_FOUND_PATTERNS = [
    /<title>[^<]*404[^<]*<\/title>/i,
    /<title>[^<]*not\s*found[^<]*<\/title>/i,
    /<title>[^<]*page\s*not\s*found[^<]*<\/title>/i,
    /class="[^"]*error-?404[^"]*"/i,
    /id="[^"]*404[^"]*"/i,
];

// Trusted news domains - always accept these with 200 status
const TRUSTED_DOMAINS = [
    'reuters.com', 'bbc.com', 'bbc.co.uk', 'apnews.com', 'npr.org',
    'theguardian.com', 'cnn.com', 'cnbc.com', 'techcrunch.com',
    'wired.com', 'arstechnica.com', 'news.google.com', 'nytimes.com',
    'washingtonpost.com', 'wsj.com', 'bloomberg.com', 'forbes.com'
];

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { url } = await req.json();
        
        if (!url || !url.startsWith('http')) {
            return Response.json({ valid: false, reason: 'Invalid URL format' });
        }

        // Check if it's a Google News search URL - always valid
        if (url.includes('news.google.com/search')) {
            return Response.json({ valid: true, status: 200, reason: 'Google News search' });
        }

        // Check if domain is trusted
        const urlObj = new URL(url);
        const hostname = urlObj.hostname.replace('www.', '');
        const isTrustedDomain = TRUSTED_DOMAINS.some(domain => hostname.includes(domain));

        try {
            // First try HEAD to check status code
            const headResponse = await fetch(url, { 
                method: 'HEAD',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
                },
                redirect: 'follow'
            });
            
            // If server returns actual 404/5xx, it's definitely invalid
            if (headResponse.status >= 400) {
                return Response.json({ valid: false, status: headResponse.status, reason: 'HTTP error status' });
            }

            // For 200 responses, we need to check if it's a soft 404 (SPA returning 200 for non-existent pages)
            // Do a GET request and check the content
            const getResponse = await fetch(url, { 
                method: 'GET',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
                },
                redirect: 'follow'
            });

            if (getResponse.status >= 400) {
                return Response.json({ valid: false, status: getResponse.status, reason: 'HTTP error status' });
            }

            // For trusted domains with 200 status, do minimal checking
            if (isTrustedDomain) {
                return Response.json({ valid: true, status: getResponse.status, reason: 'Trusted domain' });
            }

            // Check content for soft 404 patterns only for non-trusted domains
            const contentType = getResponse.headers.get('content-type') || '';
            if (contentType.includes('text/html')) {
                const html = await getResponse.text();
                
                // Check if the page contains 404 indicators (soft 404 detection)
                for (const pattern of NOT_FOUND_PATTERNS) {
                    if (pattern.test(html)) {
                        return Response.json({ valid: false, status: 200, reason: 'Soft 404 detected' });
                    }
                }
            }

            return Response.json({ valid: true, status: getResponse.status });
            
        } catch (fetchError) {
            return Response.json({ valid: false, error: 'Network error', details: fetchError.message });
        }
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});