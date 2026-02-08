// ============================================
// E-COMMERCE SCRAPER MODULE
// ============================================
// Handles scraping for e-commerce websites (Amazon, eBay, Shopify, etc.)

const axios = require('axios');
const cheerio = require('cheerio');

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

async function fetchPage(url) {
    const response = await axios.get(url, {
        headers: { 'User-Agent': USER_AGENT },
        timeout: 10000
    });
    return response.data;
}

// ============================================
// 1. GET PRODUCT DETAILS
// ============================================
async function getProduct(req, res) {
    try {
        const { url } = req.query;

        if (!url) {
            return res.status(400).json({
                error: 'URL parameter is required',
                example: '/api/ecommerce/product?url=https://amazon.com/product-page'
            });
        }

        const html = await fetchPage(url);
        const $ = cheerio.load(html);

        // Common selectors for various e-commerce platforms
        const product = {
            title: $('h1').first().text().trim() ||
                $('[class*="product-title"]').first().text().trim() ||
                $('[class*="ProductTitle"]').first().text().trim() ||
                'Title not found',

            price: $('[class*="price"]').first().text().trim() ||
                $('[class*="Price"]').first().text().trim() ||
                $('[id*="price"]').first().text().trim() ||
                'Price not found',

            description: $('[class*="description"]').first().text().trim() ||
                $('[class*="Description"]').first().text().trim() ||
                $('meta[name="description"]').attr('content') ||
                'Description not found',

            images: $('img').map((i, el) => $(el).attr('src')).get().filter(src => src && src.includes('product')).slice(0, 5),

            rating: $('[class*="rating"]').first().text().trim() ||
                $('[class*="Rating"]').first().text().trim() ||
                'Rating not found',

            availability: $('[class*="stock"]').first().text().trim() ||
                $('[class*="availability"]').first().text().trim() ||
                'Availability not found',

            brand: $('[class*="brand"]').first().text().trim() ||
                $('[class*="Brand"]').first().text().trim() ||
                'Brand not found'
        };

        res.json({
            success: true,
            url: url,
            product: product,
            scrapedAt: new Date().toISOString()
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

// ============================================
// 2. GET PRICES
// ============================================
async function getPrices(req, res) {
    try {
        const { url } = req.query;

        if (!url) {
            return res.status(400).json({
                error: 'URL parameter is required'
            });
        }

        const html = await fetchPage(url);
        const $ = cheerio.load(html);

        // Find all price-related elements
        const priceSelectors = [
            '[class*="price"]',
            '[class*="Price"]',
            '[id*="price"]',
            '[data-price]'
        ];

        let prices = [];
        priceSelectors.forEach(selector => {
            $(selector).each((i, el) => {
                const text = $(el).text().trim();
                // Match various currency formats
                const priceMatch = text.match(/[$€£¥฿₹]\s*[\d,]+\.?\d*/g) ||
                    text.match(/[\d,]+\.?\d*\s*[$€£¥฿₹]/g);

                if (priceMatch) {
                    prices.push({
                        text: text,
                        price: priceMatch[0],
                        selector: selector,
                        element: $(el).prop('tagName')
                    });
                }
            });
        });

        // Remove duplicates
        prices = prices.filter((price, index, self) =>
            index === self.findIndex((p) => p.price === price.price)
        );

        res.json({
            success: true,
            url: url,
            pricesFound: prices.length,
            prices: prices
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

// ============================================
// 3. GET REVIEWS
// ============================================
async function getReviews(req, res) {
    try {
        const { url } = req.query;

        if (!url) {
            return res.status(400).json({
                error: 'URL parameter is required'
            });
        }

        const html = await fetchPage(url);
        const $ = cheerio.load(html);

        // Common review selectors
        const reviews = $('[class*="review"]').map((i, el) => {
            return {
                author: $(el).find('[class*="author"], [class*="name"]').first().text().trim(),
                rating: $(el).find('[class*="rating"], [class*="star"]').first().text().trim(),
                title: $(el).find('[class*="title"]').first().text().trim(),
                text: $(el).find('[class*="text"], [class*="content"]').first().text().trim(),
                date: $(el).find('[class*="date"]').first().text().trim()
            };
        }).get().filter(review => review.text).slice(0, 10);

        res.json({
            success: true,
            url: url,
            totalReviews: reviews.length,
            reviews: reviews
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

// ============================================
// 4. SEARCH PRODUCTS
// ============================================
async function searchProducts(req, res) {
    try {
        const { url } = req.query;

        if (!url) {
            return res.status(400).json({
                error: 'URL parameter is required (search results page)',
                example: '/api/ecommerce/search?url=https://amazon.com/s?k=laptop'
            });
        }

        const html = await fetchPage(url);
        const $ = cheerio.load(html);

        // Find product listings
        const products = $('[class*="product"], [data-component-type="s-search-result"]').map((i, el) => {
            return {
                title: $(el).find('h2, [class*="title"]').first().text().trim(),
                price: $(el).find('[class*="price"]').first().text().trim(),
                rating: $(el).find('[class*="rating"]').first().text().trim(),
                link: $(el).find('a').first().attr('href'),
                image: $(el).find('img').first().attr('src')
            };
        }).get().filter(product => product.title).slice(0, 20);

        res.json({
            success: true,
            url: url,
            totalProducts: products.length,
            products: products
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

module.exports = {
    getProduct,
    getPrices,
    getReviews,
    searchProducts
};
