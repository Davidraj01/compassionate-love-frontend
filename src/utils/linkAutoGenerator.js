/**
 * Internal Link & Blog URL Auto-Generator Utility
 * Provides presets, URL generation, validation, intelligent related-blog matching,
 * automated keyword linking, and manual clipboard copy helpers across all page
 * content blocks and blog article content.
 * 
 * Generates blog URLs in the exact format:
 *   https://www.loveofcalvary.org/blog/best-church-bible-in-chengalpattu/
 */

export const SITE_BASE_URL = 'https://www.loveofcalvary.org';
export const BLOG_BASE_URL = 'https://www.loveofcalvary.org/blog';

/**
 * Dynamically gets the active site origin.
 * In browser runtime (e.g. localhost during dev or live custom domain), returns current origin
 * so all generated links and test buttons are 100% active and work without DNS errors.
 */
export const getActiveSiteOrigin = () => {
  if (typeof window !== 'undefined' && window.location && window.location.origin) {
    return window.location.origin;
  }
  return SITE_BASE_URL;
};

export const KEY_FEATURES_PRESET = {
  label: 'Key Features & Core Pillars',
  url: '/#key-features',
  anchor: 'Key Features',
  group: 'Section Anchors',
};

export const SITE_PAGE_PRESETS = [
  { label: 'Home Page', url: '/', anchor: 'Compassionate Love of Calvary Ministries', group: 'Site Pages' },
  { label: 'About Our Ministry', url: '/about', anchor: 'About Our Ministry', group: 'Site Pages' },
  { label: 'Ministries & Outreach', url: '/ministries', anchor: 'Ministries & Outreach', group: 'Site Pages' },
  { label: 'Holy Scriptures Bible', url: '/bible', anchor: 'Holy Scriptures Bible', group: 'Site Pages' },
  { label: 'Bible Study & Discipleship', url: '/study', anchor: 'Bible Study', group: 'Site Pages' },
  { label: 'Daily Devotionals', url: '/devotional', anchor: 'Daily Devotionals', group: 'Site Pages' },
  { label: 'Gospel Sermons', url: '/sermons', anchor: 'Gospel Sermons', group: 'Site Pages' },
  { label: 'Church Events', url: '/events', anchor: 'Church Events', group: 'Site Pages' },
  { label: 'Worship & Media Gallery', url: '/media', anchor: 'Media Gallery', group: 'Site Pages' },
  { label: 'Prayer Request & Contact', url: '/contact', anchor: 'Prayer Request & Contact', group: 'Site Pages' },
  { label: 'Ministry Articles & Blog', url: '/blog', anchor: 'Ministry Articles & Blog', group: 'Site Pages' },
];

/**
 * Normalizes and converts any raw text, title, or slug into a clean, hyphen-separated slug.
 * Example: "best church-bible-in-chengalpattu/" -> "best-church-bible-in-chengalpattu"
 */
export const cleanBlogSlug = (raw = '') => {
  if (!raw || typeof raw !== 'string') return '';
  return raw
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/^https?:\/\/[^/]+/i, '') // strip protocol and domain if full URL passed
    .replace(/^\/?(blog\/)?/i, '')     // strip /blog/ prefix
    .replace(/[\s_]+/g, '-')           // spaces and underscores to hyphens
    .replace(/[^a-z0-9-]+/g, '')       // strip non-alphanumeric except hyphen
    .replace(/-{2,}/g, '-')            // collapse duplicate hyphens
    .replace(/^-+|-+$/g, '');          // trim leading and trailing hyphens
};

/**
 * Formats a blog slug into the exact requested active URL structure with trailing slash:
 * - Full domain: "https://www.loveofcalvary.org/blog/best-church-bible-in-chengalpattu/"
 *   (uses active browser origin dynamically so test links on dev/prod are immediately live)
 * - Relative:    "/blog/best-church-bible-in-chengalpattu/"
 */
export const formatBlogUrl = (slugOrText = '', useFullDomain = true, preferActiveOrigin = true) => {
  const slug = cleanBlogSlug(slugOrText);
  const baseOrigin = preferActiveOrigin ? getActiveSiteOrigin() : SITE_BASE_URL;
  if (!slug) return useFullDomain ? `${baseOrigin}/blog/` : '/blog/';

  if (useFullDomain) {
    return `${baseOrigin}/blog/${slug}/`;
  }
  return `/blog/${slug}/`;
};

/**
 * Checks whether a URL belongs to the ministry's internal domains
 * or is a relative internal path.
 */
export const isInternalOrMinistryUrl = (url = '') => {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (trimmed.startsWith('/') || trimmed.startsWith('#')) return true;
  if (typeof window !== 'undefined' && window.location && trimmed.startsWith(window.location.origin)) return true;
  return /^(https?:\/\/)?([a-z0-9-]+\.)?loveofcalava?ry\.org/i.test(trimmed) || /^https?:\/\/localhost(:\d+)?/i.test(trimmed);
};

/**
 * Common English stop words to filter out during keyword extraction.
 */
const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren',
  'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by',
  'can', 'cannot', 'could', 'did', 'do', 'does', 'doing', 'down', 'during', 'each', 'few', 'for',
  'from', 'further', 'had', 'has', 'have', 'having', 'he', 'her', 'here', 'hers', 'herself', 'him',
  'himself', 'his', 'how', 'i', 'if', 'in', 'into', 'is', 'it', 'its', 'itself', 'just', 'me', 'more',
  'most', 'my', 'myself', 'no', 'nor', 'not', 'now', 'of', 'off', 'on', 'once', 'only', 'or', 'other',
  'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'she', 'should', 'so', 'some', 'such',
  'than', 'that', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'these', 'they',
  'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'we', 'were',
  'what', 'when', 'where', 'which', 'while', 'who', 'whom', 'why', 'with', 'would', 'you', 'your',
  'yours', 'yourself', 'yourselves'
]);

/**
 * Extracts meaningful keyword tokens from text or HTML.
 */
export const extractMeaningfulTokens = (text = '') => {
  if (!text || typeof text !== 'string') return [];
  const clean = text
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z0-9#]+;/gi, ' ')
    .toLowerCase();
  
  const words = clean.match(/[a-z0-9'-]+/g) || [];
  return words
    .map(w => w.replace(/^'+|'+$/g, ''))
    .filter(w => w.length >= 3 && !STOP_WORDS.has(w));
};

/**
 * Core ministry topic keywords for enriching internal link and blog URLs.
 */
export const INTERNAL_TOPIC_KEYWORDS = [
  'bible',
  'church',
  'prayer',
  'faith',
  'teaching',
  'gospel',
  'devotional',
  'worship',
  'sermon',
  'discipleship',
  'ministry',
  'scripture',
  'fellowship',
  'grace',
  'salvation',
  'healing',
];

/**
 * Intelligent Blog Slug Generator:
 * Generates an SEO-optimized slug by combining:
 * 1. Main Keyword (from focus_keyword, primary subject, or title/heading)
 * 2. Internal Keyword (from category, tags, or internal ministry topics like 'bible', 'church', 'prayer')
 * 3. Content-based tokens (e.g. location 'chengalpattu', high-relevance content tokens from body/excerpt)
 * 
 * Example:
 *   Main keyword: "best church"
 *   Internal keyword: "bible"
 *   Content location: "chengalpattu"
 *   Result slug: "best-church-bible-in-chengalpattu"
 *   Formatted URL: "https://blog.loveofcalavary.org/best-church-bible-in-chengalpattu/"
 */
export const generateBlogSlugFromContent = ({
  title = '',
  heading = '',
  focusKeyword = '',
  content = '',
  excerpt = '',
  category = '',
  tags = [],
  metaKeywords = '',
} = {}) => {
  const subjectText = (title || heading || '').trim();
  const rawContent = (content || excerpt || '').trim();
  const allText = `${subjectText} ${focusKeyword} ${rawContent} ${category} ${Array.isArray(tags) ? tags.join(' ') : ''} ${metaKeywords}`.toLowerCase();

  // 1. Main Keyword (from focusKeyword or subject/heading)
  let mainWords = [];
  const cleanFocus = cleanBlogSlug(focusKeyword);
  if (cleanFocus) {
    mainWords = cleanFocus.split('-');
  } else if (subjectText) {
    const tokens = extractMeaningfulTokens(subjectText);
    mainWords = tokens.slice(0, 3);
  }

  if (mainWords.length === 0) {
    const contentTokens = extractMeaningfulTokens(rawContent);
    mainWords = contentTokens.slice(0, 2);
  }

  if (mainWords.length === 0) {
    mainWords = ['church'];
  }

  // 2. Internal Keyword (category, tags, or ministry keywords)
  let internalWord = '';
  const cleanCategory = cleanBlogSlug(category);
  if (cleanCategory && !mainWords.includes(cleanCategory)) {
    for (const kw of INTERNAL_TOPIC_KEYWORDS) {
      if (cleanCategory.includes(kw) && !mainWords.includes(kw)) {
        internalWord = kw;
        break;
      }
    }
  }

  if (!internalWord && Array.isArray(tags)) {
    for (const tag of tags) {
      const cleanTag = cleanBlogSlug(tag);
      if (cleanTag && !mainWords.includes(cleanTag)) {
        internalWord = cleanTag;
        break;
      }
    }
  }

  if (!internalWord) {
    for (const kw of INTERNAL_TOPIC_KEYWORDS) {
      if (!mainWords.includes(kw) && allText.includes(kw)) {
        internalWord = kw;
        break;
      }
    }
  }

  if (!internalWord) {
    if (!mainWords.includes('bible') && allText.includes('bible')) {
      internalWord = 'bible';
    } else if (!mainWords.includes('church') && allText.includes('church')) {
      internalWord = 'church';
    } else if (!mainWords.includes('faith')) {
      internalWord = 'faith';
    }
  }

  // 3. Content-based / Location qualifier
  let contentWords = [];
  if (allText.includes('chengalpattu') && !mainWords.includes('chengalpattu') && internalWord !== 'chengalpattu') {
    contentWords = ['in', 'chengalpattu'];
  } else if (allText.includes('tamil nadu') && !mainWords.includes('tamil') && internalWord !== 'tamil') {
    contentWords = ['in', 'tamil', 'nadu'];
  } else {
    const tokens = extractMeaningfulTokens(rawContent);
    for (const t of tokens) {
      if (!mainWords.includes(t) && t !== internalWord && t.length >= 4) {
        contentWords = [t];
        break;
      }
    }
  }

  // 4. Assemble and deduplicate tokens in sequence
  const assembled = [];
  const seen = new Set();

  const addWord = (w) => {
    const clean = cleanBlogSlug(w);
    if (!clean) return;
    clean.split('-').forEach(sub => {
      if (sub && !seen.has(sub)) {
        seen.add(sub);
        assembled.push(sub);
      }
    });
  };

  mainWords.forEach(addWord);
  if (internalWord) addWord(internalWord);
  contentWords.forEach(addWord);

  const finalSlug = assembled.join('-') || 'best-church-bible-in-chengalpattu';
  return cleanBlogSlug(finalSlug);
};

/**
 * Generates the full blog URL from content, main keyword, and internal keywords.
 * Defaults to: https://blog.loveofcalavary.org/:slug/
 */
export const generateBlogUrl = (params = {}, useFullDomain = true) => {
  const slug = generateBlogSlugFromContent(params);
  return formatBlogUrl(slug, useFullDomain);
};

/**
 * Validates whether a URL is a valid internal path (relative or with hash) or valid http/https URL.
 */
export const isValidLinkUrl = (value) => {
  if (!value || typeof value !== 'string') return false;
  const v = value.trim();
  if (/^\/(?!\/)[A-Za-z0-9/_#?&=.%+-]*$/.test(v)) return true;
  if (/^https?:\/\/[A-Za-z0-9-._~:/?#[\]@!$&'()*+,;=]+$/i.test(v)) return true;
  return false;
};

/**
 * Formats any path according to full domain preference.
 * Converts blog paths into the exact requested structure:
 * https://www.loveofcalvary.org/blog/:slug/ (or active dev origin)
 */
export const formatLinkUrl = (pathOrUrl, useFullDomain = true, preferActiveOrigin = true) => {
  if (!pathOrUrl || typeof pathOrUrl !== 'string') return '';
  const trimmed = pathOrUrl.trim();
  const baseOrigin = preferActiveOrigin ? getActiveSiteOrigin() : SITE_BASE_URL;

  // 1. Check if this is a blog post link or slug
  const isExplicitBlogUrl = trimmed.includes('blog.') || trimmed.includes('/blog/');
  if (isExplicitBlogUrl) {
    const slug = cleanBlogSlug(trimmed);
    return formatBlogUrl(slug, useFullDomain, preferActiveOrigin);
  }

  // 2. Section anchor (/#key-features)
  if (trimmed === '/#key-features' || trimmed === '#key-features' || trimmed.endsWith('/#key-features')) {
    return useFullDomain ? `${baseOrigin}/#key-features` : '/#key-features';
  }

  // 3. Site Pages
  if (useFullDomain) {
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
    return `${baseOrigin}${cleanPath}`;
  } else {
    if (trimmed.startsWith(BLOG_BASE_URL)) {
      const slug = cleanBlogSlug(trimmed.substring(BLOG_BASE_URL.length));
      return slug ? `/blog/${slug}/` : '/blog/';
    }
    if (trimmed.startsWith(baseOrigin) || trimmed.startsWith(SITE_BASE_URL)) {
      const rel = trimmed.replace(baseOrigin, '').replace(SITE_BASE_URL, '');
      return rel || '/';
    }
    return trimmed;
  }
};

/**
 * Finds the most related blog post(s) for a given content block or heading.
 * Returns a sorted list of blogs with relevance scores and match keywords.
 */
export const findRelatedBlogs = (content = '', heading = '', blogs = [], currentSlug = '') => {
  if (!Array.isArray(blogs) || blogs.length === 0) return [];

  const headingTokens = extractMeaningfulTokens(heading);
  const contentTokens = extractMeaningfulTokens(content);
  const allTokens = [...headingTokens, ...contentTokens];
  const tokenSet = new Set(allTokens);
  const combinedRaw = `${heading} ${content}`.toLowerCase();

  const scored = blogs
    .filter((b) => b && b.slug && cleanBlogSlug(b.slug) !== cleanBlogSlug(currentSlug))
    .map((blog) => {
      let score = 0;
      const matchedKeywords = [];

      const titleLower = (blog.title || '').toLowerCase();
      const focusLower = (blog.focus_keyword || '').toLowerCase();
      const categoryLower = (blog.category || '').toLowerCase();
      const tagsLower = Array.isArray(blog.tags) ? blog.tags.map((t) => String(t).toLowerCase()) : [];
      const excerptLower = (blog.excerpt || '').toLowerCase();

      // 1. Exact phrase match of blog title in content
      if (titleLower && titleLower.length > 3 && combinedRaw.includes(titleLower)) {
        score += 60;
        matchedKeywords.push(blog.title);
      }

      // 2. Individual words from blog title
      const titleTokens = extractMeaningfulTokens(blog.title);
      titleTokens.forEach((t) => {
        if (headingTokens.includes(t)) {
          score += 15;
          matchedKeywords.push(t);
        } else if (tokenSet.has(t)) {
          score += 8;
          matchedKeywords.push(t);
        }
      });

      // 3. Focus keyword match
      if (focusLower && focusLower.length > 2 && combinedRaw.includes(focusLower)) {
        score += 35;
        matchedKeywords.push(blog.focus_keyword);
      } else {
        const focusTokens = extractMeaningfulTokens(blog.focus_keyword);
        focusTokens.forEach((t) => {
          if (tokenSet.has(t)) {
            score += 10;
            matchedKeywords.push(t);
          }
        });
      }

      // 4. Tags match
      tagsLower.forEach((tag) => {
        if (tag && tag.length > 2 && combinedRaw.includes(tag)) {
          score += 15;
          matchedKeywords.push(tag);
        }
      });

      // 5. Category match
      if (categoryLower && categoryLower.length > 2 && combinedRaw.includes(categoryLower)) {
        score += 12;
        matchedKeywords.push(blog.category);
      }

      // 6. Excerpt match
      const excerptTokens = extractMeaningfulTokens(excerptLower);
      let excerptMatches = 0;
      excerptTokens.forEach((t) => {
        if (tokenSet.has(t) && excerptMatches < 4) {
          score += 3;
          excerptMatches++;
        }
      });

      return {
        ...blog,
        relevanceScore: score,
        matchedKeywords: Array.from(new Set(matchedKeywords)),
      };
    });

  // Sort by score descending
  scored.sort((a, b) => b.relevanceScore - a.relevanceScore);
  return scored;
};

/**
 * Builds categorized link presets including Key Features, Site Pages,
 * intelligent Related Blogs (top matches for current block content), and All Blogs.
 */
export const buildCategorizedPresets = (
  blogs = [],
  currentSlug = '',
  useFullDomain = true,
  content = '',
  heading = ''
) => {
  const format = (url) => formatLinkUrl(url, useFullDomain);

  const keyFeatures = [
    {
      ...KEY_FEATURES_PRESET,
      formattedUrl: format(KEY_FEATURES_PRESET.url),
    },
  ];

  const sitePages = SITE_PAGE_PRESETS.map((p) => ({
    ...p,
    formattedUrl: format(p.url),
  }));

  // Find top blogs related to current content (if content/heading provided)
  const relatedList = (content || heading)
    ? findRelatedBlogs(content, heading, blogs, currentSlug)
        .filter((b) => b.relevanceScore > 0)
        .slice(0, 4)
    : [];

  const relatedBlogs = relatedList.map((b) => {
    const slug = cleanBlogSlug(b.slug);
    return {
      label: `🎯 ${b.title || b.slug}`,
      slug,
      url: formatBlogUrl(slug, false),
      formattedUrl: formatBlogUrl(slug, useFullDomain),
      anchor: b.title || b.slug,
      relevanceScore: b.relevanceScore,
      matchedKeywords: b.matchedKeywords,
      group: 'Related Blog Articles',
    };
  });

  const blogPosts = (Array.isArray(blogs) ? blogs : [])
    .filter((b) => b && b.slug && cleanBlogSlug(b.slug) !== cleanBlogSlug(currentSlug))
    .map((b) => {
      const slug = cleanBlogSlug(b.slug);
      return {
        label: b.title || b.slug,
        slug,
        url: formatBlogUrl(slug, false),
        formattedUrl: formatBlogUrl(slug, useFullDomain),
        anchor: b.title || b.slug,
        group: 'All Blog Articles',
      };
    });

  return {
    keyFeatures,
    sitePages,
    relatedBlogs,
    blogPosts,
  };
};

/**
 * Copies arbitrary text to the clipboard with robust browser fallbacks.
 * Executes synchronous execCommand first within the active user gesture,
 * then falls back to navigator.clipboard.writeText, and finally prompt fallback.
 */
export const copyLinkToClipboard = async (text) => {
  if (!text) return false;

  // 1. Try synchronous execCommand first while the transient user activation is guaranteed active
  try {
    const el = document.createElement('textarea');
    el.value = text;
    el.setAttribute('readonly', '');
    el.style.contain = 'strict';
    el.style.position = 'fixed';
    el.style.top = '0';
    el.style.left = '0';
    el.style.width = '2em';
    el.style.height = '2em';
    el.style.padding = '0';
    el.style.border = 'none';
    el.style.outline = 'none';
    el.style.boxShadow = 'none';
    el.style.background = 'transparent';
    el.style.opacity = '0';
    el.style.pointerEvents = 'none';
    el.style.zIndex = '-9999';

    const selection = document.getSelection();
    let originalRange = null;
    if (selection && selection.rangeCount > 0) {
      originalRange = selection.getRangeAt(0);
    }

    document.body.appendChild(el);
    el.focus({ preventScroll: true });
    el.select();
    el.selectionStart = 0;
    el.selectionEnd = text.length;

    const successful = document.execCommand('copy');
    document.body.removeChild(el);

    if (originalRange && selection) {
      selection.removeAllRanges();
      selection.addRange(originalRange);
    }

    if (successful) {
      return true;
    }
  } catch (err) {
    console.warn('execCommand copy attempt error:', err);
  }

  // 2. Try modern Clipboard API if available and permitted
  try {
    if (typeof navigator !== 'undefined' && navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (err) {
    console.warn('navigator.clipboard.writeText failed:', err);
  }

  // 3. Fallback: prompt the user so they can copy with Ctrl+C easily without error
  try {
    if (typeof window !== 'undefined' && typeof window.prompt === 'function') {
      window.prompt('Copy to clipboard (Press Ctrl+C, then Enter):', text);
      return true;
    }
  } catch {}

  return false;
};

/**
 * Automatically scans content text/HTML and links keywords for Key Features, Site Pages, and Blogs.
 * Generates blog URLs in the exact format: https://www.loveofcalvary.org/blog/:slug/
 * Safely preserves existing HTML tags and existing <a> links.
 */
export const autoLinkContentText = (rawContent, { blogs = [], useFullDomain = true, currentSlug = '' } = {}) => {
  if (!rawContent || typeof rawContent !== 'string') {
    return { updated: rawContent || '', count: 0 };
  }

  let count = 0;
  const targets = [];

  // 1. Key Features
  targets.push({
    keywords: ['key features & core pillars', 'key features', 'core pillars'],
    url: formatLinkUrl('/#key-features', useFullDomain),
    anchor: 'Key Features',
  });

  // 2. Main Site Pages
  targets.push(
    { keywords: ['holy scriptures bible', 'holy scriptures', 'holy bible'], url: formatLinkUrl('/bible', useFullDomain), anchor: 'Holy Scriptures Bible' },
    { keywords: ['bible study & discipleship', 'bible study', 'discipleship'], url: formatLinkUrl('/study', useFullDomain), anchor: 'Bible Study' },
    { keywords: ['daily devotionals', 'daily devotional'], url: formatLinkUrl('/devotional', useFullDomain), anchor: 'Daily Devotionals' },
    { keywords: ['gospel sermons', 'christian sermons'], url: formatLinkUrl('/sermons', useFullDomain), anchor: 'Gospel Sermons' },
    { keywords: ['ministries & outreach', 'christian ministries', 'ministry outreach'], url: formatLinkUrl('/ministries', useFullDomain), anchor: 'Ministries & Outreach' },
    { keywords: ['church events', 'ministry events'], url: formatLinkUrl('/events', useFullDomain), anchor: 'Church Events' },
    { keywords: ['worship & media', 'media gallery'], url: formatLinkUrl('/media', useFullDomain), anchor: 'Media Gallery' },
    { keywords: ['prayer request & contact', 'prayer request', 'request prayer'], url: formatLinkUrl('/contact', useFullDomain), anchor: 'Prayer Request & Contact' },
    { keywords: ['ministry articles & blog', 'ministry articles'], url: formatLinkUrl('/blog', useFullDomain), anchor: 'Ministry Articles & Blog' },
    { keywords: ['compassionate love of calvary ministries', 'calvary ministries'], url: formatLinkUrl('/', useFullDomain), anchor: 'Compassionate Love of Calvary Ministries' },
    { keywords: ['about our ministry', 'about calvary ministry'], url: formatLinkUrl('/about', useFullDomain), anchor: 'About Our Ministry' }
  );

  // 3. Dynamic Blogs - Active blog URL format: https://www.loveofcalvary.org/blog/:slug/
  if (Array.isArray(blogs) && blogs.length > 0) {
    blogs.forEach((b) => {
      if (b && b.slug && b.title && cleanBlogSlug(b.slug) !== cleanBlogSlug(currentSlug)) {
        const titleTrimmed = b.title.trim();
        if (titleTrimmed.length >= 4) {
          targets.push({
            keywords: [titleTrimmed],
            url: formatBlogUrl(b.slug, useFullDomain),
            anchor: titleTrimmed,
          });
        }
      }
    });
  }

  // Deduplicate and sort by pattern length descending
  const keywordMap = [];
  const registeredKw = new Set();
  for (const item of targets) {
    for (const kw of item.keywords) {
      const lower = kw.toLowerCase();
      if (!registeredKw.has(lower)) {
        registeredKw.add(lower);
        keywordMap.push({
          pattern: lower,
          rawLength: kw.length,
          url: item.url,
          anchor: item.anchor,
        });
      }
    }
  }
  keywordMap.sort((a, b) => b.rawLength - a.rawLength);

  // Split content by existing <a> tags OR any other HTML tag to keep markup intact
  const tokens = rawContent.split(/(<a\b[^>]*>.*?<\/a>|<[^>]+>)/gis);
  const matchedKeywordsInRun = new Set();

  const newTokens = tokens.map((token) => {
    // If token is an HTML tag (or existing <a>...</a>), leave completely untouched
    if (/^<a\b/i.test(token) || /^<[^>]+>$/i.test(token)) {
      return token;
    }

    let modified = token;

    // Detect raw blog URLs in plain text and convert them
    if (Array.isArray(blogs) && blogs.length > 0) {
      modified = modified.replace(
        /(https?:\/\/(?:blog|www)?\.?loveofcalava?ry\.org\/(?:blog\/)?([a-z0-9-]+)\/?|\/blog\/([a-z0-9-]+)\/?)/gi,
        (fullMatch, _p1, slug1, slug2) => {
          const rawSlug = slug1 || slug2;
          const slug = cleanBlogSlug(rawSlug);
          const matchingBlog = blogs.find((b) => cleanBlogSlug(b.slug) === slug);
          const title = matchingBlog?.title || 'Read Article';
          const finalUrl = formatBlogUrl(slug, useFullDomain);
          count++;
          return `<a href="${finalUrl}">${title}</a>`;
        }
      );
    }

    // Match keywords with word boundaries
    for (const km of keywordMap) {
      if (matchedKeywordsInRun.has(km.pattern)) continue;

      const escaped = km.pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(?<![a-zA-Z0-9])(${escaped})(?![a-zA-Z0-9])`, 'i');

      if (regex.test(modified)) {
        modified = modified.replace(regex, (_match, matchedText) => {
          count++;
          matchedKeywordsInRun.add(km.pattern);
          return `<a href="${km.url}">${matchedText}</a>`;
        });
      }
    }

    return modified;
  });

  return {
    updated: newTokens.join(''),
    count,
  };
};

export const isInternalPath = isValidLinkUrl;

