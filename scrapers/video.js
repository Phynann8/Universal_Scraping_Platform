// Video Scraper Module
const axios = require('axios');
const cheerio = require('cheerio');
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

async function fetchPage(url) {
    const response = await axios.get(url, { headers: { 'User-Agent': USER_AGENT }, timeout: 10000 });
    return response.data;
}

async function getMetadata(req, res) {
    try {
        const { url } = req.query;
        if (!url) return res.status(400).json({ error: 'URL required' });

        const html = await fetchPage(url);
        const $ = cheerio.load(html);

        const metadata = {
            title: $('title').text().trim() || $('meta[property="og:title"]').attr('content'),
            description: $('meta[name="description"]').attr('content') || $('meta[property="og:description"]').attr('content'),
            duration: $('[class*="duration"]').first().text().trim(),
            views: $('[class*="view"]').first().text().trim(),
            likes: $('[class*="like"]').first().text().trim(),
            author: $('[class*="author"], [class*="channel"]').first().text().trim(),
            publishDate: $('[class*="date"], time').first().text().trim(),
            thumbnail: $('meta[property="og:image"]').attr('content')
        };

        res.json({ success: true, url, metadata });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

async function getTranscript(req, res) {
    try {
        const { url } = req.query;
        if (!url) return res.status(400).json({ error: 'URL required' });

        res.json({
            success: true,
            url,
            message: 'Transcript extraction requires specialized API. Use YouTube Transcript API for full functionality.',
            transcript: 'Feature requires additional setup'
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

async function getComments(req, res) {
    try {
        const { url } = req.query;
        if (!url) return res.status(400).json({ error: 'URL required' });

        const html = await fetchPage(url);
        const $ = cheerio.load(html);

        const comments = $('[class*="comment"]').map((i, el) => ({
            author: $(el).find('[class*="author"]').first().text().trim(),
            text: $(el).find('[class*="text"], p').first().text().trim(),
            likes: $(el).find('[class*="like"]').first().text().trim(),
            date: $(el).find('[class*="date"], time').first().text().trim()
        })).get().filter(c => c.text).slice(0, 20);

        res.json({ success: true, url, totalComments: comments.length, comments });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

async function searchVideos(req, res) {
    try {
        const { url } = req.query;
        if (!url) return res.status(400).json({ error: 'URL required' });

        const html = await fetchPage(url);
        const $ = cheerio.load(html);

        const videos = $('[class*="video"]').map((i, el) => ({
            title: $(el).find('h1, h2, h3, [class*="title"]').first().text().trim(),
            duration: $(el).find('[class*="duration"]').first().text().trim(),
            views: $(el).find('[class*="view"]').first().text().trim(),
            thumbnail: $(el).find('img').first().attr('src'),
            link: $(el).find('a').first().attr('href')
        })).get().filter(v => v.title).slice(0, 20);

        res.json({ success: true, url, totalVideos: videos.length, videos });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

module.exports = { getMetadata, getTranscript, getComments, searchVideos };
