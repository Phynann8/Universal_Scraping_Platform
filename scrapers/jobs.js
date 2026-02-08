// ============================================
// JOBS SCRAPER MODULE
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

async function getListings(req, res) {
    try {
        const { url } = req.query;
        if (!url) {
            return res.status(400).json({ error: 'URL parameter is required' });
        }

        const html = await fetchPage(url);
        const $ = cheerio.load(html);

        const jobs = $('[class*="job"], [class*="listing"]').map((i, el) => ({
            title: $(el).find('h1, h2, h3, [class*="title"]').first().text().trim(),
            company: $(el).find('[class*="company"]').first().text().trim(),
            location: $(el).find('[class*="location"]').first().text().trim(),
            salary: $(el).find('[class*="salary"], [class*="compensation"]').first().text().trim(),
            type: $(el).find('[class*="type"]').first().text().trim(),
            posted: $(el).find('[class*="date"], time').first().text().trim(),
            link: $(el).find('a').first().attr('href')
        })).get().filter(job => job.title).slice(0, 20);

        res.json({ success: true, url, totalJobs: jobs.length, jobs });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

async function getDetails(req, res) {
    try {
        const { url } = req.query;
        if (!url) {
            return res.status(400).json({ error: 'URL parameter is required' });
        }

        const html = await fetchPage(url);
        const $ = cheerio.load(html);

        const job = {
            title: $('h1').first().text().trim(),
            company: $('[class*="company"]').first().text().trim(),
            location: $('[class*="location"]').first().text().trim(),
            salary: $('[class*="salary"]').first().text().trim(),
            description: $('[class*="description"]').first().text().trim(),
            requirements: $('[class*="requirement"]').map((i, el) => $(el).text().trim()).get(),
            benefits: $('[class*="benefit"]').map((i, el) => $(el).text().trim()).get(),
            posted: $('[class*="date"], time').first().text().trim()
        };

        res.json({ success: true, url, job });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

async function searchJobs(req, res) {
    try {
        const { url, keyword } = req.query;
        if (!url) {
            return res.status(400).json({ error: 'URL parameter is required' });
        }

        const html = await fetchPage(url);
        const $ = cheerio.load(html);

        const jobs = $('[class*="job"]').map((i, el) => {
            const text = $(el).text().toLowerCase();
            if (keyword && !text.includes(keyword.toLowerCase())) {
                return null;
            }
            return {
                title: $(el).find('h1, h2, h3').first().text().trim(),
                company: $(el).find('[class*="company"]').first().text().trim(),
                location: $(el).find('[class*="location"]').first().text().trim(),
                link: $(el).find('a').first().attr('href')
            };
        }).get().filter(job => job !== null);

        res.json({ success: true, url, keyword, totalJobs: jobs.length, jobs });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

async function getCompanyJobs(req, res) {
    try {
        const { url, company } = req.query;
        if (!url) {
            return res.status(400).json({ error: 'URL parameter is required' });
        }

        const html = await fetchPage(url);
        const $ = cheerio.load(html);

        const jobs = $('[class*="job"]').map((i, el) => {
            const companyName = $(el).find('[class*="company"]').text().trim().toLowerCase();
            if (company && !companyName.includes(company.toLowerCase())) {
                return null;
            }
            return {
                title: $(el).find('h1, h2, h3').first().text().trim(),
                company: companyName,
                location: $(el).find('[class*="location"]').first().text().trim(),
                link: $(el).find('a').first().attr('href')
            };
        }).get().filter(job => job !== null);

        res.json({ success: true, url, company, totalJobs: jobs.length, jobs });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

module.exports = { getListings, getDetails, searchJobs, getCompanyJobs };
