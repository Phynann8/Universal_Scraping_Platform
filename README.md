# 🚀 Universal Scraping API Platform

A comprehensive, production-ready web scraping API platform with **37 specialized endpoints** across **9 categories**.

## 📋 Overview

This platform provides a unified API for scraping various types of websites including e-commerce, social media, news, jobs, real estate, videos, and more. Built with Node.js, Express, Cheerio, and Puppeteer.

## ✨ Features

- ✅ **37 API Endpoints** across 9 categories
- ✅ **Rate Limiting** - 100 requests per 15 minutes
- ✅ **Security** - Helmet.js for HTTP headers
- ✅ **CORS Enabled** - Use from any frontend
- ✅ **Error Handling** - Comprehensive error responses
- ✅ **Logging** - Morgan for request logging
- ✅ **Modular Architecture** - Easy to extend
- ✅ **Documentation** - Built-in API docs

## 📦 Installation

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your configuration.

### 3. Start the Server

```bash
npm start
```

Or for development with auto-restart:

```bash
npm run dev
```

The API will be running at: **http://localhost:4000**

## 🎯 API Categories & Endpoints

### 1. General Scraping (5 endpoints)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/general/scrape` | GET | Scrape basic info (title, headings, content) |
| `/api/general/headlines` | GET | Extract all headlines (H1-H4) |
| `/api/general/images` | GET | Get all images with attributes |
| `/api/general/links` | GET | Extract all links (internal/external) |
| `/api/general/custom` | POST | Use custom CSS selectors |

### 2. E-commerce (4 endpoints)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/ecommerce/product` | GET | Get product details |
| `/api/ecommerce/prices` | GET | Extract all prices |
| `/api/ecommerce/reviews` | GET | Get product reviews |
| `/api/ecommerce/search` | GET | Search products |

### 3. Social Media (4 endpoints)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/social/profile` | GET | Get profile information |
| `/api/social/posts` | GET | Extract posts/tweets |
| `/api/social/hashtags` | GET | Get hashtags |
| `/api/social/followers` | GET | Get follower count |

### 4. News (4 endpoints)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/news/articles` | GET | Get latest articles |
| `/api/news/headlines` | GET | Extract headlines |
| `/api/news/category` | GET | Get news by category |
| `/api/news/search` | GET | Search news articles |

### 5. Jobs (4 endpoints)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/jobs/listings` | GET | Get job listings |
| `/api/jobs/details` | GET | Get job details |
| `/api/jobs/search` | GET | Search jobs by keyword |
| `/api/jobs/company` | GET | Get company jobs |

### 6. Real Estate (4 endpoints)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/realestate/listings` | GET | Get property listings |
| `/api/realestate/details` | GET | Get property details |
| `/api/realestate/search` | GET | Search properties |
| `/api/realestate/prices` | GET | Get price trends |

### 7. Video (4 endpoints)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/video/metadata` | GET | Get video metadata |
| `/api/video/transcript` | GET | Get video transcript |
| `/api/video/comments` | GET | Get video comments |
| `/api/video/search` | GET | Search videos |

### 8. SEO Tools (4 endpoints)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/seo/analyze` | GET | Analyze page SEO |
| `/api/seo/keywords` | GET | Extract keywords |
| `/api/seo/backlinks` | GET | Get backlinks |
| `/api/seo/meta` | GET | Get meta tags |

### 9. Lead Generation (4 endpoints)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/leads/emails` | GET | Extract email addresses |
| `/api/leads/contacts` | GET | Get contact information |
| `/api/leads/companies` | GET | Get company data |
| `/api/leads/social` | GET | Get social media links |

## 📖 Usage Examples

### Basic Scraping

```bash
curl "http://localhost:4000/api/general/scrape?url=https://example.com"
```

### E-commerce Product

```bash
curl "http://localhost:4000/api/ecommerce/product?url=https://amazon.com/product-page"
```

### Extract Emails

```bash
curl "http://localhost:4000/api/leads/emails?url=https://company-website.com"
```

### SEO Analysis

```bash
curl "http://localhost:4000/api/seo/analyze?url=https://your-website.com"
```

### Custom Selectors (POST)

```bash
curl -X POST http://localhost:4000/api/general/custom \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "selectors": {
      "title": "h1.main-title",
      "price": ".product-price"
    }
  }'
```

## 🔧 Configuration

### Environment Variables

```env
PORT=4000
NODE_ENV=development
API_KEY=your-secret-api-key
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Rate Limiting

Default: 100 requests per 15 minutes per IP. Adjust in `.env`:

```env
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100
```

## 📁 Project Structure

```
Universal_Scraping_Platform/
├── server.js                 # Main server file
├── package.json              # Dependencies
├── .env.example              # Environment template
├── README.md                 # This file
├── scrapers/                 # Scraper modules
│   ├── general.js            # General scraping
│   ├── ecommerce.js          # E-commerce
│   ├── social-media.js       # Social media
│   ├── news.js               # News
│   ├── jobs.js               # Jobs
│   ├── real-estate.js        # Real estate
│   ├── video.js              # Video
│   ├── seo.js                # SEO tools
│   └── lead-generation.js    # Lead generation
└── public/                   # Static files (dashboard)
```

## 🛡️ Security Features

- **Helmet.js** - Secure HTTP headers
- **CORS** - Cross-Origin Resource Sharing
- **Rate Limiting** - Prevent abuse
- **Input Validation** - URL validation
- **Error Handling** - No sensitive data leaks

## ⚠️ Legal & Ethical Considerations

- ✅ Always check `robots.txt`
- ✅ Respect Terms of Service
- ✅ Add delays between requests
- ✅ Don't overload servers
- ✅ Use for legal purposes only

## 🚀 Deployment

### Deploy to Heroku

```bash
heroku create your-app-name
git push heroku main
```

### Deploy to Vercel

```bash
vercel deploy
```

### Deploy to AWS/DigitalOcean

Use PM2 for process management:

```bash
npm install -g pm2
pm2 start server.js --name scraping-api
pm2 save
pm2 startup
```

## 🔄 Extending the Platform

### Add a New Scraper

1. Create a new file in `scrapers/` folder
2. Export your scraper functions
3. Import in `server.js`
4. Add routes in `server.js`

Example:

```javascript
// scrapers/my-scraper.js
async function myFunction(req, res) {
  // Your scraping logic
}
module.exports = { myFunction };
```

## 📊 Response Format

All endpoints return JSON in this format:

```json
{
  "success": true,
  "url": "https://example.com",
  "data": {
    // Scraped data here
  },
  "scrapedAt": "2026-01-19T16:24:00.000Z"
}
```

Error response:

```json
{
  "success": false,
  "error": "Error message here"
}
```

## 🧪 Testing

```bash
npm test
```

## 📚 Documentation

- **API Docs:** http://localhost:4000/api/docs
- **Dashboard:** http://localhost:4000/dashboard

## 🤝 Contributing

Feel free to add more scrapers or improve existing ones!

## 📄 License

MIT License - Free to use for personal and commercial projects.

## 🆘 Troubleshooting

### Port Already in Use

```bash
# Change PORT in .env
PORT=5000
```

### CORS Errors

Make sure CORS is enabled in `server.js`:

```javascript
app.use(cors());
```

### Scraping Fails

Some websites block scrapers. Try:
1. Adding realistic headers
2. Using proxies
3. Adding delays

## 📞 Support

For issues or questions, check the documentation at `/api/docs`

---

**Built with ❤️ using Node.js, Express, Cheerio, and Puppeteer**

*Version 1.0.0*
