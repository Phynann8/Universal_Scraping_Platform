// Lead Generation Scraper Module
const axios = require('axios');
const cheerio = require('cheerio');
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

async function fetchPage(url) {
    const response = await axios.get(url, { headers: { 'User-Agent': USER_AGENT }, timeout: 10000 });
    return response.data;
}

async function extractEmails(req, res) {
    try {
        const { url } = req.query;
        if (!url) return res.status(400).json({ error: 'URL required' });

        const html = await fetchPage(url);
        const $ = cheerio.load(html);

        const text = $('body').text();
        const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
        const emails = text.match(emailRegex) || [];
        const uniqueEmails = [...new Set(emails)];

        res.json({ success: true, url, totalEmails: uniqueEmails.length, emails: uniqueEmails });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

async function getContacts(req, res) {
    try {
        const { url } = req.query;
        if (!url) return res.status(400).json({ error: 'URL required' });

        const html = await fetchPage(url);
        const $ = cheerio.load(html);

        const text = $('body').text();
        const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
        const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;

        const emails = [...new Set(text.match(emailRegex) || [])];
        const phones = [...new Set(text.match(phoneRegex) || [])];

        const contacts = {
            emails: emails,
            phones: phones,
            address: $('[class*="address"]').first().text().trim(),
            contactPage: $('a[href*="contact"]').first().attr('href')
        };

        res.json({ success: true, url, contacts });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

async function getCompanyData(req, res) {
    try {
        const { url } = req.query;
        if (!url) return res.status(400).json({ error: 'URL required' });

        const html = await fetchPage(url);
        const $ = cheerio.load(html);

        const company = {
            name: $('h1, [class*="company-name"]').first().text().trim() || $('title').text().split('|')[0].trim(),
            description: $('meta[name="description"]').attr('content') || $('[class*="about"]').first().text().trim(),
            industry: $('[class*="industry"]').first().text().trim(),
            location: $('[class*="location"], [class*="address"]').first().text().trim(),
            employees: $('[class*="employee"]').first().text().trim(),
            founded: $('[class*="founded"]').first().text().trim(),
            website: url,
            logo: $('img[class*="logo"]').first().attr('src') || $('meta[property="og:image"]').attr('content')
        };

        res.json({ success: true, url, company });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

async function getSocialLinks(req, res) {
    try {
        const { url } = req.query;
        if (!url) return res.status(400).json({ error: 'URL required' });

        const html = await fetchPage(url);
        const $ = cheerio.load(html);

        const socialPlatforms = {
            facebook: $('a[href*="facebook.com"]').first().attr('href'),
            twitter: $('a[href*="twitter.com"], a[href*="x.com"]').first().attr('href'),
            linkedin: $('a[href*="linkedin.com"]').first().attr('href'),
            instagram: $('a[href*="instagram.com"]').first().attr('href'),
            youtube: $('a[href*="youtube.com"]').first().attr('href'),
            github: $('a[href*="github.com"]').first().attr('href'),
            tiktok: $('a[href*="tiktok.com"]').first().attr('href')
        };

        // Filter out undefined values
        const social = Object.fromEntries(
            Object.entries(socialPlatforms).filter(([_, v]) => v)
        );

        res.json({ success: true, url, totalPlatforms: Object.keys(social).length, social });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

module.exports = { extractEmails, getContacts, getCompanyData, getSocialLinks };
