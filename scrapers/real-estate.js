// Real Estate Scraper Module
const axios = require('axios');
const cheerio = require('cheerio');
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

async function fetchPage(url) {
    const response = await axios.get(url, { headers: { 'User-Agent': USER_AGENT }, timeout: 10000 });
    return response.data;
}

async function getListings(req, res) {
    try {
        const { url } = req.query;
        if (!url) return res.status(400).json({ error: 'URL required' });

        const html = await fetchPage(url);
        const $ = cheerio.load(html);

        const listings = $('[class*="property"], [class*="listing"]').map((i, el) => ({
            address: $(el).find('[class*="address"]').first().text().trim(),
            price: $(el).find('[class*="price"]').first().text().trim(),
            beds: $(el).find('[class*="bed"]').first().text().trim(),
            baths: $(el).find('[class*="bath"]').first().text().trim(),
            sqft: $(el).find('[class*="sqft"], [class*="area"]').first().text().trim(),
            image: $(el).find('img').first().attr('src'),
            link: $(el).find('a').first().attr('href')
        })).get().filter(l => l.address).slice(0, 20);

        res.json({ success: true, url, totalListings: listings.length, listings });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

async function getDetails(req, res) {
    try {
        const { url } = req.query;
        if (!url) return res.status(400).json({ error: 'URL required' });

        const html = await fetchPage(url);
        const $ = cheerio.load(html);

        const property = {
            address: $('h1, [class*="address"]').first().text().trim(),
            price: $('[class*="price"]').first().text().trim(),
            beds: $('[class*="bed"]').first().text().trim(),
            baths: $('[class*="bath"]').first().text().trim(),
            sqft: $('[class*="sqft"]').first().text().trim(),
            description: $('[class*="description"]').first().text().trim(),
            features: $('[class*="feature"]').map((i, el) => $(el).text().trim()).get(),
            images: $('img').map((i, el) => $(el).attr('src')).get().slice(0, 10)
        };

        res.json({ success: true, url, property });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

async function searchProperties(req, res) {
    try {
        const { url } = req.query;
        if (!url) return res.status(400).json({ error: 'URL required' });

        const html = await fetchPage(url);
        const $ = cheerio.load(html);

        const properties = $('[class*="property"]').map((i, el) => ({
            address: $(el).find('[class*="address"]').first().text().trim(),
            price: $(el).find('[class*="price"]').first().text().trim(),
            link: $(el).find('a').first().attr('href')
        })).get().filter(p => p.address);

        res.json({ success: true, url, totalProperties: properties.length, properties });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

async function getPriceTrends(req, res) {
    try {
        const { url } = req.query;
        if (!url) return res.status(400).json({ error: 'URL required' });

        const html = await fetchPage(url);
        const $ = cheerio.load(html);

        const prices = $('[class*="price"]').map((i, el) => $(el).text().trim()).get();

        res.json({ success: true, url, totalPrices: prices.length, prices });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

module.exports = { getListings, getDetails, searchProperties, getPriceTrends };
