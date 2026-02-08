// ============================================
// ADVANCED JOB SEARCH SCRAPER MODULE
// ============================================
// Searches and scrapes jobs from multiple job boards

const axios = require('axios');
const cheerio = require('cheerio');

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

async function fetchPage(url) {
    try {
        const response = await axios.get(url, {
            headers: { 'User-Agent': USER_AGENT },
            timeout: 15000
        });
        return response.data;
    } catch (error) {
        throw new Error(`Failed to fetch ${url}: ${error.message}`);
    }
}

// ============================================
// MULTI-SITE JOB SEARCH
// ============================================
async function searchAllSites(req, res) {
    try {
        const { keyword, location } = req.query;

        if (!keyword) {
            return res.status(400).json({
                error: 'Keyword parameter is required',
                example: '/api/jobs/search-all?keyword=remote+developer&location=worldwide'
            });
        }

        // Construct search URLs for multiple job sites
        const searchUrls = {
            indeed: `https://www.indeed.com/jobs?q=${encodeURIComponent(keyword)}${location ? '&l=' + encodeURIComponent(location) : ''}`,
            linkedin: `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(keyword)}${location ? '&location=' + encodeURIComponent(location) : ''}`,
            glassdoor: `https://www.glassdoor.com/Job/jobs.htm?sc.keyword=${encodeURIComponent(keyword)}`,
            remoteOk: keyword.toLowerCase().includes('remote') ? `https://remoteok.com/remote-jobs` : null,
            weWorkRemotely: keyword.toLowerCase().includes('remote') ? `https://weworkremotely.com/remote-jobs/search?term=${encodeURIComponent(keyword)}` : null
        };

        const results = {
            keyword: keyword,
            location: location || 'Any',
            searchedSites: [],
            totalJobs: 0,
            jobs: []
        };

        // Scrape each site
        for (const [site, url] of Object.entries(searchUrls)) {
            if (!url) continue;

            try {
                results.searchedSites.push(site);
                const html = await fetchPage(url);
                const $ = cheerio.load(html);

                let siteJobs = [];

                // Site-specific selectors
                switch (site) {
                    case 'indeed':
                        siteJobs = scrapeIndeed($, url);
                        break;
                    case 'linkedin':
                        siteJobs = scrapeLinkedIn($, url);
                        break;
                    case 'glassdoor':
                        siteJobs = scrapeGlassdoor($, url);
                        break;
                    case 'remoteOk':
                        siteJobs = scrapeRemoteOk($, url);
                        break;
                    case 'weWorkRemotely':
                        siteJobs = scrapeWeWorkRemotely($, url);
                        break;
                }

                // Add source to each job
                siteJobs = siteJobs.map(job => ({ ...job, source: site }));
                results.jobs.push(...siteJobs);

            } catch (error) {
                console.error(`Error scraping ${site}:`, error.message);
            }
        }

        results.totalJobs = results.jobs.length;

        res.json({
            success: true,
            data: results,
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
// SITE-SPECIFIC SCRAPERS
// ============================================

function scrapeIndeed($, baseUrl) {
    const jobs = [];

    $('.job_seen_beacon, .jobsearch-SerpJobCard, [class*="job"]').each((i, el) => {
        if (i >= 20) return false; // Limit to 20 jobs per site

        const $el = $(el);
        const title = $el.find('h2, [class*="jobTitle"]').first().text().trim();
        const company = $el.find('[class*="companyName"]').first().text().trim();
        const location = $el.find('[class*="companyLocation"]').first().text().trim();
        const salary = $el.find('[class*="salary"]').first().text().trim();
        const description = $el.find('[class*="summary"]').first().text().trim();
        const link = $el.find('a').first().attr('href');

        if (title) {
            jobs.push({
                title,
                company: company || 'Not specified',
                location: location || 'Not specified',
                salary: salary || 'Not specified',
                description: description || 'No description',
                link: link ? (link.startsWith('http') ? link : `https://www.indeed.com${link}`) : baseUrl,
                type: detectJobType(title + ' ' + description)
            });
        }
    });

    return jobs;
}

function scrapeLinkedIn($, baseUrl) {
    const jobs = [];

    $('[class*="job"], [class*="result-card"]').each((i, el) => {
        if (i >= 20) return false;

        const $el = $(el);
        const title = $el.find('h3, [class*="job-title"]').first().text().trim();
        const company = $el.find('[class*="company"]').first().text().trim();
        const location = $el.find('[class*="location"]').first().text().trim();
        const link = $el.find('a').first().attr('href');

        if (title) {
            jobs.push({
                title,
                company: company || 'Not specified',
                location: location || 'Not specified',
                salary: 'Not specified',
                description: 'See LinkedIn for details',
                link: link ? (link.startsWith('http') ? link : `https://www.linkedin.com${link}`) : baseUrl,
                type: detectJobType(title + ' ' + location)
            });
        }
    });

    return jobs;
}

function scrapeGlassdoor($, baseUrl) {
    const jobs = [];

    $('[class*="JobCard"], [class*="job"]').each((i, el) => {
        if (i >= 20) return false;

        const $el = $(el);
        const title = $el.find('[class*="jobTitle"], h2').first().text().trim();
        const company = $el.find('[class*="employer"]').first().text().trim();
        const location = $el.find('[class*="location"]').first().text().trim();
        const salary = $el.find('[class*="salary"]').first().text().trim();

        if (title) {
            jobs.push({
                title,
                company: company || 'Not specified',
                location: location || 'Not specified',
                salary: salary || 'Not specified',
                description: 'See Glassdoor for details',
                link: baseUrl,
                type: detectJobType(title + ' ' + location)
            });
        }
    });

    return jobs;
}

function scrapeRemoteOk($, baseUrl) {
    const jobs = [];

    $('tr.job, [class*="job"]').each((i, el) => {
        if (i >= 20) return false;

        const $el = $(el);
        const title = $el.find('[class*="title"], h2').first().text().trim();
        const company = $el.find('[class*="company"]').first().text().trim();
        const tags = $el.find('[class*="tag"]').map((i, tag) => $(tag).text().trim()).get().join(', ');

        if (title) {
            jobs.push({
                title,
                company: company || 'Not specified',
                location: 'Remote',
                salary: 'Not specified',
                description: tags || 'Remote position',
                link: baseUrl,
                type: 'Remote'
            });
        }
    });

    return jobs;
}

function scrapeWeWorkRemotely($, baseUrl) {
    const jobs = [];

    $('[class*="job"], li.feature').each((i, el) => {
        if (i >= 20) return false;

        const $el = $(el);
        const title = $el.find('[class*="title"], h2').first().text().trim();
        const company = $el.find('[class*="company"]').first().text().trim();
        const category = $el.find('[class*="category"]').first().text().trim();

        if (title) {
            jobs.push({
                title,
                company: company || 'Not specified',
                location: 'Remote',
                salary: 'Not specified',
                description: category || 'Remote position',
                link: baseUrl,
                type: 'Remote'
            });
        }
    });

    return jobs;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function detectJobType(text) {
    const lowerText = text.toLowerCase();

    if (lowerText.includes('remote') || lowerText.includes('work from home')) {
        return 'Remote';
    } else if (lowerText.includes('hybrid')) {
        return 'Hybrid';
    } else if (lowerText.includes('on-site') || lowerText.includes('onsite')) {
        return 'On-site';
    } else {
        return 'Not specified';
    }
}

// ============================================
// FILTER JOBS BY CRITERIA
// ============================================
async function filterJobs(req, res) {
    try {
        const { keyword, type, minSalary, location } = req.query;

        if (!keyword) {
            return res.status(400).json({
                error: 'Keyword parameter is required',
                example: '/api/jobs/filter?keyword=developer&type=remote'
            });
        }

        // First, get all jobs
        const searchResults = await searchAllSites({ query: { keyword, location } }, { json: () => { } });

        // Filter based on criteria
        let filteredJobs = searchResults.data.jobs;

        if (type) {
            filteredJobs = filteredJobs.filter(job =>
                job.type.toLowerCase().includes(type.toLowerCase())
            );
        }

        if (minSalary) {
            filteredJobs = filteredJobs.filter(job => {
                const salaryMatch = job.salary.match(/\$?([\d,]+)/);
                if (salaryMatch) {
                    const salary = parseInt(salaryMatch[1].replace(/,/g, ''));
                    return salary >= parseInt(minSalary);
                }
                return false;
            });
        }

        res.json({
            success: true,
            filters: { keyword, type, minSalary, location },
            totalJobs: filteredJobs.length,
            jobs: filteredJobs
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

// ============================================
// GET REMOTE JOBS SPECIFICALLY
// ============================================
async function getRemoteJobs(req, res) {
    try {
        const { keyword } = req.query;

        if (!keyword) {
            return res.status(400).json({
                error: 'Keyword parameter is required',
                example: '/api/jobs/remote?keyword=developer'
            });
        }

        // Search with "remote" added to keyword
        const remoteKeyword = `remote ${keyword}`;

        const results = {
            keyword: keyword,
            searchType: 'Remote Only',
            jobs: []
        };

        // Scrape remote-specific sites
        const remoteUrls = {
            remoteOk: `https://remoteok.com/remote-jobs`,
            weWorkRemotely: `https://weworkremotely.com/remote-jobs/search?term=${encodeURIComponent(keyword)}`,
            indeed: `https://www.indeed.com/jobs?q=remote+${encodeURIComponent(keyword)}`,
            linkedin: `https://www.linkedin.com/jobs/search/?keywords=remote+${encodeURIComponent(keyword)}&f_WT=2`
        };

        for (const [site, url] of Object.entries(remoteUrls)) {
            try {
                const html = await fetchPage(url);
                const $ = cheerio.load(html);

                let siteJobs = [];
                switch (site) {
                    case 'remoteOk':
                        siteJobs = scrapeRemoteOk($, url);
                        break;
                    case 'weWorkRemotely':
                        siteJobs = scrapeWeWorkRemotely($, url);
                        break;
                    case 'indeed':
                        siteJobs = scrapeIndeed($, url);
                        break;
                    case 'linkedin':
                        siteJobs = scrapeLinkedIn($, url);
                        break;
                }

                siteJobs = siteJobs.map(job => ({ ...job, source: site }));
                results.jobs.push(...siteJobs);

            } catch (error) {
                console.error(`Error scraping ${site}:`, error.message);
            }
        }

        // Filter to only remote jobs
        results.jobs = results.jobs.filter(job =>
            job.type === 'Remote' ||
            job.location.toLowerCase().includes('remote') ||
            job.title.toLowerCase().includes('remote')
        );

        results.totalJobs = results.jobs.length;

        res.json({
            success: true,
            data: results,
            scrapedAt: new Date().toISOString()
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

module.exports = {
    searchAllSites,
    filterJobs,
    getRemoteJobs
};
