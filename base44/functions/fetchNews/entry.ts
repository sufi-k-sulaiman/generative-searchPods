import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

// Google News RSS - free, no rate limits
function getGoogleNewsURL(query) {
    return `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`;
}

function getGoogleNewsCategoryURL(category) {
    const categoryMap = {
        technology: 'technology',
        business: 'business',
        science: 'science',
        health: 'health',
        sports: 'sports',
        entertainment: 'entertainment',
        world: 'world',
        politics: 'politics',
    };
    const topic = categoryMap[category] || category;
    return `https://news.google.com/rss/search?q=${encodeURIComponent(topic + ' news')}&hl=en-US&gl=US&ceid=US:en`;
}

// Parse RSS XML
async function parseRSS(xml, source) {
    const articles = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
    let match;
    const items = [];
    
    while ((match = itemRegex.exec(xml)) !== null) {
        items.push(match[1]);
    }
    
    // Process items and resolve Google News URLs in parallel
    const promises = items.slice(0, 30).map(async (item) => {
        const title = extractTag(item, 'title');
        let link = extractTag(item, 'link') || extractGoogleLink(item);
        const pubDate = extractTag(item, 'pubDate');
        const description = extractTag(item, 'description');
        
        if (title && link) {
            // Resolve Google News redirect URLs to actual article URLs
            const resolvedUrl = await resolveGoogleNewsUrl(cleanUrl(link));
            const cleanedTitle = cleanText(title);
            let cleanedSummary = cleanText(description || '');
            
            // If summary is empty or too short, generate one from title
            if (!cleanedSummary || cleanedSummary.length < 20) {
                cleanedSummary = generateSummaryFromTitle(cleanedTitle);
            }
            
            return {
                title: cleanedTitle,
                url: resolvedUrl,
                source: extractSourceFromUrl(resolvedUrl) || source,
                summary: cleanedSummary.slice(0, 300),
                time: formatTime(pubDate),
                imagePrompt: generateImagePrompt(title),
            };
        }
        return null;
    });
    
    const results = await Promise.all(promises);
    return results.filter(Boolean);
}

function extractTag(xml, tag) {
    const cdataMatch = xml.match(new RegExp(`<${tag}><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>`, 'i'));
    if (cdataMatch) return cdataMatch[1];
    
    const simpleMatch = xml.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, 'i'));
    return simpleMatch ? simpleMatch[1] : null;
}

function extractGoogleLink(item) {
    // Google News wraps links in CDATA or uses guid
    const guidMatch = item.match(/<guid[^>]*>([^<]+)<\/guid>/i);
    if (guidMatch && guidMatch[1].startsWith('http')) return guidMatch[1];
    
    const linkMatch = item.match(/<link>([^<]+)<\/link>/i);
    return linkMatch ? linkMatch[1] : null;
}

function cleanText(text) {
    if (!text) return '';
    return text
        // Remove all HTML tags including anchor tags with href
        .replace(/<a[^>]*>.*?<\/a>/gi, '')
        .replace(/<[^>]*>/g, '')
        // Decode HTML entities
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, ' ')
        // Remove any remaining URLs
        .replace(/https?:\/\/[^\s]+/g, '')
        // Clean up whitespace
        .replace(/\s+/g, ' ')
        .trim();
}

function generateSummaryFromTitle(title) {
    // Generate a brief description based on the title when RSS description is empty/poor
    const cleanTitle = cleanText(title);
    return `Read the full story about: ${cleanTitle}`;
}

async function resolveGoogleNewsUrl(url) {
    // Google News URLs are redirects - follow them to get real URL
    if (url.includes('news.google.com')) {
        try {
            const response = await fetch(url, {
                method: 'HEAD',
                redirect: 'follow',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                },
            });
            return response.url || url;
        } catch {
            return url;
        }
    }
    return url;
}

function cleanUrl(url) {
    return url.trim();
}

function extractSourceFromUrl(url) {
    try {
        const hostname = new URL(url).hostname.replace('www.', '');
        const sources = {
            'bbc.com': 'BBC', 'bbc.co.uk': 'BBC',
            'cnn.com': 'CNN',
            'reuters.com': 'Reuters',
            'nytimes.com': 'NY Times',
            'theguardian.com': 'The Guardian',
            'npr.org': 'NPR',
            'techcrunch.com': 'TechCrunch',
            'wired.com': 'Wired',
            'arstechnica.com': 'Ars Technica',
            'news.google.com': 'Google News',
        };
        for (const [domain, name] of Object.entries(sources)) {
            if (hostname.includes(domain)) return name;
        }
        return hostname.split('.')[0].charAt(0).toUpperCase() + hostname.split('.')[0].slice(1);
    } catch {
        return 'News';
    }
}

function formatTime(dateStr) {
    if (!dateStr) return 'Recently';
    try {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);
        
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    } catch {
        return 'Recently';
    }
}

function generateImagePrompt(title) {
    // Generate a lifestyle/professional image prompt based on title keywords
    const keywords = title.toLowerCase();
    if (keywords.includes('tech') || keywords.includes('ai') || keywords.includes('robot')) {
        return 'Modern technology office, clean workspace, soft lighting, minimalist';
    }
    if (keywords.includes('climate') || keywords.includes('environment')) {
        return 'Nature landscape, green forests, blue sky, environmental photography';
    }
    if (keywords.includes('business') || keywords.includes('economy') || keywords.includes('market')) {
        return 'Modern business district, city skyline, professional atmosphere';
    }
    if (keywords.includes('health') || keywords.includes('medical')) {
        return 'Healthcare setting, clean medical environment, wellness concept';
    }
    if (keywords.includes('space') || keywords.includes('nasa')) {
        return 'Space exploration, stars, cosmic imagery, astronomy';
    }
    return 'Professional news photography, neutral tones, journalistic style';
}

// Fetch from Google News RSS
async function fetchGoogleNewsRSS(queryOrCategory, isCategory = false) {
    const url = isCategory 
        ? getGoogleNewsCategoryURL(queryOrCategory)
        : getGoogleNewsURL(queryOrCategory);
    
    console.log('Fetching from:', url);
        
    const response = await fetch(url, {
        headers: { 
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/rss+xml, application/xml, text/xml, */*',
            'Accept-Language': 'en-US,en;q=0.9',
        },
    });
    
    console.log('Response status:', response.status);
    
    if (!response.ok) {
        throw new Error(`Google News returned ${response.status}`);
    }
    
    const xml = await response.text();
    console.log('XML length:', xml.length);
    
    if (!xml || xml.length < 100) {
        throw new Error('Empty or invalid RSS response from Google News');
    }
    
    const articles = await parseRSS(xml, 'Google News');
    console.log('Parsed articles:', articles.length);
    
    if (articles.length === 0) {
        throw new Error('No articles parsed from RSS feed');
    }
    
    return articles;
}

// Deduplicate articles by URL and title similarity
function deduplicateArticles(articles) {
    const seen = new Set();
    const unique = [];
    
    for (const art of articles) {
        const key = art.url || art.title.toLowerCase().slice(0, 50);
        if (!seen.has(key) && art.title && art.url) {
            seen.add(key);
            unique.push(art);
        }
    }
    
    return unique;
}

Deno.serve(async (req) => {
    try {
        // No auth required - public endpoint for news
        const { query, category, limit = 30 } = await req.json();

        // Fetch live from Google News RSS - no cache, no entity access
        console.log('Fetching live news for:', query || category || 'technology');
        
        let liveArticles = [];
        try {
            liveArticles = await fetchGoogleNewsRSS(query || category || 'technology', !query && !!category);
        } catch (rssError) {
            console.error('RSS fetch error:', rssError.message);
            return Response.json({ 
                error: rssError.message, 
                success: false,
                articles: [] 
            }, { status: 200 });
        }
        
        if (!liveArticles || liveArticles.length === 0) {
            return Response.json({ 
                error: 'No articles found from Google News RSS', 
                success: false,
                articles: [] 
            }, { status: 200 });
        }

        return Response.json({
            success: true,
            source: 'live',
            count: liveArticles.length,
            query: query || null,
            category: category || null,
            articles: liveArticles.slice(0, limit),
        });

    } catch (error) {
        console.error('fetchNews error:', error);
        return Response.json({ 
            error: error.message, 
            success: false,
            articles: [] 
        }, { status: 200 });
    }
});

function formatTimeFromDate(dateStr) {
    if (!dateStr) return 'Recently';
    try {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);
        
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    } catch {
        return 'Recently';
    }
}