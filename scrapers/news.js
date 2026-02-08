// ============================================
// NEWS SCRAPER MODULE
// ============================================

const axios = require('axios');
const cheerio = require('cheerio');

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

async function fetchPage(url) {
    const response = await axios.get(url, {
        headers: { 'User-Agent': USER_AGENT },
        timeout: 10000
    });
    return response.data;
}

async function getArticles(req, res) {
    try {
        const { url } = req.query;
        if (!url) {
            return res.status(400).json({ error: 'URL parameter is required' });
        }

        const html = await fetchPage(url);
        const $ = cheerio.load(html);

        const articles = $('article, [class*="article"], [class*="story"]').map((i, el) => ({
            title: $(el).find('h1, h2, h3, [class*="title"]').first().text().trim(),
            summary: $(el).find('p, [class*="summary"], [class*="excerpt"]').first().text().trim(),
            author: $(el).find('[class*="author"], [rel="author"]').first().text().trim(),
            date: $(el).find('[class*="date"], time').first().text().trim(),
            link: $(el).find('a').first().attr('href'),
            image: $(el).find('img').first().attr('src')
        })).get().filter(article => article.title).slice(0, 20);

        res.json({ success: true, url, totalArticles: articles.length, articles });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

async function getHeadlines(req, res) {
    try {
        const { url } = req.query;
        if (!url) {
            return res.status(400).json({ error: 'URL parameter is required' });
        }

        const html = await fetchPage(url);
        const $ = cheerio.load(html);

        const headlines = $('h1, h2, h3').map((i, el) => $(el).text().trim()).get().filter(h => h.length > 10);

        res.json({ success: true, url, totalHeadlines: headlines.length, headlines });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

async function getByCategory(req, res) {
    try {
        const { url, category } = req.query;
        if (!url) {
            return res.status(400).json({ error: 'URL parameter is required' });
        }

        const html = await fetchPage(url);
        const $ = cheerio.load(html);

        const articles = $('article, [class*="article"]').map((i, el) => {
            const articleCategory = $(el).find('[class*="category"]').text().trim().toLowerCase();
            if (category && !articleCategory.includes(category.toLowerCase())) {
                return null;
            }
            return {
                title: $(el).find('h1, h2, h3').first().text().trim(),
                category: articleCategory,
                link: $(el).find('a').first().attr('href')
            };
        }).get().filter(article => article !== null);

        res.json({ success: true, url, category, totalArticles: articles.length, articles });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

async function searchNews(req, res) {
    try {
        const { url, keyword } = req.query;
        if (!url) {
            return res.status(400).json({ error: 'URL parameter is required' });
        }

        const html = await fetchPage(url);
        const $ = cheerio.load(html);

        const articles = $('article, [class*="article"]').map((i, el) => {
            const text = $(el).text().toLowerCase();
            if (keyword && !text.includes(keyword.toLowerCase())) {
                return null;
            }
            return {
                title: $(el).find('h1, h2, h3').first().text().trim(),
                summary: $(el).find('p').first().text().trim(),
                link: $(el).find('a').first().attr('href')
            };
        }).get().filter(article => article !== null);

        res.json({ success: true, url, keyword, totalArticles: articles.length, articles });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

module.exports = { getArticles, getHeadlines, getByCategory, searchNews };
