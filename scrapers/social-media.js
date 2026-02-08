// ============================================
// SOCIAL MEDIA SCRAPER MODULE
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

async function getProfile(req, res) {
    try {
        const { url } = req.query;
        if (!url) {
            return res.status(400).json({ error: 'URL parameter is required' });
        }

        const html = await fetchPage(url);
        const $ = cheerio.load(html);

        const profile = {
            name: $('h1, [class*="name"], [class*="Name"]').first().text().trim(),
            bio: $('[class*="bio"], [class*="description"]').first().text().trim(),
            followers: $('[class*="follower"]').first().text().trim(),
            following: $('[class*="following"]').first().text().trim(),
            posts: $('[class*="post-count"]').first().text().trim(),
            avatar: $('img[class*="avatar"], img[class*="profile"]').first().attr('src')
        };

        res.json({ success: true, url, profile });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

async function getPosts(req, res) {
    try {
        const { url } = req.query;
        if (!url) {
            return res.status(400).json({ error: 'URL parameter is required' });
        }

        const html = await fetchPage(url);
        const $ = cheerio.load(html);

        const posts = $('[class*="post"], article').map((i, el) => ({
            text: $(el).find('[class*="text"], [class*="content"], p').first().text().trim(),
            likes: $(el).find('[class*="like"]').first().text().trim(),
            comments: $(el).find('[class*="comment"]').first().text().trim(),
            date: $(el).find('[class*="date"], time').first().text().trim()
        })).get().filter(post => post.text).slice(0, 20);

        res.json({ success: true, url, totalPosts: posts.length, posts });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

async function getHashtags(req, res) {
    try {
        const { url } = req.query;
        if (!url) {
            return res.status(400).json({ error: 'URL parameter is required' });
        }

        const html = await fetchPage(url);
        const $ = cheerio.load(html);

        const text = $('body').text();
        const hashtags = text.match(/#[\w]+/g) || [];
        const uniqueHashtags = [...new Set(hashtags)];

        res.json({ success: true, url, totalHashtags: uniqueHashtags.length, hashtags: uniqueHashtags });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

async function getFollowers(req, res) {
    try {
        const { url } = req.query;
        if (!url) {
            return res.status(400).json({ error: 'URL parameter is required' });
        }

        const html = await fetchPage(url);
        const $ = cheerio.load(html);

        const followerCount = $('[class*="follower"]').first().text().trim();
        const followingCount = $('[class*="following"]').first().text().trim();

        res.json({ success: true, url, followers: followerCount, following: followingCount });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

module.exports = { getProfile, getPosts, getHashtags, getFollowers };
