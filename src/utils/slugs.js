/**
 * Centralized Slug Management & Registry for Compassionate Love of Calvary Ministries
 * 
 * Provides:
 * - Constant identifiers for all site pages and official blog articles
 * - Strict SEO URL formatters with trailing slash canonicals
 * - Slug generators (slugify) and normalizers
 * - Legacy alias resolution & redirect mapping
 * - Metadata getters for sitemaps, canonical tags, and schema generation
 */

import { OFFICIAL_BLOG_POSTS } from './staticBlogData';

export const SITE_DOMAIN = 'https://www.loveofcalvary.org';

/**
 * Standard Site Page Slugs
 */
export const PAGE_SLUGS = {
  HOME: '',
  ABOUT: 'about',
  MINISTRIES: 'ministries',
  BIBLE: 'bible',
  STUDY: 'study',
  DEVOTIONAL: 'devotional',
  SERMONS: 'sermons',
  EVENTS: 'events',
  BLOG: 'blog',
  MEDIA: 'media',
  CONTACT: 'contact',
  ROBOTS: 'robots.html',
  SITEMAP: 'sitemap.html',
};

/**
 * Official Ministry Blog Slugs
 */
export const BLOG_SLUGS = {
  DAVIDRAJ_CHRISTIAN_WORSHIP_SONG: 'davidraj-christian-worship-song',
  DAVIDRAJ_PRAYER: 'davidraj-prayer-growing-in-faith-through-prayer',
  BIBLE_PRAYER_GATHERING: 'bible-prayer-gathering-for-spiritual-growth-and-faith',
  BIBLE_READING_FOR_TODAY: 'bible-reading-for-today-spiritual-growth-and-faith',
  BEST_BIBLE_QUOTES: 'best-bible-quotes-for-daily-faith-and-inspiration',
  BIBLE_VERSES_OF_THE_DAY: 'bible-verses-of-the-day',
  LOVE_OF_CALVARY_BIBLE_VERSES: 'love-of-calvary-bible-verses',
  CHRISTIAN_SERMONS_CHENGALPATTU: 'christian-sermons-in-chengalpattu',
  CHURCH_IN_CHENGALPATTU: 'church-in-chengalpattu',
  CHENGALPATTU_CHURCH_MINISTRY_UPDATES: 'chengalpattu-church-ministry-updates',
  LOVE_OF_CALVARY_CHENGALPATTU: 'love-of-calvary-in-chengalpattu',
  CALVARY_IN_CHENGALPATTU_GOSPEL: 'calvary-in-chengalpattu-gospel-devotionals-for-faith-and-spiritual-growth',
  DAILY_GOSPEL_DEVOTIONAL: 'daily-gospel-devotional-for-faith-best-bible-and-compassion',
  CHRISTIAN_GOSPEL_OUTREACH: 'christian-gospel-outreach-for-faith-hope-and-community-service',
  CHRISTIAN_BIBLE_LESSONS: 'christian-bible-lessons-for-faith-wisdom-and-justice',
  CALVARY_MINISTRIES_BIBLE: 'compassionate-love-of-calvary-ministries-bible',
  CALVARY_MINISTRIES_FAITH_HOPE: 'compassionate-love-of-calvary-ministries-faith-hope',
  CHRISTIAN_SPIRITUAL_GROWTH: 'christian-spiritual-growth-faith-bible',
  DAILY_BIBLE_STUDY: 'daily-bible-study-spiritual-growth',
  GROWING_IN_FAITH_AND_PRAYER: 'growing-in-faith-and-prayer-through-gods-word',
  BIBLE_TEACHING_FOR_STRONGER_FAITH: 'bible-teaching-for-stronger-faith-and-everyday-life',
};

/**
 * Array of all active blog slugs in chronological/priority order
 */
export const ALL_BLOG_SLUGS = Object.values(BLOG_SLUGS);

/**
 * Array of all core page slugs
 */
export const ALL_PAGE_SLUGS = Object.values(PAGE_SLUGS).filter(Boolean);

/**
 * Legacy slug redirect and alias mappings
 */
export const SLUG_ALIASES = {
  'faith-in-god-compassionate-love-calvary-ministries': BLOG_SLUGS.CALVARY_MINISTRIES_FAITH_HOPE,
  'understanding-grace-the-heart-of-calvary': BLOG_SLUGS.DAILY_BIBLE_STUDY,
  'the-power-of-intercessory-prayer': BLOG_SLUGS.GROWING_IN_FAITH_AND_PRAYER,
  'walking-in-unshakable-faith-in-challenging-times': BLOG_SLUGS.BIBLE_TEACHING_FOR_STRONGER_FAITH,
};

/**
 * Converts any arbitrary string, title, or phrase into a clean SEO-friendly slug.
 * Example: "Love of Calvary Bible Verses!" -> "love-of-calvary-bible-verses"
 * 
 * @param {string} text - Raw string to slugify
 * @returns {string} Clean hyphen-delimited slug
 */
export const slugify = (text = '') => {
  if (!text || typeof text !== 'string') return '';
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // remove special characters
    .replace(/[\s_]+/g, '-')     // replace whitespace/underscores with hyphens
    .replace(/-+/g, '-')         // collapse multiple hyphens
    .replace(/^-+|-+$/g, '');    // trim boundary hyphens
};

/**
 * Strips URLs, protocols, domains, prefixes, and surrounding slashes to return only the bare slug.
 * Example: "https://www.loveofcalvary.org/blog/church-in-chengalpattu/" -> "church-in-chengalpattu"
 * 
 * @param {string} raw - Raw slug, path, or URL
 * @returns {string} Bare slug
 */
export const cleanSlug = (raw = '') => {
  if (!raw || typeof raw !== 'string') return '';
  return raw
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\/[^/]+/i, '') // strip domain
    .replace(/^\/?(blog\/)?/i, '')     // strip /blog/
    .replace(/^\/+|\/+$/g, '')         // strip leading/trailing slashes
    .trim();
};

/**
 * Resolves a slug against known aliases. Returns canonical slug if alias exists, otherwise returns clean slug.
 * 
 * @param {string} rawSlug - Raw slug to resolve
 * @returns {string} Resolved canonical slug
 */
export const resolveSlug = (rawSlug = '') => {
  const cleaned = cleanSlug(rawSlug);
  return SLUG_ALIASES[cleaned] || cleaned;
};

/**
 * Validates whether a slug conforms to SEO standard format: lowercase letters, numbers, and hyphens.
 * 
 * @param {string} slug - Slug to validate
 * @returns {boolean} True if valid
 */
export const isValidSlug = (slug = '') => {
  if (!slug || typeof slug !== 'string') return false;
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug.trim());
};

/**
 * Checks if a given slug is one of the official ministry blog posts.
 * 
 * @param {string} slug - Slug to check
 * @returns {boolean} True if known blog slug
 */
export const isKnownBlogSlug = (slug = '') => {
  const resolved = resolveSlug(slug);
  return ALL_BLOG_SLUGS.includes(resolved);
};

/**
 * Checks if a given slug is one of the site pages.
 * 
 * @param {string} slug - Slug to check
 * @returns {boolean} True if known page slug
 */
export const isKnownPageSlug = (slug = '') => {
  const cleaned = cleanSlug(slug);
  return ALL_PAGE_SLUGS.includes(cleaned);
};

/**
 * Generates the full canonical URL for a blog slug with trailing slash.
 * Example: "church-in-chengalpattu" -> "https://www.loveofcalvary.org/blog/church-in-chengalpattu/"
 * 
 * @param {string} slug - Blog slug
 * @returns {string} Full canonical URL
 */
export const getBlogCanonicalUrl = (slug = '') => {
  const resolved = resolveSlug(slug);
  return `${SITE_DOMAIN}/blog/${resolved}/`;
};

/**
 * Generates the full canonical URL for a page slug.
 * Example: "about" -> "https://www.loveofcalvary.org/about"
 * 
 * @param {string} slug - Page slug
 * @returns {string} Full canonical URL
 */
export const getPageCanonicalUrl = (slug = '') => {
  const cleaned = cleanSlug(slug);
  return cleaned ? `${SITE_DOMAIN}/${cleaned}` : `${SITE_DOMAIN}/`;
};

/**
 * Generates the relative application route for a blog slug.
 * 
 * @param {string} slug - Blog slug
 * @returns {string} Relative path (e.g., "/blog/church-in-chengalpattu/")
 */
export const getBlogRoutePath = (slug = '') => {
  const resolved = resolveSlug(slug);
  return `/blog/${resolved}/`;
};

/**
 * Finds a blog post by slug or legacy alias.
 * 
 * @param {string} rawSlug - Slug or path
 * @returns {object|null} Matched blog post object or null
 */
export const getBlogPostBySlug = (rawSlug = '') => {
  if (!rawSlug) return null;
  const canonical = resolveSlug(rawSlug);
  return OFFICIAL_BLOG_POSTS.find((p) => p.slug === canonical) || null;
};

/**
 * Master registry object exporting all slug data and utilities
 */
export default {
  SITE_DOMAIN,
  PAGE_SLUGS,
  BLOG_SLUGS,
  ALL_BLOG_SLUGS,
  ALL_PAGE_SLUGS,
  SLUG_ALIASES,
  slugify,
  cleanSlug,
  resolveSlug,
  isValidSlug,
  isKnownBlogSlug,
  isKnownPageSlug,
  getBlogCanonicalUrl,
  getPageCanonicalUrl,
  getBlogRoutePath,
  getBlogPostBySlug,
};
