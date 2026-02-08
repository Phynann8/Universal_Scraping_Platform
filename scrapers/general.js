// ============================================
// GENERAL SCRAPER MODULE
// ============================================
// Handles basic web scraping for any website

const axios = require('axios');
const cheerio = require('cheerio');

// User agent for requests
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

// ============================================
// HELPER FUNCTION: Fetch webpage
// ============================================
async function fetchPage(url) {
    try {
        const response = await axios.get(url, {
            headers: { 'User-Agent': USER_AGENT },
            timeout: 10000
        });
        return response.data;
    } catch (error) {
        throw new Error(`Failed to fetch ${url}: ${error.message}`);
    }
}

// ============================================
// 1. BASIC SCRAPER
// ============================================
async function scrapeBasic(req, res) {
    try {
        const { url } = req.query;

        if (!url) {
            return res.status(400).json({
                error: 'URL parameter is required',
                example: '/api/general/scrape?url=https://example.com'
            });
        }

        const html = await fetchPage(url);
        const $ = cheerio.load(html);

        const data = {
            url: url,
            title: $('title').text().trim() || 'No title found',
            description: $('meta[name="description"]').attr('content') ||
                $('meta[property="og:description"]').attr('content') ||
                'No description found',
            headings: {
                h1: $('h1').map((i, el) => $(el).text().trim()).get(),
                h2: $('h2').map((i, el) => $(el).text().trim()).get(),
                h3: $('h3').map((i, el) => $(el).text().trim()).get()
            },
            paragraphs: $('p').map((i, el) => $(el).text().trim()).get().filter(p => p.length > 20).slice(0, 10),
            links: $('a[href]').length,
            images: $('img[src]').length,
            scrapedAt: new Date().toISOString()
        };

        res.json({
            success: true,
            data: data
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

// ============================================
// 2. HEADLINES SCRAPER
// ============================================
async function scrapeHeadlines(req, res) {
    try {
        const { url } = req.query;

        if (!url) {
            return res.status(400).json({
                error: 'URL parameter is required'
            });
        }

        const html = await fetchPage(url);
        const $ = cheerio.load(html);

        const headlines = {
            h1: $('h1').map((i, el) => $(el).text().trim()).get(),
            h2: $('h2').map((i, el) => $(el).text().trim()).get(),
            h3: $('h3').map((i, el) => $(el).text().trim()).get(),
            h4: $('h4').map((i, el) => $(el).text().trim()).get()
        };

        res.json({
            success: true,
            url: url,
            headlines: headlines,
            totalHeadlines: headlines.h1.length + headlines.h2.length + headlines.h3.length + headlines.h4.length
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

// ============================================
// 3. IMAGES SCRAPER
// ============================================
async function scrapeImages(req, res) {
    try {
        const { url } = req.query;

        if (!url) {
            return res.status(400).json({
                error: 'URL parameter is required'
            });
        }

        const html = await fetchPage(url);
        const $ = cheerio.load(html);

        const images = $('img').map((i, el) => {
            const src = $(el).attr('src');
            if (!src) return null;

            return {
                src: src.startsWith('http') ? src : new URL(src, url).href,
                alt: $(el).attr('alt') || '',
                width: $(el).attr('width') || 'auto',
                height: $(el).attr('height') || 'auto',
                title: $(el).attr('title') || ''
            };
        }).get().filter(img => img !== null);

        res.json({
            success: true,
            url: url,
            totalImages: images.length,
            images: images
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

// ============================================
// 4. LINKS SCRAPER
// ============================================
async function scrapeLinks(req, res) {
    try {
        const { url } = req.query;

        if (!url) {
            return res.status(400).json({
                error: 'URL parameter is required'
            });
        }

        const html = await fetchPage(url);
        const $ = cheerio.load(html);

        const links = $('a[href]').map((i, el) => {
            const href = $(el).attr('href');
            if (!href) return null;

            return {
                text: $(el).text().trim(),
                href: href.startsWith('http') ? href : new URL(href, url).href,
                title: $(el).attr('title') || '',
                target: $(el).attr('target') || '_self'
            };
        }).get().filter(link => link !== null);

        // Categorize links
        const internal = links.filter(link => link.href.includes(new URL(url).hostname));
        const external = links.filter(link => !link.href.includes(new URL(url).hostname));

        res.json({
            success: true,
            url: url,
            totalLinks: links.length,
            internal: internal.length,
            external: external.length,
            links: {
                all: links,
                internal: internal,
                external: external
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

// ============================================
// 5. CUSTOM SCRAPER
// ============================================
async function scrapeCustom(req, res) {
    try {
        const { url, selectors } = req.body;

        if (!url || !selectors) {
            return res.status(400).json({
                error: 'Both url and selectors are required',
                example: {
                    url: 'https://example.com',
                    selectors: {
                        title: 'h1.main-title',
                        price: '.product-price',
                        description: '.product-desc'
                    }
                }
            });
        }

        const html = await fetchPage(url);
        const $ = cheerio.load(html);

        const results = {};
        for (const [key, selector] of Object.entries(selectors)) {
            results[key] = $(selector).map((i, el) => $(el).text().trim()).get();
        }

        res.json({
            success: true,
            url: url,
            data: results
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

// ============================================
// EXPORTS
// ============================================

module.exports = {
    scrapeBasic,
    scrapeHeadlines,
    scrapeImages,
    scrapeLinks,
    scrapeCustom
};
