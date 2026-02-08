// SEO Tools Scraper Module
const axios = require('axios');
const cheerio = require('cheerio');
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

async function fetchPage(url) {
    const response = await axios.get(url, { headers: { 'User-Agent': USER_AGENT }, timeout: 10000 });
    return response.data;
}

async function analyzePage(req, res) {
    try {
        const { url } = req.query;
        if (!url) return res.status(400).json({ error: 'URL required' });

        const html = await fetchPage(url);
        const $ = cheerio.load(html);

        const seo = {
            title: $('title').text().trim(),
            titleLength: $('title').text().trim().length,
            description: $('meta[name="description"]').attr('content') || '',
            descriptionLength: ($('meta[name="description"]').attr('content') || '').length,
            h1Count: $('h1').length,
            h2Count: $('h2').length,
            imageCount: $('img').length,
            imagesWithoutAlt: $('img:not([alt])').length,
            linkCount: $('a').length,
            internalLinks: $('a[href^="/"], a[href*="' + new URL(url).hostname + '"]').length,
            externalLinks: $('a[href^="http"]:not([href*="' + new URL(url).hostname + '"])').length,
            wordCount: $('body').text().split(/\s+/).length,
            hasRobotsMeta: $('meta[name="robots"]').length > 0,
            hasCanonical: $('link[rel="canonical"]').length > 0,
            canonicalUrl: $('link[rel="canonical"]').attr('href') || '',
            ogTags: {
                title: $('meta[property="og:title"]').attr('content') || '',
                description: $('meta[property="og:description"]').attr('content') || '',
                image: $('meta[property="og:image"]').attr('content') || ''
            }
        };

        res.json({ success: true, url, seo });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

async function extractKeywords(req, res) {
    try {
        const { url } = req.query;
        if (!url) return res.status(400).json({ error: 'URL required' });

        const html = await fetchPage(url);
        const $ = cheerio.load(html);

        const text = $('body').text().toLowerCase();
        const words = text.match(/\b[a-z]{4,}\b/g) || [];
        const frequency = {};
        words.forEach(word => frequency[word] = (frequency[word] || 0) + 1);

        const keywords = Object.entries(frequency)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 20)
            .map(([word, count]) => ({ word, count }));

        const metaKeywords = $('meta[name="keywords"]').attr('content') || '';

        res.json({ success: true, url, metaKeywords, topKeywords: keywords });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

async function getBacklinks(req, res) {
    try {
        const { url } = req.query;
        if (!url) return res.status(400).json({ error: 'URL required' });

        const html = await fetchPage(url);
        const $ = cheerio.load(html);

        const backlinks = $('a[href^="http"]').map((i, el) => ({
            text: $(el).text().trim(),
            href: $(el).attr('href'),
            rel: $(el).attr('rel') || 'follow'
        })).get();

        res.json({ success: true, url, totalBacklinks: backlinks.length, backlinks: backlinks.slice(0, 50) });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

async function getMetaTags(req, res) {
    try {
        const { url } = req.query;
        if (!url) return res.status(400).json({ error: 'URL required' });

        const html = await fetchPage(url);
        const $ = cheerio.load(html);

        const metaTags = {
            title: $('title').text().trim(),
            description: $('meta[name="description"]').attr('content') || '',
            keywords: $('meta[name="keywords"]').attr('content') || '',
            author: $('meta[name="author"]').attr('content') || '',
            robots: $('meta[name="robots"]').attr('content') || '',
            viewport: $('meta[name="viewport"]').attr('content') || '',
            charset: $('meta[charset]').attr('charset') || '',
            openGraph: {
                title: $('meta[property="og:title"]').attr('content') || '',
                description: $('meta[property="og:description"]').attr('content') || '',
                image: $('meta[property="og:image"]').attr('content') || '',
                url: $('meta[property="og:url"]').attr('content') || '',
                type: $('meta[property="og:type"]').attr('content') || ''
            },
            twitter: {
                card: $('meta[name="twitter:card"]').attr('content') || '',
                title: $('meta[name="twitter:title"]').attr('content') || '',
                description: $('meta[name="twitter:description"]').attr('content') || '',
                image: $('meta[name="twitter:image"]').attr('content') || ''
            }
        };

        res.json({ success: true, url, metaTags });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

module.exports = { analyzePage, extractKeywords, getBacklinks, getMetaTags };
