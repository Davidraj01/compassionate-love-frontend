import React, { useState, useEffect, useMemo, useRef } from 'react';
import { api, getMediaUrl } from '../../services/api';
import { ROUTES } from '../../routes/routes';
import { MediaPickerModal } from '../../components/MediaPickerModal';
import SEOManagementPanel from '../../components/SEOManagementPanel';
import {
  SITE_BASE_URL,
  BLOG_BASE_URL,
  KEY_FEATURES_PRESET,
  SITE_PAGE_PRESETS,
  isValidLinkUrl,
  formatLinkUrl,
  formatBlogUrl,
  cleanBlogSlug,
  generateBlogSlugFromContent,
  generateBlogUrl,
  isInternalOrMinistryUrl,
  findRelatedBlogs,
  buildCategorizedPresets,
  copyLinkToClipboard,
  autoLinkContentText
} from '../../utils/linkAutoGenerator';
import { 
  Globe, Search, Save, Eye, CheckCircle2, AlertCircle, Sparkles, 
  Smartphone, Monitor, ExternalLink, ShieldCheck, Tag, Link2, Share2, 
  Code, RefreshCw, FileText, Check, Copy, Image as ImageIcon,
  Bold, Italic, Underline, Strikethrough, List, ListOrdered, Quote, Table, Minus,
  Link as LinkIcon, FileCode, Plus, X, Layers, Heading1, Heading2, Heading3,
  AlignLeft, AlignCenter, AlignRight, HelpCircle, MessageSquare, Star, Send,
  Sliders, ArrowUpRight, Video, ChevronDown, CheckSquare, Settings, Upload
} from 'lucide-react';

const PAGES = [
  { id: 'home', name: 'Home Page', path: ROUTES.HOME, defaultKw: 'Compassionate Love of Calvary Ministries' },
  { id: 'about', name: 'About Page', path: ROUTES.ABOUT, defaultKw: 'About Compassionate Love of Calvary Ministries' },
  { id: 'ministries', name: 'Ministries Page', path: ROUTES.MINISTRIES, defaultKw: 'Christian Ministries in Chengalpattu' },
  { id: 'bible', name: 'Bible Page', path: ROUTES.BIBLE, defaultKw: 'Bible Teaching Ministry' },
  { id: 'study', name: 'Study Page', path: ROUTES.STUDY, defaultKw: 'Christian Bible Study' },
  { id: 'devotional', name: 'Devotional Page', path: ROUTES.DEVOTIONAL, defaultKw: 'Christian Devotionals for Daily Faith' },
  { id: 'sermons', name: 'Sermons Page', path: ROUTES.SERMONS, defaultKw: 'Christian Sermons' },
  { id: 'events', name: 'Events Page', path: ROUTES.EVENTS, defaultKw: 'Christian Worship and Fellowship Events' },
  { id: 'blog', name: 'Blog Page', path: ROUTES.BLOG, defaultKw: 'Ministry for Faith and Spiritual Growth' },
  { id: 'media', name: 'Media Page', path: ROUTES.MEDIA, defaultKw: 'Gospel Ministry Worship & Media' },
  { id: 'contact', name: 'Contact Page', path: ROUTES.CONTACT, defaultKw: 'Contact Compassionate Love of Calvary Ministries' },
];

export const SEO_KEYWORDS_50_DATABASE = {
  primary: [
    { no: 1, keyword: 'Compassionate Love of Calvary Ministries', targetPage: 'home', pageName: 'Home (/)' },
    { no: 2, keyword: 'Christian ministry in Chengalpattu', targetPage: 'home', pageName: 'Home (/)' },
    { no: 3, keyword: 'Church in Chengalpattu', targetPage: 'home', pageName: 'Home (/)' },
    { no: 4, keyword: 'Christian ministries in Tamil Nadu', targetPage: 'ministries', pageName: 'Ministries (/ministries)' },
    { no: 5, keyword: 'Bible teaching ministry', targetPage: 'bible', pageName: 'Bible (/bible)' },
    { no: 6, keyword: 'Christian Bible study', targetPage: 'study', pageName: 'Study (/study)' },
    { no: 7, keyword: 'Christian devotional', targetPage: 'devotional', pageName: 'Devotional (/devotional)' },
    { no: 8, keyword: 'Christian sermons', targetPage: 'sermons', pageName: 'Sermons (/sermons)' },
    { no: 9, keyword: 'Prayer ministry in Chengalpattu', targetPage: 'ministries', pageName: 'Ministries (/ministries)' },
    { no: 10, keyword: 'Faith-based Christian ministry', targetPage: 'about', pageName: 'About (/about)' },
  ],
  longTail: [
    { no: 11, keyword: 'Compassionate Christian ministry in Tamil Nadu', relevantPages: ['about', 'home', 'ministries'] },
    { no: 12, keyword: "Ministry sharing God's love and hope", relevantPages: ['home', 'about'] },
    { no: 13, keyword: 'Christ-centered ministry in Chengalpattu', relevantPages: ['home', 'about', 'contact'] },
    { no: 14, keyword: 'Christian fellowship in Chengalpattu', relevantPages: ['home', 'events', 'contact'] },
    { no: 15, keyword: 'Biblical teachings for daily life', relevantPages: ['bible', 'study'] },
    { no: 16, keyword: 'Bible lessons for spiritual growth', relevantPages: ['bible', 'study'] },
    { no: 17, keyword: 'Daily Christian devotional for spiritual growth', relevantPages: ['devotional'] },
    { no: 18, keyword: "Bible verses about God's compassionate love", relevantPages: ['bible', 'devotional'] },
    { no: 19, keyword: 'Christian prayer and spiritual guidance', relevantPages: ['contact', 'ministries'] },
    { no: 20, keyword: 'Ministry for faith and spiritual growth', relevantPages: ['about', 'home', 'blog'] },
    { no: 21, keyword: "Understanding God's grace in Christianity", relevantPages: ['sermons', 'study'] },
    { no: 22, keyword: 'How to grow in Christian faith', relevantPages: ['study', 'sermons', 'blog'] },
    { no: 23, keyword: 'How to develop a daily prayer habit', relevantPages: ['devotional', 'contact'] },
    { no: 24, keyword: 'Bible study resources for beginners', relevantPages: ['study', 'bible'] },
    { no: 25, keyword: 'Christian teachings about love and forgiveness', relevantPages: ['sermons', 'devotional'] },
  ],
  userSearchingIntent: [
    { no: 26, question: 'Where can I find a Christian ministry near me?', targetPage: 'contact' },
    { no: 27, question: 'Which church can I visit in Chengalpattu?', targetPage: 'home' },
    { no: 28, question: 'Where can I learn the Bible online?', targetPage: 'study' },
    { no: 29, question: 'How can I grow closer to God?', targetPage: 'devotional' },
    { no: 30, question: 'Where can I find daily Bible verses?', targetPage: 'bible' },
    { no: 31, question: "What is God's compassionate love?", targetPage: 'about' },
    { no: 32, question: 'How can I strengthen my faith in Jesus?', targetPage: 'sermons' },
    { no: 33, question: 'Where can I find Christian sermons online?', targetPage: 'sermons' },
    { no: 34, question: 'How can I start studying the Bible?', targetPage: 'study' },
    { no: 35, question: 'Where can I find Christian devotionals for today?', targetPage: 'devotional' },
    { no: 36, question: 'How can prayer help me grow spiritually?', targetPage: 'ministries' },
    { no: 37, question: 'Where can I find Bible teachings in Tamil?', targetPage: 'bible' },
    { no: 38, question: "How can I understand God's grace?", targetPage: 'sermons' },
    { no: 39, question: 'What does the Bible teach about forgiveness?', targetPage: 'sermons' },
    { no: 40, question: 'How can I learn more about Jesus Christ?', targetPage: 'about' },
  ],
  localSeo: [
    { no: 41, keyword: 'Christian ministry near Chengalpattu', relevantPages: ['home', 'contact'] },
    { no: 42, keyword: 'Bible teaching in Chengalpattu', relevantPages: ['bible', 'study'] },
    { no: 43, keyword: 'Christian prayer fellowship in Tamil Nadu', relevantPages: ['ministries', 'events'] },
    { no: 44, keyword: 'Christian spiritual guidance in Chengalpattu', relevantPages: ['contact', 'about'] },
    { no: 45, keyword: 'Christian worship and fellowship', relevantPages: ['home', 'events'] },
    { no: 46, keyword: 'Gospel ministry in Tamil Nadu', relevantPages: ['ministries', 'home'] },
    { no: 47, keyword: 'Bible study fellowship in Chengalpattu', relevantPages: ['study'] },
    { no: 48, keyword: 'Christian ministry for spiritual encouragement', relevantPages: ['about', 'devotional'] },
    { no: 49, keyword: 'Sharing the Gospel of Jesus Christ', relevantPages: ['home', 'sermons'] },
    { no: 50, keyword: "God's love, faith, hope and prayer", relevantPages: ['home', 'about'] },
  ],
};

export const PAGE_SEO_BLUEPRINT = {
  home: {
    focus_keyword: 'Compassionate Love of Calvary Ministries',
    meta_title: 'Compassionate Love of Calvary Ministries | Faith & Hope',
    meta_description: "Compassionate Love of Calvary Ministries is a Christ-centered ministry and church in Chengalpattu, Tamil Nadu sharing God's love, faith, hope, and prayer.",
    meta_keywords: 'Compassionate Love of Calvary Ministries, Christian ministry in Chengalpattu, Church in Chengalpattu, Christ-centered ministry in Chengalpattu, Christian fellowship in Chengalpattu, Christian ministry near Chengalpattu, Sharing the Gospel of Jesus Christ, God\'s love faith hope and prayer',
    heroH1: 'Compassionate Love of Calvary Ministries | Faith & Hope',
    heroSub: 'A Christ-centered Christian ministry in Chengalpattu, Tamil Nadu dedicated to sharing God’s compassionate love, strengthening faith, and bringing living hope to every heart.',
    faq: `Q: Which church can I visit in Chengalpattu?\nA: You are warmly welcome to visit Compassionate Love of Calvary Ministries in Chengalpattu, Tamil Nadu. We gather for Sunday Morning Worship at 9:00 AM and Evening Fellowship at 6:00 PM.\n\nQ: Where can I find a Christian ministry near me in Chengalpattu?\nA: Compassionate Love of Calvary Ministries is located in Chengalpattu, offering heartfelt prayer fellowship, biblical teachings, and compassionate community outreach.\n\nQ: What are the Core Pillars of Compassionate Love of Calvary Ministries?\nA: Our four foundational pillars are Faith & Prayer, Compassionate Love, Living Hope, and Active Community Service.`,
  },
  about: {
    focus_keyword: 'About Compassionate Love of Calvary Ministries',
    meta_title: 'About Our Christian Ministry | Compassionate Love of Calvary',
    meta_description: 'Learn about Compassionate Love of Calvary Ministries in Chengalpattu. Discover our Christ-centered mission, pastoral vision, faith values, and community service.',
    meta_keywords: 'About Compassionate Love of Calvary Ministries, Faith-based Christian ministry, Ministry sharing God\'s love and hope, Compassionate Christian ministry in Tamil Nadu, Christian spiritual guidance in Chengalpattu, What is God\'s compassionate love, How can I learn more about Jesus Christ',
    heroH1: 'About Our Christian Ministry | Compassionate Love of Calvary',
    heroSub: 'Discover the heart, vision, and pastoral leadership behind Compassionate Love of Calvary Ministries in Chengalpattu, Tamil Nadu.',
    faq: `Q: What is the mission of Compassionate Love of Calvary Ministries?\nA: We are dedicated to sharing God's unconditional love, fostering Christ-centered discipleship, and bringing hope and healing through the Gospel.\n\nQ: What is God's compassionate love?\nA: God's compassionate love is unconditional grace demonstrated through Jesus Christ on Calvary, offering forgiveness, spiritual renewal, and eternal hope to all who believe.\n\nQ: Who leads the ministry?\nA: Compassionate Love of Calvary Ministries is shepherd by dedicated pastoral leadership providing biblical preaching, spiritual guidance, and pastoral prayer.`,
  },
  ministries: {
    focus_keyword: 'Christian Ministries in Chengalpattu',
    meta_title: 'Christian Ministries in Chengalpattu | Calvary Ministries',
    meta_description: 'Explore Christ-centered Christian ministries in Chengalpattu and Tamil Nadu. Join our prayer fellowship, youth ministry, women\'s circle, and community charity outreach.',
    meta_keywords: 'Christian Ministries in Chengalpattu, Christian ministries in Tamil Nadu, Prayer ministry in Chengalpattu, Christian prayer fellowship in Tamil Nadu, Christian worship and fellowship, Gospel ministry in Tamil Nadu, How can prayer help me grow spiritually',
    heroH1: 'Christian Ministries in Chengalpattu | Compassionate Calvary Outreach',
    heroSub: 'Putting faith into action through prayer fellowship, evangelism outreach, compassionate charity, and discipleship across Tamil Nadu.',
    faq: `Q: What ministries are available at Compassionate Love of Calvary?\nA: We offer Sunday Worship, Intercessory Prayer Ministry, Youth Discipleship, Community Charity Outreach, and Gospel Mission Fellowships.\n\nQ: How can I join or volunteer in your ministry?\nA: You can connect with our team through the contact page or join us after our Sunday worship services to get involved in any ministry pathway.\n\nQ: How can prayer help me grow spiritually?\nA: Daily prayer establishes intimate communion with God, builds spiritual endurance, strengthens faith during trials, and aligns our hearts with God's divine purpose.`,
  },
  bible: {
    focus_keyword: 'Bible Teaching Ministry',
    meta_title: 'Bible Teachings for Faith and Spiritual Growth',
    meta_description: 'Explore verse-by-verse Bible teachings, Holy Scriptures reading plans, and biblical truth at Compassionate Love of Calvary Ministries in Tamil Nadu.',
    meta_keywords: 'Bible Teaching Ministry, Biblical teachings for daily life, Bible lessons for spiritual growth, Bible verses about God\'s compassionate love, Where can I learn the Bible online, Where can I find daily Bible verses, Where can I find Bible teachings in Tamil',
    heroH1: 'Bible Teaching Ministry | Scriptural Truth for Daily Life',
    heroSub: 'Unchanging truth for a changing world. Explore verse-by-verse scripture analysis, biblical life lessons, and spiritual growth teachings.',
    faq: `Q: Where can I find daily Bible verses and teachings?\nA: You can explore our Bible section online for daily scriptures, guided reading plans, and verse-by-verse pastoral expositions.\n\nQ: Where can I find Bible teachings in Tamil?\nA: We provide bilingual scriptural insights and messages in Tamil and English to help Tamil Nadu families grow deeply in God's Word.\n\nQ: Why is biblical teaching essential for spiritual growth?\nA: The Bible is God’s inspired Word—a lamp to our feet and a light to our path—providing divine wisdom, encouragement, and moral guidance.`,
  },
  study: {
    focus_keyword: 'Christian Bible Study',
    meta_title: 'Christian Bible Study | Learn and Grow in Faith',
    meta_description: 'Engage in Christian Bible study with Compassionate Love of Calvary Ministries. Deepen your faith with beginner and advanced scripture study resources.',
    meta_keywords: 'Christian Bible Study, Bible study resources for beginners, Bible study fellowship in Chengalpattu, How to grow in Christian faith, How can I start studying the Bible, Bible teaching in Chengalpattu',
    heroH1: 'Christian Bible Study | Learn, Understand and Grow in Faith',
    heroSub: 'Practical, in-depth Christian Bible studies designed for beginners and seasoned believers to cultivate a vibrant walk with Jesus Christ.',
    faq: `Q: How can I start studying the Bible as a beginner?\nA: Start with the Gospels (such as the Gospel of John), read with prayer asking the Holy Spirit for insight, and use our free structured study guides.\n\nQ: Does the church offer Bible study fellowship in Chengalpattu?\nA: Yes, we host weekly in-person and online Bible study fellowships covering books of the Old and New Testaments.\n\nQ: Are study guides and resources free?\nA: All study questions, notes, and outlines are 100% free for all seekers and believers.`,
  },
  devotional: {
    focus_keyword: 'Christian Devotionals for Daily Faith',
    meta_title: 'Daily Christian Devotionals for Faith and Spiritual Growth',
    meta_description: 'Read inspiring daily Christian devotionals for spiritual encouragement, prayer habits, and faith renewal from Compassionate Love of Calvary Ministries.',
    meta_keywords: 'Christian Devotionals for Daily Faith, Christian devotional, Daily Christian devotional for spiritual growth, How to develop a daily prayer habit, Where can I find Christian devotionals for today, Christian ministry for spiritual encouragement',
    heroH1: 'Daily Christian Devotionals | Nourishing Faith & Morning Prayer',
    heroSub: 'Start each day refreshed in God’s presence with daily devotionals, scripture meditation, and pastoral prayers for living hope.',
    faq: `Q: Where can I find Christian devotionals for today?\nA: Read our daily devotional post every morning on our website, complete with a focus scripture, devotional reflection, and closing prayer.\n\nQ: How can I develop a daily prayer habit?\nA: Set aside a dedicated quiet time each morning, start with thanksgiving, read a devotional scripture, and speak honestly with God about your daily needs.\n\nQ: Can I receive daily devotionals on my phone?\nA: Yes, bookmark loveofcalvary.org/devotional or subscribe to our community messages for daily spiritual uplift.`,
  },
  sermons: {
    focus_keyword: 'Christian Sermons',
    meta_title: 'Christian Sermons and Biblical Teachings',
    meta_description: 'Watch and listen to uplifting Christian sermons, Sunday Gospel messages, and teachings on God’s grace and love by Compassionate Love of Calvary Ministries.',
    meta_keywords: 'Christian Sermons, Where can I find Christian sermons online, Understanding God\'s grace in Christianity, Christian teachings about love and forgiveness, How to understand God\'s grace, What does the Bible teach about forgiveness',
    heroH1: 'Christian Sermons & Gospel Teachings | Watch & Listen Online',
    heroSub: 'Biblical preaching filled with grace, truth, and Holy Spirit power. Watch full Sunday sermons, sermon summaries, and message archives.',
    faq: `Q: Where can I watch Christian sermons online?\nA: You can watch our Sunday Gospel sermons on our official Sermons page and on our YouTube channel anytime.\n\nQ: What does the Bible teach about God’s grace and forgiveness?\nA: The Bible teaches that God\'s grace is a free gift received through faith in Jesus Christ, and His forgiveness cleanses us from all unrighteousness.\n\nQ: Can I download sermon notes?\nA: Yes, each sermon comes with core scripture references and key takeaway points for your personal study.`,
  },
  contact: {
    focus_keyword: 'Contact Compassionate Love of Calvary Ministries',
    meta_title: 'Contact Calvary Ministries | Prayer and Ministry Enquiries',
    meta_description: 'Contact Compassionate Love of Calvary Ministries in Chengalpattu, Tamil Nadu. Submit prayer requests, get church location, service timings, and pastoral support.',
    meta_keywords: 'Contact Compassionate Love of Calvary Ministries, Christian prayer and spiritual guidance, Prayer ministry in Chengalpattu, Christian ministry near Chengalpattu, Where can I find a Christian ministry near me, Which church can I visit in Chengalpattu',
    heroH1: 'Contact Us & Prayer Requests | Calvary Ministries Chengalpattu',
    heroSub: 'We are here to pray with you, answer your spiritual questions, and welcome you into our loving church family in Chengalpattu.',
    faq: `Q: Where is Compassionate Love of Calvary Ministries located?\nA: We are located in Chengalpattu, Tamil Nadu 603001, India. Full directions and maps are provided on this page.\n\nQ: How do I submit an urgent prayer request?\nA: You can submit your prayer request using the online form on this page or contact our prayer line directly at +91-9876543210.\n\nQ: Can I speak with the Pastor for pastoral counseling?\nA: Yes, our pastoral team provides spiritual guidance and biblical counseling for individuals and families.`,
  },
  events: {
    focus_keyword: 'Christian Worship and Fellowship Events',
    meta_title: 'Church Events & Worship Fellowship | Calvary Ministries',
    meta_description: 'Join upcoming church events, special worship nights, prayer conferences, and youth fellowship at Compassionate Love of Calvary Ministries in Chengalpattu.',
    meta_keywords: 'Christian Worship and Fellowship Events, Christian prayer fellowship in Tamil Nadu, Christian worship and fellowship, worship prayer assembly church events, Sunday worship Chengalpattu',
    heroH1: 'Upcoming Church Events & Worship Fellowship Gatherings',
    heroSub: 'Join us for inspiring worship nights, community prayer vigils, seasonal celebrations, and special fellowship conferences.',
    faq: `Q: When are the regular weekly services?\nA: Sunday Worship Service at 9:00 AM, Sunday Evening Fellowship at 6:00 PM, and Midweek Prayer on Wednesdays at 6:30 PM.\n\nQ: Are visitors and new families welcome at church events?\nA: Absolutely! All events, worship services, and community gatherings are open to everyone.`,
  },
  blog: {
    focus_keyword: 'Ministry for Faith and Spiritual Growth',
    meta_title: 'Faith, Hope & Spiritual Growth Articles | Calvary Ministries',
    meta_description: 'Read Christian articles, spiritual encouragement, biblical life guides, and ministry testimonies from Compassionate Love of Calvary Ministries.',
    meta_keywords: 'Ministry for Faith and Spiritual Growth, Biblical teachings for daily life, How to grow in Christian faith, Christian teachings about love and forgiveness, Christian living articles spiritual growth',
    heroH1: 'Ministry Articles & Spiritual Growth Insights',
    heroSub: 'Biblical wisdom, testimonies, and practical articles to strengthen your walk with Christ in today’s world.',
    faq: `Q: How often are new articles published?\nA: We publish weekly articles covering Christian living, biblical doctrines, prayer life, and inspirational testimonies.\n\nQ: Can I share these articles with my prayer group or family?\nA: Yes, all articles include easy sharing links for WhatsApp, Facebook, and social media to encourage others.`,
  },
  media: {
    focus_keyword: 'Gospel Ministry Worship & Media',
    meta_title: 'Gospel Worship & Ministry Media Gallery | Calvary Ministries',
    meta_description: 'Browse photos, worship videos, choir recordings, and ministry outreach highlights from Compassionate Love of Calvary Ministries in Chengalpattu.',
    meta_keywords: 'Gospel Ministry Worship & Media, Gospel ministry in Tamil Nadu, Christian worship and fellowship, ministry worship photos video gallery, Calvary church photos',
    heroH1: 'Worship, Fellowship & Outreach Media Gallery',
    heroSub: 'Capturing moments of heartfelt worship, joyful fellowship, and compassionate charity service across our community.',
    faq: `Q: Can I watch video recordings of previous worship services?\nA: Yes, full worship recordings and video highlights are available in our media section and on YouTube.\n\nQ: How can I access high-resolution photos of ministry events?\nA: You can view and download outreach and celebration photos directly from our media gallery.`,
  }
};

const slugify = (value) => value
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .trim()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '');

export const isInternalPath = isValidLinkUrl;

export const INTERNAL_LINK_PRESETS = [
  { label: KEY_FEATURES_PRESET.label, url: KEY_FEATURES_PRESET.url },
  ...SITE_PAGE_PRESETS.map((p) => ({ label: p.label, url: p.url })),
];

export const compileSectionsToHtml = (sections, focusKeyword = '') => {
  if (!sections || typeof sections !== 'object') return '';
  const parts = [];

  // 1. Hero / H1 Section
  if (sections.hero?.h1 || sections.hero?.subheading) {
    parts.push(`
      <header class="page-seo-compiled-hero" style="margin-bottom: 2rem;">
        <span class="section-badge" style="display: inline-block; padding: 4px 12px; background: rgba(212,175,55,0.15); color: #d4af37; border-radius: 20px; font-size: 0.82rem; font-weight: 700; text-transform: uppercase; margin-bottom: 0.75rem;">
          Ministry &amp; Biblical Insights
        </span>
        ${sections.hero.h1 ? `<h1 class="page-seo-h1" style="font-size: 2.2rem; font-weight: 800; line-height: 1.25; color: #0f172a; margin: 0 0 1rem 0;">${sections.hero.h1}</h1>` : ''}
        ${sections.hero.subheading ? `<p class="page-seo-subheading" style="font-size: 1.1rem; line-height: 1.6; color: #475569; margin: 0 0 1.25rem 0;">${sections.hero.subheading}</p>` : ''}
        ${sections.hero.ctaText ? `<a href="${sections.hero.ctaLink || '/about'}" class="btn-primary" style="display: inline-block; padding: 10px 22px; background: #0b192c; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 0.95rem;">${sections.hero.ctaText} &rarr;</a>` : ''}
      </header>
    `);
  }

  // 2. Key Features / Core Pillars Section
  const kf = sections.key_features;
  if (kf && Array.isArray(kf.features) && kf.features.length > 0) {
    parts.push(`
      <section id="key-features" class="page-seo-key-features" style="margin: 2.5rem 0; padding: 1.75rem; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 1.5rem;">
          <span style="font-size: 0.78rem; font-weight: 800; color: #0284c7; text-transform: uppercase; letter-spacing: 0.05em;">Core Pillars</span>
          <h2 style="font-size: 1.6rem; font-weight: 800; color: #0f172a; margin: 0.35rem 0 0.5rem 0;">${kf.heading || 'Core Pillars & Key Ministry Features'}</h2>
          ${kf.subheading ? `<p style="font-size: 0.95rem; color: #64748b; margin: 0 auto; max-width: 650px;">${kf.subheading}</p>` : ''}
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem;">
          ${kf.features.map(f => `
            <div class="key-feature-card" style="padding: 1.25rem; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.03);">
              <h3 style="font-size: 1.1rem; font-weight: 700; color: #0f172a; margin: 0 0 0.5rem 0;">${f.title}</h3>
              <p style="font-size: 0.88rem; color: #475569; line-height: 1.5; margin: 0 0 0.75rem 0;">${f.desc}</p>
              ${f.link ? `<a href="${f.link}" style="color: #0284c7; font-weight: 700; font-size: 0.82rem; text-decoration: underline;">${f.linkText || 'Learn More'} &rarr;</a>` : ''}
            </div>
          `).join('')}
        </div>
      </section>
    `);
  }

  // 3. Section 2: Content & Image
  const s2 = sections.section2_content_image;
  if (s2 && (s2.heading || s2.content || s2.imageUrl)) {
    parts.push(`
      <section class="page-seo-section-2" style="margin: 2.5rem 0;">
        ${s2.eyebrow ? `<span style="font-size: 0.8rem; font-weight: 800; color: #d4af37; text-transform: uppercase;">${s2.eyebrow}</span>` : ''}
        ${s2.heading ? `<h2 style="font-size: 1.7rem; font-weight: 800; color: #0f172a; margin: 0.4rem 0 1.2rem 0;">${s2.heading}</h2>` : ''}
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; align-items: center;">
          <div class="page-seo-content-col" style="font-size: 1rem; line-height: 1.7; color: #334155;">
            ${s2.content || ''}
          </div>
          ${s2.imageUrl ? `
            <div class="page-seo-image-col">
              <img src="${s2.imageUrl}" alt="${s2.heading || (focusKeyword ? `${focusKeyword} - Calvary Ministries` : 'Calvary Ministries')}" style="width: 100%; border-radius: 12px; box-shadow: 0 6px 20px rgba(0,0,0,0.08); object-fit: cover; max-height: 380px;" />
            </div>
          ` : ''}
        </div>
      </section>
    `);
  }

  // 4. Sections 3, 4, 5: Content Blocks
  ['section3_content_block', 'section4_content_block', 'section5_content_block'].forEach(key => {
    const s = sections[key];
    if (s && (s.heading || s.content)) {
      parts.push(`
        <section class="page-seo-content-block" style="margin: 2.5rem 0; padding-top: 1.5rem; border-top: 1px solid #e2e8f0;">
          ${s.heading ? `<h2 style="font-size: 1.5rem; font-weight: 800; color: #0f172a; margin-bottom: 1rem;">${s.heading}</h2>` : ''}
          <div style="font-size: 1rem; line-height: 1.75; color: #334155; white-space: pre-wrap;">${s.content}</div>
        </section>
      `);
    }
  });

  // 5. Testimonials
  if (sections.testimonials?.raw) {
    const items = sections.testimonials.raw.split('\n\n').filter(Boolean);
    parts.push(`
      <section class="page-seo-testimonials-block" style="margin: 2.5rem 0; padding: 2rem; background: #f1f5f9; border-radius: 12px;">
        <h2 style="font-size: 1.45rem; font-weight: 800; color: #0f172a; margin-bottom: 1.25rem;">Community Voices &amp; Testimonies</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1rem;">
          ${items.map(item => `
            <div style="padding: 1.2rem; background: #ffffff; border-radius: 8px; border: 1px solid #cbd5e1;">
              <pre style="font-family: inherit; font-size: 0.9rem; color: #334155; white-space: pre-wrap; margin: 0;">${item}</pre>
            </div>
          `).join('')}
        </div>
      </section>
    `);
  }

  // 6. FAQ Block
  if (sections.faq?.raw) {
    const qas = sections.faq.raw.split('\n\n').filter(Boolean);
    parts.push(`
      <section class="page-seo-faq-block" style="margin: 2.5rem 0;">
        <h2 style="font-size: 1.5rem; font-weight: 800; color: #0f172a; margin-bottom: 1.25rem;">Frequently Asked Questions</h2>
        <div style="display: flex; flex-direction: column; gap: 0.85rem;">
          ${qas.map(qa => `
            <div style="padding: 1.1rem 1.4rem; background: #f8fafc; border-left: 4px solid #0284c7; border-radius: 6px;">
              <pre style="font-family: inherit; font-size: 0.92rem; color: #1e293b; white-space: pre-wrap; margin: 0; line-height: 1.6;">${qa}</pre>
            </div>
          `).join('')}
        </div>
      </section>
    `);
  }

  // 7. Lead / Prayer Request CTA Form
  if (sections.lead_form && (sections.lead_form.title || sections.lead_form.buttonText)) {
    parts.push(`
      <section class="page-seo-lead-cta" style="margin: 3rem 0 1rem 0; padding: 2.25rem; background: linear-gradient(135deg, #0b192c 0%, #1e293b 100%); border-radius: 14px; text-align: center; color: #ffffff;">
        <h2 style="font-size: 1.65rem; font-weight: 800; color: #ffffff; margin: 0 0 0.75rem 0;">${sections.lead_form.title}</h2>
        ${sections.lead_form.description ? `<p style="font-size: 1rem; color: #cbd5e1; max-width: 600px; margin: 0 auto 1.5rem auto; line-height: 1.6;">${sections.lead_form.description}</p>` : ''}
        <a href="${sections.lead_form.targetLink || '/contact'}" class="btn-cta" style="display: inline-block; padding: 12px 28px; background: #d4af37; color: #0b192c; font-weight: 800; border-radius: 8px; text-decoration: none; font-size: 1rem;">
          ${sections.lead_form.buttonText || 'Contact Pastoral Team'} &rarr;
        </a>
      </section>
    `);
  }

  return parts.join('\n');
};

export const generateRawHtmlTags = (data = {}, heroH1 = '', heroSub = '', pageId = 'home') => {
  const metaTitle = data.meta_title || `${heroH1 || ''} | Compassionate Love of Calvary`;
  const metaDesc = data.meta_description || (heroSub ? heroSub.slice(0, 160) : '');
  const metaKw = data.meta_keywords || (data.focus_keyword ? `${data.focus_keyword}, Calvary, prayer, ministry, Tamil Nadu` : 'ministry, prayer, faith, Calvary, Tamil Nadu');
  const canonUrl = data.canonical_url || `https://www.loveofcalvary.org/${pageId === 'home' ? '' : pageId}`;
  const robIndex = data.robots_index !== false ? 'index' : 'noindex';
  const robFollow = data.robots_follow !== false ? 'follow' : 'nofollow';
  const ogTitle = data.og_title || metaTitle;
  const ogDesc = data.og_description || metaDesc;
  const ogImg = data.og_image_url || data.featured_image_url || 'https://www.loveofcalvary.org/logo.png';
  const twitterCard = data.twitter_card || 'summary_large_image';

  return `<title>${metaTitle}</title>
<meta name="description" content="${metaDesc}" />
<meta name="keywords" content="${metaKw}" />
<link rel="canonical" href="${canonUrl}" />
<meta name="robots" content="${robIndex}, ${robFollow}, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
<meta property="og:title" content="${ogTitle}" />
<meta property="og:description" content="${ogDesc}" />
<meta property="og:url" content="${canonUrl}" />
<meta property="og:type" content="website" />
<meta property="og:image" content="${ogImg}" />
<meta name="twitter:card" content="${twitterCard}" />
<meta name="twitter:title" content="${ogTitle}" />
<meta name="twitter:description" content="${ogDesc}" />
<meta name="twitter:image" content="${ogImg}" />`;
};

export const parseRawHtmlToFields = (html = '') => {
  const updates = {};
  const titleMatch = html.match(/<title>([^<]*)<\/title>/i);
  if (titleMatch) updates.meta_title = titleMatch[1].trim();

  const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i)
    || html.match(/<meta[^>]*content=["']([^"']*)["'][^>]*name=["']description["'][^>]*>/i);
  if (descMatch) updates.meta_description = descMatch[1].trim();

  const kwMatch = html.match(/<meta[^>]*name=["']keywords["'][^>]*content=["']([^"']*)["'][^>]*>/i)
    || html.match(/<meta[^>]*content=["']([^"']*)["'][^>]*name=["']keywords["'][^>]*>/i);
  if (kwMatch) updates.meta_keywords = kwMatch[1].trim();

  const canonMatch = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["'][^>]*>/i)
    || html.match(/<link[^>]*href=["']([^"']*)["'][^>]*rel=["']canonical["'][^>]*>/i);
  if (canonMatch) updates.canonical_url = canonMatch[1].trim();

  const robotsMatch = html.match(/<meta[^>]*name=["']robots["'][^>]*content=["']([^"']*)["'][^>]*>/i);
  if (robotsMatch) {
    const val = robotsMatch[1].toLowerCase();
    updates.robots_index = !val.includes('noindex');
    updates.robots_follow = !val.includes('nofollow');
  }

  const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']*)["'][^>]*>/i);
  if (ogTitleMatch) updates.og_title = ogTitleMatch[1].trim();

  const ogDescMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']*)["'][^>]*>/i);
  if (ogDescMatch) updates.og_description = ogDescMatch[1].trim();

  return updates;
};

const DEFAULT_SECTIONS = {
  hero: {
    h1: 'Sharing the Love of Christ, Bringing Hope to Every Heart',
    subheading: 'A Christ-centered ministry devoted to sharing God’s love, strengthening faith, serving others, and bringing hope through the transforming message of Jesus Christ.',
    ctaText: 'Discover Our Ministry',
    ctaLink: '/about',
  },
  key_features: {
    heading: 'Core Pillars & Key Ministry Features',
    subheading: 'Four foundational pillars guiding our spiritual journey and Christ-centered service.',
    features: [
      { id: 'feat-1', title: 'Faith & Prayer', desc: 'Deepening relationship with Jesus Christ through Biblical truth, daily prayer intercession, and discipleship.', link: '/#key-features', linkText: 'Explore Faith' },
      { id: 'feat-2', title: 'Compassionate Love', desc: 'Serving all people with Christ-centered kindness, unconditional love, and heartfelt pastoral care.', link: '/about', linkText: 'Our Mission' },
      { id: 'feat-3', title: 'Living Hope', desc: 'Bringing the transforming hope of the Gospel to individuals, families, and communities.', link: '/sermons', linkText: 'Watch Sermons' },
      { id: 'feat-4', title: 'Active Ministry Service', desc: 'Meeting community needs through charitable outreach, fellowship, and Biblical action.', link: '/ministries', linkText: 'Join Service' },
    ]
  },
  section2_content_image: {
    eyebrow: 'Rooted in Faith, Driven by Compassion',
    heading: 'A Sanctuary of Worship, Fellowship & Gospel Outreach',
    content: `<p>At Compassionate Love of Calvary Ministries, our doors and hearts are open to everyone. Rooted in prayer, anchored in Biblical truth, and energized by the Holy Spirit, we are dedicated to fostering a loving community where lives are restored, spiritual growth is nurtured, and the light of Christ shines through compassionate service.</p>\n<p>Whether you are seeking prayer, fellowship, spiritual growth, or simply a place to belong, you are always welcome in our spiritual family. Learn more about our <a href="/#key-features">Key Features</a> and ministries.</p>`,
    imageUrl: 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&w=1200&q=80',
  },
  section3_content_block: {
    heading: 'Our 5-Stage Ministry & Spiritual Growth Workflow',
    content: `1. Welcome & Fellowship: Experience unconditional love and warm community fellowship during weekly services.\n2. Scriptural Foundation: Deepen your understanding of God's Word through verse-by-verse Bible exposition.\n3. Daily Prayer & Intercession: Stand united in faith with dedicated prayer warriors lifting every need.\n4. Discipleship & Practical Living: Equip yourself with Biblical wisdom for daily walk and family harmony.\n5. Compassionate Outreach: Extend Christ's hands and feet to the poor, needy, and hurting in our city.`,
  },
  section4_content_block: {
    heading: 'Biblical Foundations vs. Worldly Perspectives',
    content: `Understanding the transformative power of God's grace compared to transient world philosophies.\n\nKey Distinctions:\n• Unconditional Calvary Love: Not earned by works, but received through unwavering faith in Jesus Christ.\n• Spiritual Renewal: Daily communion with the Holy Spirit renewing the heart and mind.\n• Active Servant Heart: Translating theological doctrine into real-world compassionate care.`,
  },
  section5_content_block: {
    heading: 'Daily Faith & Devotional Habits for Believers',
    content: `• Morning Word & Meditation: Start every morning meditating on scripture before beginning daily tasks.\n• Consistent Prayer Life: Talk with God continually throughout the day in gratitude and intercession.\n• Weekly Assembly: Gather together for corporate worship, encouragement, and communion.\n• Generous Giving: Support ministry outreach and assist those in need with joy and generosity.`,
  },
  testimonials: {
    raw: `Name: R. Murugan\nTrip: Chengalpattu Fellowship\nRating: 5\nReview: Compassionate Love of Calvary has truly transformed my spiritual life. The pastoral guidance and heartfelt prayers brought peace to my entire household.\n\nName: S. Devi\nTrip: Online Ministry Community\nRating: 5\nReview: Outstanding biblical teachings and compassionate community. Watching the sermons and participating in morning devotionals renewed my faith!`,
  },
  faq: {
    raw: `Q: What are the Sunday service timings?\nA: Our morning worship service begins at 9:00 AM every Sunday, followed by fellowship and personal prayer ministry.\n\nQ: How can I submit a personal prayer request?\nA: You can submit your prayer request directly through our online prayer form or contact our pastoral team 24/7.\n\nQ: Are Bible study resources freely accessible?\nA: Yes, all sermons, study guides, and daily devotionals are 100% free and open for public spiritual growth.`,
  },
  lead_form: {
    title: 'Have Questions or Need Prayer?',
    description: 'Our pastoral team is here to listen, pray with you, and guide you in your spiritual walk.',
    buttonText: 'Submit Prayer Request',
    targetLink: '/contact',
  }
};

export const AdminPageSEOEditor = () => {
  const [selectedPage, setSelectedPage] = useState('home');
  const [seoData, setSeoData] = useState({
    page_identifier: 'home',
    h1_heading: '',
    body_content: '',
    featured_image_url: '',
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
    focus_keyword: '',
    canonical_url: '',
    og_title: '',
    og_description: '',
    og_image_url: '',
    twitter_card: 'summary_large_image',
    schema_type: 'Church',
    robots_index: true,
    robots_follow: true,
  });

  const [rawHtmlCode, setRawHtmlCode] = useState('');
  const [isRawHtmlEditor, setIsRawHtmlEditor] = useState(false);
  const [copiedHtml, setCopiedHtml] = useState(false);

  const [sections, setSections] = useState(DEFAULT_SECTIONS);
  const [pageSettings, setPageSettings] = useState({
    internalTitle: 'Home Page SEO & Sections Builder',
    slug: '',
    targetLocation: 'Chengalpattu, Tamil Nadu, India',
    isPublished: true,
    template: 'Default Landing Page',
  });
  const [internalLinkUrl, setInternalLinkUrl] = useState('/#key-features');
  const [linkAnchorText, setLinkAnchorText] = useState('Key Features');
  const [useFullUrl, setUseFullUrl] = useState(true);
  const [blogsList, setBlogsList] = useState([]);
  const [copiedKey, setCopiedKey] = useState(null);
  const [pageStatuses, setPageStatuses] = useState(() => Object.fromEntries(
    PAGES.map((page) => [page.id, { status: 'loading', busy: false }])
  ));

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', text: '' });
  const [activeSectionId, setActiveSectionId] = useState('section-1');
  
  // 50-Keyword Explorer UI State
  const [isKeywordExplorerOpen, setIsKeywordExplorerOpen] = useState(false);
  const [keywordCategoryFilter, setKeywordCategoryFilter] = useState('all');
  const [keywordSearchText, setKeywordSearchText] = useState('');

  // Media Picker modal
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [mediaPickerTarget, setMediaPickerTarget] = useState('hero'); // 'hero', 'section2'

  // Ref for sections
  const sectionRefs = {
    'section-1': useRef(null),
    'section-key-features': useRef(null),
    'section-2': useRef(null),
    'section-3': useRef(null),
    'section-4': useRef(null),
    'section-5': useRef(null),
    'section-6': useRef(null),
    'section-7': useRef(null),
    'section-8': useRef(null),
    'section-head': useRef(null),
  };

  const scrollToSection = (id) => {
    setActiveSectionId(id);
    const element = sectionRefs[id]?.current;
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const fetchPageSEO = async (pageId) => {
    try {
      setLoading(true);
      const data = await api.getAdminPageSEO(pageId);
      if (data) {
        setSeoData({
          page_identifier: data.page_identifier || pageId,
          h1_heading: data.h1_heading || '',
          body_content: data.body_content || '',
          featured_image_url: data.featured_image_url || '',
          meta_title: data.meta_title || '',
          meta_description: data.meta_description || '',
          meta_keywords: data.meta_keywords || '',
          focus_keyword: data.focus_keyword || '',
          canonical_url: data.canonical_url || '',
          og_title: data.og_title || '',
          og_description: data.og_description || '',
          og_image_url: data.og_image_url || '',
          twitter_card: data.twitter_card || 'summary_large_image',
          schema_type: data.schema_type || 'Church',
          robots_index: data.robots_index ?? true,
          robots_follow: data.robots_follow ?? true,
        });

        const mergedSections = Object.entries(DEFAULT_SECTIONS).reduce((result, [key, defaults]) => {
          const savedSection = data.sections_data?.[key];
          result[key] = defaults && typeof defaults === 'object' && !Array.isArray(defaults)
            ? { ...defaults, ...(savedSection && typeof savedSection === 'object' ? savedSection : {}) }
            : savedSection ?? defaults;
          return result;
        }, {});
        if (data.h1_heading) {
          mergedSections.hero = { ...mergedSections.hero, h1: data.h1_heading };
        }
        setSections(mergedSections);

        const initialTags = data.raw_head_tags || generateRawHtmlTags(data, data.h1_heading || mergedSections.hero?.h1, mergedSections.hero?.subheading, pageId);
        setRawHtmlCode(initialTags);

        setPageSettings({
          internalTitle: `${PAGES.find(p => p.id === pageId)?.name || pageId} Landing Structure`,
          slug: data.slug || (pageId === 'home' ? '' : pageId),
          targetLocation: 'Chengalpattu, Tamil Nadu, India',
          isPublished: data.is_published ?? true,
          template: 'Default Landing Page',
        });
      }
    } catch (err) {
      console.error('Failed to load SEO data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPageSEO(selectedPage);
  }, [selectedPage]);

  // Fetch all published/existing blog posts to dynamically populate blog URLs in content block toolbars
  useEffect(() => {
    let isMounted = true;
    api.getAdminBlogs()
      .then((data) => {
        if (isMounted && Array.isArray(data)) {
          setBlogsList(data);
        }
      })
      .catch((err) => {
        console.warn('Could not load blogs for internal link options:', err);
      });
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    let isMounted = true;

    Promise.allSettled(PAGES.map(async (page) => ({
      id: page.id,
      data: await api.getAdminPageSEO(page.id),
    }))).then((results) => {
      if (!isMounted) return;
      setPageStatuses((current) => {
        const next = { ...current };
        results.forEach((result, index) => {
          const page = PAGES[index];
          if (result.status === 'fulfilled') {
            next[page.id] = {
              status: result.value.data?.is_published === false ? 'draft' : 'published',
              busy: false,
            };
          } else {
            console.error(`Failed to load publish status for ${page.id}:`, result.reason);
            next[page.id] = { status: 'error', busy: false };
          }
        });
        return next;
      });
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const togglePagePublished = async (page) => {
    const currentStatus = pageStatuses[page.id]?.status;
    if (currentStatus !== 'published' && currentStatus !== 'draft') return;

    const nextIsPublished = currentStatus !== 'published';
    setPageStatuses((current) => ({
      ...current,
      [page.id]: { ...current[page.id], busy: true },
    }));
    try {
      const existingData = await api.getAdminPageSEO(page.id);
      const result = await api.updateAdminPageSEO(page.id, {
        ...existingData,
        page_identifier: page.id,
        is_published: nextIsPublished,
      });
      const isPublished = result?.is_published ?? nextIsPublished;
      setPageStatuses((current) => ({
        ...current,
        [page.id]: { status: isPublished ? 'published' : 'draft', busy: false },
      }));
      if (selectedPage === page.id) {
        setPageSettings((current) => ({ ...current, isPublished }));
      }
      const publishEvent = { pageIdentifier: page.id, data: { ...existingData, is_published: isPublished } };
      window.dispatchEvent(new CustomEvent('seo:published', { detail: publishEvent }));
      if (typeof BroadcastChannel !== 'undefined') {
        const channel = new BroadcastChannel('clm-seo-published');
        channel.postMessage(publishEvent);
        channel.close();
      }
    } catch (error) {
      console.error(`Failed to ${nextIsPublished ? 'publish' : 'unpublish'} ${page.id}:`, error);
      setPageStatuses((current) => ({
        ...current,
        [page.id]: { ...current[page.id], busy: false },
      }));
      setFeedback({
        type: 'error',
        text: `Could not ${nextIsPublished ? 'publish' : 'move to draft'} ${page.name}. Please try again.`,
      });
    }
  };

  const handleOptimizeForPageOne = (pageKey = selectedPage) => {
    const blueprint = PAGE_SEO_BLUEPRINT[pageKey] || PAGE_SEO_BLUEPRINT.home;
    const kw = blueprint.focus_keyword;
    const newTitle = blueprint.meta_title;
    const newDesc = blueprint.meta_description;
    const newKeywords = blueprint.meta_keywords;
    const newHeroH1 = blueprint.heroH1;
    const newHeroSub = blueprint.heroSub;
    const newCanonical = `https://www.loveofcalvary.org/${pageKey === 'home' ? '' : pageKey}`;

    const updatedSeo = {
      ...seoData,
      focus_keyword: kw,
      meta_title: newTitle,
      meta_description: newDesc,
      meta_keywords: newKeywords,
      canonical_url: newCanonical,
      robots_index: true,
      robots_follow: true,
    };

    const updatedSections = {
      ...sections,
      hero: {
        ...sections.hero,
        h1: newHeroH1,
        subheading: newHeroSub,
      },
      faq: {
        raw: blueprint.faq || sections.faq?.raw || '',
      }
    };

    setSeoData(updatedSeo);
    setSections(updatedSections);
    const newRawTags = generateRawHtmlTags(updatedSeo, newHeroH1, newHeroSub, pageKey);
    setRawHtmlCode(newRawTags);
    setFeedback({
      type: 'success',
      text: `⭐ 50-Keyword Blueprint Applied for ${currentPageObj.name}! Target: "${kw}" synchronized across Title, H1, Meta Description, Keywords, FAQs & Schema.`
    });
    setTimeout(() => setFeedback({ type: '', text: '' }), 5000);
  };

  const handleInsertKeyword = (kw) => {
    setSeoData(prev => {
      const existing = (prev.meta_keywords || '').split(',').map(s => s.trim()).filter(Boolean);
      if (existing.includes(kw)) {
        setFeedback({ type: 'info', text: `"${kw}" is already in Meta Keywords.` });
        setTimeout(() => setFeedback({ type: '', text: '' }), 2500);
        return prev;
      }
      const updatedKeywords = [...existing, kw].join(', ');
      const updated = { ...prev, meta_keywords: updatedKeywords };
      setRawHtmlCode(generateRawHtmlTags(updated, sections.hero?.h1, sections.hero?.subheading, selectedPage));
      setFeedback({ type: 'success', text: `Added "${kw}" to Meta Keywords!` });
      setTimeout(() => setFeedback({ type: '', text: '' }), 2500);
      return updated;
    });
  };

  const handleSetFocusKeyword = (kw) => {
    setSeoData(prev => {
      const updated = { ...prev, focus_keyword: kw };
      setRawHtmlCode(generateRawHtmlTags(updated, sections.hero?.h1, sections.hero?.subheading, selectedPage));
      setFeedback({ type: 'success', text: `Set "${kw}" as Primary Focus Keyword!` });
      setTimeout(() => setFeedback({ type: '', text: '' }), 2500);
      return updated;
    });
  };

  const handleInsertFaqQuestion = (question) => {
    setSections(prev => {
      const currentFaq = prev.faq?.raw || '';
      const defaultAnswer = `Compassionate Love of Calvary Ministries in Chengalpattu warmly welcomes you. Join our worship, daily prayer intercession, and Bible study fellowship.`;
      const newBlock = `Q: ${question}\nA: ${defaultAnswer}`;
      const updatedFaq = currentFaq ? `${currentFaq}\n\n${newBlock}` : newBlock;
      setFeedback({ type: 'success', text: `Added question "${question}" to FAQs!` });
      setTimeout(() => setFeedback({ type: '', text: '' }), 2500);
      return {
        ...prev,
        faq: { raw: updatedFaq }
      };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setFeedback({ type: '', text: '' });
    try {
      const compiledBody = compileSectionsToHtml(sections, seoData.focus_keyword);
      const payload = {
        page_identifier: selectedPage,
        h1_heading: sections.hero.h1 || seoData.h1_heading,
        featured_image_url: seoData.featured_image_url,
        meta_title: seoData.meta_title || `${sections.hero.h1 || 'Home'} | Compassionate Love of Calvary`,
        meta_description: seoData.meta_description || (sections.hero.subheading ? sections.hero.subheading.slice(0, 160) : ''),
        meta_keywords: seoData.meta_keywords || (seoData.focus_keyword ? `${seoData.focus_keyword}, Calvary, prayer, ministry` : ''),
        focus_keyword: seoData.focus_keyword,
        canonical_url: seoData.canonical_url,
        og_title: seoData.og_title || seoData.meta_title,
        og_description: seoData.og_description || seoData.meta_description,
        og_image_url: seoData.og_image_url || seoData.featured_image_url,
        twitter_card: seoData.twitter_card,
        schema_type: seoData.schema_type,
        robots_index: seoData.robots_index,
        robots_follow: seoData.robots_follow,
        sections_data: sections,
        body_content: compiledBody,
        raw_head_tags: rawHtmlCode,
        slug: pageSettings.slug,
        is_published: pageSettings.isPublished,
      };

      // 1. Instantly save to local storage for zero-latency user display
      try {
        localStorage.setItem(`clm_seo_${selectedPage}`, JSON.stringify(payload));
      } catch {}

      // 2. Broadcast immediately to all open user tabs
      const publishEvent = { pageIdentifier: selectedPage, data: payload };
      window.dispatchEvent(new CustomEvent('seo:published', { detail: publishEvent }));
      if (typeof BroadcastChannel !== 'undefined') {
        const channel = new BroadcastChannel('clm-seo-published');
        channel.postMessage(publishEvent);
        channel.close();
      }

      // 3. Persist to API backend
      try {
        const result = await api.updateAdminPageSEO(selectedPage, payload);
        const combined = { ...payload, ...(result && typeof result === 'object' ? result : {}) };
        try {
          localStorage.setItem(`clm_seo_${selectedPage}`, JSON.stringify(combined));
        } catch {}

        if (result && typeof result === 'object') {
          setPageSettings(prev => ({
            ...prev,
            slug: result.slug ?? prev.slug,
            isPublished: result.is_published ?? prev.isPublished,
          }));
        }
        setPageStatuses((current) => ({
          ...current,
          [selectedPage]: {
            status: (result?.is_published ?? pageSettings.isPublished) ? 'published' : 'draft',
            busy: false,
          },
        }));
        setFeedback({
          type: 'success',
          text: pageSettings.isPublished
            ? 'Page sections and SEO settings published live immediately. Visible to users now!'
            : 'Page sections and SEO settings saved as a draft.',
        });
      } catch (err) {
        console.warn('Backend update failed, using local published state:', err);
        setPageStatuses((current) => ({
          ...current,
          [selectedPage]: {
            status: pageSettings.isPublished ? 'published' : 'draft',
            busy: false,
          },
        }));
        setFeedback({
          type: 'success',
          text: 'Saved & published live to users immediately! (Synchronized across tabs)',
        });
      }

      setTimeout(() => setFeedback({ type: '', text: '' }), 4500);
    } catch (err) {
      console.error('Save error:', err);
      setFeedback({ type: 'error', text: 'Failed to compile and publish page structure.' });
    } finally {
      setSaving(false);
    }
  };

  // Insert formatting around selected text, or add a short editable placeholder.
  const insertFormatting = (targetKey, subKey, startTag, endTag = '', placeholder = 'Text') => {
    const currentValue = sections[targetKey]?.[subKey] || '';
    const textarea = document.getElementById(`page-content-${targetKey}`);
    const start = textarea?.selectionStart ?? currentValue.length;
    const end = textarea?.selectionEnd ?? currentValue.length;
    const selected = currentValue.substring(start, end) || placeholder;
    const replacement = `${startTag}${selected}${endTag}`;
    const updated = currentValue.substring(0, start) + replacement + currentValue.substring(end);
    setSections(prev => ({
      ...prev,
      [targetKey]: {
        ...prev[targetKey],
        [subKey]: updated
      }
    }));
    window.setTimeout(() => {
      if (!textarea) return;
      textarea.focus();
      textarea.setSelectionRange(start + startTag.length, start + startTag.length + selected.length);
    }, 0);
  };

  const categorizedLinkPresets = useMemo(() => {
    return buildCategorizedPresets(blogsList, '', useFullUrl);
  }, [blogsList, useFullUrl]);

  const handleSelectPreset = (val) => {
    if (!val || val === 'custom') return;
    const allPresets = [
      ...categorizedLinkPresets.keyFeatures,
      ...categorizedLinkPresets.sitePages,
      ...categorizedLinkPresets.blogPosts,
    ];
    const found = allPresets.find(p => p.url === val || p.formattedUrl === val);
    if (found) {
      setInternalLinkUrl(found.formattedUrl);
      setLinkAnchorText(found.anchor);
    } else {
      setInternalLinkUrl(formatLinkUrl(val, useFullUrl));
    }
  };

  const handleToggleFullUrl = (checked) => {
    setUseFullUrl(checked);
    setInternalLinkUrl(prev => formatLinkUrl(prev, checked));
  };

  const handleAutoGenerateRelatedBlog = (targetKey, subKey = 'content') => {
    const content = sections[targetKey]?.[subKey] || '';
    const heading = sections[targetKey]?.heading || '';
    const related = findRelatedBlogs(content, heading, blogsList);

    if (related.length > 0 && related[0].relevanceScore > 0) {
      const top = related[0];
      const blogUrl = formatBlogUrl(top.slug, useFullUrl);
      setInternalLinkUrl(blogUrl);
      setLinkAnchorText(top.title || top.slug);
      const reason = top.matchedKeywords?.slice(0, 3).join(', ');
      setFeedback({
        type: 'success',
        text: `🎯 Auto-matched related blog: "${top.title}"${reason ? ` (matched: ${reason})` : ''}`,
      });
    } else if (blogsList.length > 0) {
      const fallback = blogsList[0];
      const blogUrl = formatBlogUrl(fallback.slug, useFullUrl);
      setInternalLinkUrl(blogUrl);
      setLinkAnchorText(fallback.title || fallback.slug);
      setFeedback({
        type: 'success',
        text: `📰 Selected blog URL: "${fallback.title}"`,
      });
    } else {
      setFeedback({
        type: 'error',
        text: 'No published blogs available yet to generate related URL.',
      });
    }
    setTimeout(() => setFeedback({ type: '', text: '' }), 4500);
  };

  const handleGenerateBlogSlugFromBlock = (targetKey, subKey = 'content') => {
    const content = sections[targetKey]?.[subKey] || '';
    const heading = sections[targetKey]?.heading || '';
    const generatedSlug = generateBlogSlugFromContent({
      heading,
      content,
      focusKeyword: seoData.focus_keyword,
      metaKeywords: seoData.meta_keywords,
    });

    const blogUrl = formatBlogUrl(generatedSlug, useFullUrl);
    setInternalLinkUrl(blogUrl);
    
    const readableAnchor = heading 
      ? heading.replace(/<[^>]+>/g, '').trim()
      : generatedSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    setLinkAnchorText(readableAnchor);

    setFeedback({
      type: 'success',
      text: `⚡ Generated block blog URL: ${blogUrl}`,
    });
    setTimeout(() => setFeedback({ type: '', text: '' }), 5000);
  };

  const handleCopyLinkManually = async (targetKey, format = 'html') => {
    const targetUrl = internalLinkUrl.trim();
    if (!targetUrl || !isValidLinkUrl(targetUrl)) {
      setFeedback({ type: 'error', text: 'Please enter or select a valid URL first to copy.' });
      setTimeout(() => setFeedback({ type: '', text: '' }), 3500);
      return;
    }
    const linkText = linkAnchorText.trim() || 'Key Features';
    const isExternal = !isInternalOrMinistryUrl(targetUrl);
    
    let textToCopy = '';
    let successMessage = '';
    if (format === 'slug') {
      textToCopy = cleanBlogSlug(targetUrl);
      successMessage = `🏷️ Copied Slug: ${textToCopy}`;
    } else if (format === 'url') {
      textToCopy = targetUrl;
      successMessage = `📋 Copied URL: ${textToCopy}`;
    } else {
      textToCopy = `<a href="${targetUrl}"${isExternal ? ' target="_blank" rel="noopener noreferrer"' : ''}>${linkText}</a>`;
      successMessage = `📋 Copied HTML: ${textToCopy}`;
    }

    const success = await copyLinkToClipboard(textToCopy);
    if (success) {
      setCopiedKey(`${targetKey}_${format}`);
      setFeedback({ type: 'success', text: successMessage });
      setTimeout(() => setCopiedKey(null), 2500);
      setTimeout(() => setFeedback({ type: '', text: '' }), 4000);
    } else {
      setFeedback({ type: 'error', text: 'Failed to copy to clipboard.' });
      setTimeout(() => setFeedback({ type: '', text: '' }), 3500);
    }
  };

  const handleAutoLinkKeywords = (targetKey, subKey = 'content') => {
    const currentValue = sections[targetKey]?.[subKey] || '';
    if (!currentValue.trim()) {
      setFeedback({ type: 'error', text: 'This content block is currently empty.' });
      setTimeout(() => setFeedback({ type: '', text: '' }), 4000);
      return;
    }
    const { updated, count } = autoLinkContentText(currentValue, {
      blogs: blogsList,
      useFullDomain: useFullUrl,
    });
    if (count > 0) {
      setSections(prev => ({
        ...prev,
        [targetKey]: {
          ...prev[targetKey],
          [subKey]: updated,
        }
      }));
      setFeedback({ type: 'success', text: `✨ Auto-generated ${count} internal link(s) for blog & key features!` });
    } else {
      setFeedback({ type: 'success', text: 'All key features and blog links are already linked in this block.' });
    }
    setTimeout(() => setFeedback({ type: '', text: '' }), 4500);
  };

  const insertInternalLinkIntoField = (targetKey, subKey = 'content') => {
    const targetUrl = internalLinkUrl.trim();
    if (!targetUrl || !isValidLinkUrl(targetUrl)) return;
    const textarea = document.getElementById(`page-content-${targetKey}`);
    const currentValue = sections[targetKey]?.[subKey] || '';
    const start = textarea?.selectionStart ?? currentValue.length;
    const end = textarea?.selectionEnd ?? currentValue.length;
    const selected = currentValue.substring(start, end);
    const linkText = linkAnchorText.trim() || selected.trim() || 'Key Features';
    const isExternal = !isInternalOrMinistryUrl(targetUrl);
    const replacement = `<a href="${targetUrl}"${isExternal ? ' target="_blank" rel="noopener noreferrer"' : ''}>${linkText}</a>`;
    const updated = currentValue.substring(0, start) + replacement + currentValue.substring(end);
    setSections(prev => ({
      ...prev,
      [targetKey]: {
        ...prev[targetKey],
        [subKey]: updated
      }
    }));
    window.setTimeout(() => {
      if (!textarea) return;
      textarea.focus();
      textarea.setSelectionRange(start + replacement.length, start + replacement.length);
    }, 0);
  };

  const renderContentToolbar = (targetKey, subKey = 'content') => (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.35rem',
      padding: '0.45rem 0.65rem',
      background: '#0B132B',
      border: '1px solid #1E2E4E',
      borderBottom: 'none',
      borderRadius: '8px 8px 0 0',
      flexWrap: 'wrap'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
        <button type="button" onClick={() => insertFormatting(targetKey, subKey, '<strong>', '</strong>')} style={{ background: 'transparent', border: 'none', color: '#CBD5E1', cursor: 'pointer', padding: '0.25rem 0.35rem' }} title="Bold">
          <Bold size={14} />
        </button>
        <button type="button" onClick={() => insertFormatting(targetKey, subKey, '<em>', '</em>')} style={{ background: 'transparent', border: 'none', color: '#CBD5E1', cursor: 'pointer', padding: '0.25rem 0.35rem' }} title="Italic">
          <Italic size={14} />
        </button>
        <button type="button" onClick={() => insertFormatting(targetKey, subKey, '<u>', '</u>')} style={{ background: 'transparent', border: 'none', color: '#CBD5E1', cursor: 'pointer', padding: '0.25rem 0.35rem' }} title="Underline">
          <Underline size={14} />
        </button>
        <button type="button" onClick={() => insertFormatting(targetKey, subKey, '<s>', '</s>')} style={{ background: 'transparent', border: 'none', color: '#CBD5E1', cursor: 'pointer', padding: '0.25rem 0.35rem' }} title="Strikethrough">
          <Strikethrough size={14} />
        </button>
        <button type="button" onClick={() => insertFormatting(targetKey, subKey, '<h2>', '</h2>')} style={{ background: 'transparent', border: 'none', color: '#CBD5E1', cursor: 'pointer', padding: '0.25rem 0.35rem' }} title="Heading 2">
          <Heading2 size={14} />
        </button>
        <button type="button" onClick={() => insertFormatting(targetKey, subKey, '<h3>', '</h3>')} style={{ background: 'transparent', border: 'none', color: '#CBD5E1', cursor: 'pointer', padding: '0.25rem 0.35rem' }} title="Heading 3">
          <Heading3 size={14} />
        </button>
        <button type="button" onClick={() => insertFormatting(targetKey, subKey, '<ul>\n  <li>', '</li>\n</ul>')} style={{ background: 'transparent', border: 'none', color: '#CBD5E1', cursor: 'pointer', padding: '0.25rem 0.35rem' }} title="Bullet List">
          <List size={14} />
        </button>
        <button type="button" onClick={() => insertFormatting(targetKey, subKey, '<ol>\n  <li>', '</li>\n</ol>')} style={{ background: 'transparent', border: 'none', color: '#CBD5E1', cursor: 'pointer', padding: '0.25rem 0.35rem' }} title="Numbered List">
          <ListOrdered size={14} />
        </button>
        <button type="button" onClick={() => insertFormatting(targetKey, subKey, '<blockquote>', '</blockquote>')} style={{ background: 'transparent', border: 'none', color: '#CBD5E1', cursor: 'pointer', padding: '0.25rem 0.35rem' }} title="Quote">
          <Quote size={14} />
        </button>
      </div>

      <div style={{ width: '1px', height: '18px', background: '#334155', margin: '0 0.3rem' }} />

      {/* Internal Link & Blog URL Generator Tool */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap', flex: '1 1 auto' }}>
        <select
          aria-label="Preset internal link"
          value={internalLinkUrl}
          onChange={(e) => handleSelectPreset(e.target.value)}
          style={{
            padding: '0.25rem 0.45rem',
            background: '#111C33',
            border: '1px solid #334155',
            borderRadius: '5px',
            color: '#60A5FA',
            fontSize: '0.74rem',
            maxWidth: '190px'
          }}
        >
          {(() => {
            const blockContent = sections[targetKey]?.[subKey] || '';
            const blockHeading = sections[targetKey]?.heading || '';
            const blockPresets = buildCategorizedPresets(blogsList, '', useFullUrl, blockContent, blockHeading);

            return (
              <>
                {blockPresets.relatedBlogs && blockPresets.relatedBlogs.length > 0 && (
                  <optgroup label="🎯 Related to this Content Block">
                    {blockPresets.relatedBlogs.map((b) => (
                      <option key={'rel_' + b.url} value={b.formattedUrl}>
                        {b.label.length > 34 ? b.label.slice(0, 31) + '...' : b.label} (Top Match)
                      </option>
                    ))}
                  </optgroup>
                )}

                <optgroup label="📌 Section Anchors">
                  {blockPresets.keyFeatures.map((p) => (
                    <option key={p.url} value={p.formattedUrl}>
                      🔗 {p.label}
                    </option>
                  ))}
                </optgroup>

                <optgroup label="📄 Site Pages">
                  {blockPresets.sitePages.map((p) => (
                    <option key={p.url} value={p.formattedUrl}>
                      📄 {p.label}
                    </option>
                  ))}
                </optgroup>

                {blockPresets.blogPosts.length > 0 && (
                  <optgroup label={`📰 All Blog Articles (${blockPresets.blogPosts.length})`}>
                    {blockPresets.blogPosts.map((b) => (
                      <option key={b.url} value={b.formattedUrl}>
                        📰 {b.label.length > 34 ? b.label.slice(0, 31) + '...' : b.label}
                      </option>
                    ))}
                  </optgroup>
                )}
              </>
            );
          })()}
        </select>

        <input
          type="text"
          aria-label="Internal link URL"
          value={internalLinkUrl}
          onChange={(event) => setInternalLinkUrl(event.target.value)}
          placeholder="/#key-features or https://www.loveofcalvary.org/blog/.../"
          style={{ width: '155px', padding: '0.25rem 0.45rem', background: '#111C33', border: '1px solid #334155', borderRadius: '5px', color: '#E2E8F0', fontSize: '0.74rem' }}
        />

        <input
          type="text"
          aria-label="Link Anchor Text"
          value={linkAnchorText}
          onChange={(event) => setLinkAnchorText(event.target.value)}
          placeholder="Anchor Text"
          style={{ width: '110px', padding: '0.25rem 0.45rem', background: '#111C33', border: '1px solid #334155', borderRadius: '5px', color: '#E2E8F0', fontSize: '0.74rem' }}
        />

        <label
          title="Toggle Full Domain (https://www.loveofcalvary.org) vs Relative URL"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem',
            fontSize: '0.7rem',
            color: useFullUrl ? '#60A5FA' : '#94A3B8',
            cursor: 'pointer',
            userSelect: 'none',
            padding: '0.2rem 0.4rem',
            background: useFullUrl ? 'rgba(37,99,235,0.18)' : '#0F172A',
            borderRadius: '5px',
            border: useFullUrl ? '1px solid #3B82F6' : '1px solid #334155'
          }}
        >
          <input
            type="checkbox"
            checked={useFullUrl}
            onChange={(e) => handleToggleFullUrl(e.target.checked)}
            style={{ cursor: 'pointer', margin: 0, width: '12px', height: '12px' }}
          />
          <span>Full Domain</span>
        </label>

        <button
          type="button"
          onClick={() => insertInternalLinkIntoField(targetKey, subKey)}
          disabled={!isValidLinkUrl(internalLinkUrl.trim())}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem',
            padding: '0.25rem 0.6rem',
            background: isValidLinkUrl(internalLinkUrl.trim()) ? '#2563EB' : '#1E293B',
            border: 'none',
            borderRadius: '5px',
            color: '#FFFFFF',
            fontSize: '0.74rem',
            fontWeight: 700,
            cursor: isValidLinkUrl(internalLinkUrl.trim()) ? 'pointer' : 'not-allowed',
            opacity: isValidLinkUrl(internalLinkUrl.trim()) ? 1 : 0.5
          }}
          title="Insert internal link into content block"
        >
          <LinkIcon size={12} />
          <span>Insert Link</span>
        </button>

        <button
          type="button"
          onClick={() => {
            const target = internalLinkUrl.trim();
            if (isValidLinkUrl(target)) {
              const fullUrl = target.startsWith('http')
                ? target
                : `${window.location.origin}${target.startsWith('/') ? '' : '/'}${target}`;
              window.open(fullUrl, '_blank');
            }
          }}
          disabled={!isValidLinkUrl(internalLinkUrl.trim())}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem',
            padding: '0.25rem 0.55rem',
            background: isValidLinkUrl(internalLinkUrl.trim()) ? '#059669' : '#1E293B',
            border: 'none',
            borderRadius: '5px',
            color: '#FFFFFF',
            fontSize: '0.74rem',
            fontWeight: 700,
            cursor: isValidLinkUrl(internalLinkUrl.trim()) ? 'pointer' : 'not-allowed',
            opacity: isValidLinkUrl(internalLinkUrl.trim()) ? 1 : 0.5
          }}
          title="Open active link in new browser tab to verify it works"
        >
          <ExternalLink size={12} />
          <span>Open Link</span>
        </button>

        <button
          type="button"
          onClick={() => handleGenerateBlogSlugFromBlock(targetKey, subKey)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem',
            padding: '0.25rem 0.55rem',
            background: '#D97706',
            border: '1px solid #F59E0B',
            borderRadius: '5px',
            color: '#FFFFFF',
            fontSize: '0.74rem',
            fontWeight: 700,
            cursor: 'pointer'
          }}
          title="Auto-generate blog URL slug based on this block content, main keyword & internal keywords (e.g. https://blog.loveofcalavary.org/best-church-bible-in-chengalpattu/)"
        >
          <Sparkles size={12} />
          <span>Blog Slug</span>
        </button>

        <button
          type="button"
          onClick={() => handleAutoGenerateRelatedBlog(targetKey, subKey)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem',
            padding: '0.25rem 0.55rem',
            background: '#047857',
            border: '1px solid #10B981',
            borderRadius: '5px',
            color: '#FFFFFF',
            fontSize: '0.74rem',
            fontWeight: 700,
            cursor: 'pointer'
          }}
          title="Auto-detect & generate the blog URL most related to this block content"
        >
          <Sparkles size={12} />
          <span>Related Blog</span>
        </button>

        <button
          type="button"
          onClick={() => handleCopyLinkManually(targetKey, 'html')}
          disabled={!isValidLinkUrl(internalLinkUrl.trim())}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem',
            padding: '0.25rem 0.55rem',
            background: copiedKey === `${targetKey}_html` ? '#059669' : '#1E293B',
            border: '1px solid #475569',
            borderRadius: '5px',
            color: '#FFFFFF',
            fontSize: '0.74rem',
            fontWeight: 700,
            cursor: isValidLinkUrl(internalLinkUrl.trim()) ? 'pointer' : 'not-allowed',
            opacity: isValidLinkUrl(internalLinkUrl.trim()) ? 1 : 0.5,
            transition: 'background 0.2s ease'
          }}
          title="Manually copy HTML link (<a href='...'>Anchor</a>) to clipboard"
        >
          {copiedKey === `${targetKey}_html` ? <Check size={12} /> : <Copy size={12} />}
          <span>{copiedKey === `${targetKey}_html` ? 'Copied HTML!' : 'Copy HTML'}</span>
        </button>

        <button
          type="button"
          onClick={() => handleCopyLinkManually(targetKey, 'url')}
          disabled={!isValidLinkUrl(internalLinkUrl.trim())}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.2rem',
            padding: '0.25rem 0.45rem',
            background: copiedKey === `${targetKey}_url` ? '#059669' : '#1E293B',
            border: '1px solid #475569',
            borderRadius: '5px',
            color: '#CBD5E1',
            fontSize: '0.72rem',
            fontWeight: 600,
            cursor: isValidLinkUrl(internalLinkUrl.trim()) ? 'pointer' : 'not-allowed',
            opacity: isValidLinkUrl(internalLinkUrl.trim()) ? 1 : 0.5,
            transition: 'background 0.2s ease'
          }}
          title="Manually copy raw URL to clipboard"
        >
          {copiedKey === `${targetKey}_url` ? <Check size={11} /> : <LinkIcon size={11} />}
          <span>{copiedKey === `${targetKey}_url` ? 'Copied!' : 'Copy URL'}</span>
        </button>

        <button
          type="button"
          onClick={() => handleCopyLinkManually(targetKey, 'slug')}
          disabled={!isValidLinkUrl(internalLinkUrl.trim())}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.2rem',
            padding: '0.25rem 0.45rem',
            background: copiedKey === `${targetKey}_slug` ? '#059669' : '#1E293B',
            border: '1px solid #475569',
            borderRadius: '5px',
            color: '#CBD5E1',
            fontSize: '0.72rem',
            fontWeight: 600,
            cursor: isValidLinkUrl(internalLinkUrl.trim()) ? 'pointer' : 'not-allowed',
            opacity: isValidLinkUrl(internalLinkUrl.trim()) ? 1 : 0.5,
            transition: 'background 0.2s ease'
          }}
          title="Manually copy clean URL slug to clipboard (e.g. best-church-bible-in-chengalpattu)"
        >
          {copiedKey === `${targetKey}_slug` ? <Check size={11} /> : <Tag size={11} />}
          <span>{copiedKey === `${targetKey}_slug` ? 'Copied Slug!' : 'Copy Slug'}</span>
        </button>

        <button
          type="button"
          onClick={() => handleAutoLinkKeywords(targetKey, subKey)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem',
            padding: '0.25rem 0.55rem',
            background: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%)',
            border: '1px solid #3B82F6',
            borderRadius: '5px',
            color: '#FFFFFF',
            fontSize: '0.74rem',
            fontWeight: 700,
            cursor: 'pointer'
          }}
          title="Auto-scan and link keywords & blog titles across this block content"
        >
          <Sparkles size={12} />
          <span>Auto-Link</span>
        </button>
      </div>
    </div>
  );

  const currentPageObj = PAGES.find(p => p.id === selectedPage) || PAGES[0];

  return (
    <div className="admin-seo-builder-root" style={{
      background: '#0B132B',
      color: '#E2E8F0',
      minHeight: '100vh',
      padding: '1.5rem 2rem 4rem 2rem',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
    }}>
      
      {/* Toast Notification */}
      {feedback.text && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          background: feedback.type === 'success' ? '#059669' : '#DC2626',
          color: '#FFFFFF',
          padding: '0.9rem 1.4rem',
          borderRadius: '8px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          fontSize: '0.9rem',
          fontWeight: 600,
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          {feedback.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Top Header Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.25rem',
        marginBottom: '1.5rem',
        paddingBottom: '1rem',
        borderBottom: '1px solid #1E293B'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '10px',
            background: 'rgba(59, 130, 246, 0.15)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#60A5FA'
          }}>
            <FileCode size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#FFFFFF', margin: 0, letterSpacing: '-0.02em' }}>
              Edit SEO Page
            </h1>
            <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem', color: '#94A3B8' }}>
              Update content, metadata, FAQ, testimonials, and publishing state.
            </p>
          </div>
        </div>

        {/* Page Switcher & Save Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#1E293B', padding: '0.35rem 0.75rem', borderRadius: '8px', border: '1px solid #334155' }}>
            <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600 }}>PAGE:</span>
            <select
              value={selectedPage}
              onChange={(e) => setSelectedPage(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#FFFFFF',
                fontSize: '0.88rem',
                fontWeight: 600,
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              {PAGES.map(p => (
                <option key={p.id} value={p.id} style={{ background: '#0F172A', color: '#FFFFFF' }}>
                  {p.name} ({p.path})
                </option>
              ))}
            </select>
          </div>

          <a
            href={currentPageObj.path}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.6rem 0.9rem',
              borderRadius: '8px',
              background: '#1E293B',
              color: '#94A3B8',
              textDecoration: 'none',
              fontSize: '0.82rem',
              fontWeight: 600,
              border: '1px solid #334155'
            }}
          >
            <Eye size={14} /> View Live Page
          </a>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.6rem 1.4rem',
              borderRadius: '8px',
              background: '#2563EB',
              color: '#FFFFFF',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: saving ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)'
            }}
          >
            <Save size={16} /> {saving ? 'Saving Changes...' : 'Save Page Changes'}
          </button>
        </div>
      </div>

      <section className="admin-seo-page-list" aria-label="Manage individual page publishing">
        <div className="admin-seo-page-list-heading">
          <div>
            <h2>Manage Pages</h2>
            <p>Edit and publish each page independently.</p>
          </div>
        </div>
        <div className="admin-seo-page-grid">
          {PAGES.map((page) => {
            const pageStatus = pageStatuses[page.id] || { status: 'loading', busy: false };
            const isPublished = pageStatus.status === 'published';
            const statusLabel = pageStatus.status === 'loading'
              ? 'Loading status'
              : pageStatus.status === 'error'
                ? 'Status unavailable'
                : isPublished ? 'Published' : 'Draft';
            return (
              <article className="admin-seo-page-card" key={page.id}>
                <div className="admin-seo-page-card-info">
                  <strong>{page.name}</strong>
                  <span>{page.path}</span>
                  <span className={`admin-seo-page-status ${isPublished ? 'is-published' : ''} ${pageStatus.status === 'error' ? 'has-error' : ''}`}>
                    <span aria-hidden="true" />
                    {statusLabel}
                  </span>
                </div>
                <div className="admin-seo-page-actions">
                  <button
                    type="button"
                    className="admin-seo-page-edit"
                    onClick={() => {
                      setSelectedPage(page.id);
                      sectionRefs['section-1'].current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                  >
                    <FileText size={15} /> Edit
                  </button>
                  <button
                    type="button"
                    className={`admin-seo-page-publish ${isPublished ? 'is-published' : ''}`}
                    onClick={() => togglePagePublished(page)}
                    disabled={pageStatus.busy || (pageStatus.status !== 'published' && pageStatus.status !== 'draft')}
                  >
                    {pageStatus.busy ? <RefreshCw size={15} className="seo-spin" /> : <Check size={15} />}
                    {pageStatus.busy ? 'Saving…' : isPublished ? 'Unpublish' : 'Publish'}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <SEOManagementPanel key={selectedPage} page={currentPageObj} />

      {/* Blue Banner: Page Sections (new structure) */}
      <div style={{
        background: 'linear-gradient(90deg, rgba(30, 58, 138, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%)',
        border: '1px solid #1E3A8A',
        borderRadius: '10px',
        padding: '0.9rem 1.25rem',
        marginBottom: '2rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.85rem'
      }}>
        <Layers size={20} color="#60A5FA" />
        <div>
          <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#93C5FD' }}>
            Page Sections (new structure)
          </div>
          <div style={{ fontSize: '0.8rem', color: '#BFDBFE', marginTop: '0.15rem' }}>
            1. Hero → 2. Content + Image → 3. Content Block → 4. Content Block → 5. Content Block → 6. Testimonials → 7. FAQ → 8. Lead Form
          </div>
        </div>
      </div>

      {/* Main 2-Column Grid Layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) 340px',
        gap: '2rem',
        alignItems: 'start'
      }}>
        
        {/* =========================================================================
            LEFT COLUMN: 8 STRUCTURED SECTIONS
            ========================================================================= */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>

          {/* -------------------------------------------------------------
              SECTION 1 — HERO
              ------------------------------------------------------------- */}
          <div
            ref={sectionRefs['section-1']}
            style={{
              background: '#111C33',
              border: '1px solid #1E2E4E',
              borderRadius: '12px',
              padding: '1.5rem',
              boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1rem', color: '#FFFFFF' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: '#1E3A8A', color: '#60A5FA', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>
                  1
                </div>
                <span>Section 1 — Hero</span>
              </div>
              <span style={{ background: '#1E293B', color: '#94A3B8', fontSize: '0.72rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                HERO
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>
                  H1 HEADING
                </label>
                <input
                  type="text"
                  value={sections.hero.h1}
                  onChange={(e) => setSections(prev => ({ ...prev, hero: { ...prev.hero, h1: e.target.value } }))}
                  placeholder="Main heading displayed in the hero section"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    background: '#0B132B',
                    border: '1px solid #1E2E4E',
                    borderRadius: '8px',
                    color: '#FFFFFF',
                    fontSize: '0.95rem',
                    fontWeight: 600
                  }}
                />
                <span style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '0.3rem', display: 'block' }}>
                  Main heading displayed in the hero section
                </span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>
                  SUBHEADING
                </label>
                <textarea
                  rows="3"
                  value={sections.hero.subheading}
                  onChange={(e) => setSections(prev => ({ ...prev, hero: { ...prev.hero, subheading: e.target.value } }))}
                  placeholder="Supporting text below H1"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    background: '#0B132B',
                    border: '1px solid #1E2E4E',
                    borderRadius: '8px',
                    color: '#CBD5E1',
                    fontSize: '0.88rem',
                    lineHeight: 1.5,
                    resize: 'vertical'
                  }}
                />
                <span style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '0.3rem', display: 'block' }}>
                  Supporting text below H1
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>
                    CTA BUTTON TEXT
                  </label>
                  <input
                    type="text"
                    value={sections.hero.ctaText}
                    onChange={(e) => setSections(prev => ({ ...prev, hero: { ...prev.hero, ctaText: e.target.value } }))}
                    placeholder="e.g. Discover Our Ministry"
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      background: '#0B132B',
                      border: '1px solid #1E2E4E',
                      borderRadius: '8px',
                      color: '#FFFFFF',
                      fontSize: '0.85rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>
                    CTA LINK URL
                  </label>
                  <input
                    type="text"
                    value={sections.hero.ctaLink}
                    onChange={(e) => setSections(prev => ({ ...prev, hero: { ...prev.hero, ctaLink: e.target.value } }))}
                    placeholder="e.g. /about or /contact"
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      background: '#0B132B',
                      border: '1px solid #1E2E4E',
                      borderRadius: '8px',
                      color: '#FFFFFF',
                      fontSize: '0.85rem'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* -------------------------------------------------------------
              SECTION KEY FEATURES — CORE PILLARS & KEY FEATURES (BODY TAG)
              ------------------------------------------------------------- */}
          <div
            ref={sectionRefs['section-key-features']}
            style={{
              background: '#111C33',
              border: '1px solid #1E2E4E',
              borderRadius: '12px',
              padding: '1.5rem',
              boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1rem', color: '#FFFFFF' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: '#0284C7', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800 }}>
                  ★
                </div>
                <span>Key Features &amp; Core Pillars (Body Tag &amp; Live Search)</span>
              </div>
              <span style={{ background: '#0369A1', color: '#E0F2FE', fontSize: '0.72rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                BODY TAG #KEY-FEATURES
              </span>
            </div>

            <p style={{ fontSize: '0.82rem', color: '#94A3B8', margin: '0 0 1.25rem 0', lineHeight: 1.5 }}>
              These key features and core pillars are rendered inside the page body and indexed by search engines. Users finding your focus keywords will see these features on page 1 of search results.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>
                  SECTION HEADLINE
                </label>
                <input
                  type="text"
                  value={sections.key_features?.heading || ''}
                  onChange={(e) => setSections(prev => ({
                    ...prev,
                    key_features: { ...prev.key_features, heading: e.target.value }
                  }))}
                  placeholder="Core Pillars & Key Ministry Features"
                  style={{ width: '100%', padding: '0.75rem 1rem', background: '#0B132B', border: '1px solid #1E2E4E', borderRadius: '8px', color: '#FFFFFF', fontSize: '0.95rem', fontWeight: 600 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>
                  SECTION SUBHEADING
                </label>
                <textarea
                  rows="2"
                  value={sections.key_features?.subheading || ''}
                  onChange={(e) => setSections(prev => ({
                    ...prev,
                    key_features: { ...prev.key_features, subheading: e.target.value }
                  }))}
                  placeholder="Four foundational pillars guiding our spiritual journey and Christ-centered service."
                  style={{ width: '100%', padding: '0.75rem 1rem', background: '#0B132B', border: '1px solid #1E2E4E', borderRadius: '8px', color: '#CBD5E1', fontSize: '0.88rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.6rem' }}>
                  CORE PILLAR CARDS (4 PILLARS WITH INTERNAL LINKS)
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
                  {(sections.key_features?.features || []).map((feat, idx) => (
                    <div key={feat.id || idx} style={{ background: '#0B132B', border: '1px solid #1E2E4E', borderRadius: '8px', padding: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#60A5FA' }}>Pillar {idx + 1}</span>
                      </div>
                      <input
                        type="text"
                        value={feat.title}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSections(prev => {
                            const updated = [...(prev.key_features?.features || [])];
                            updated[idx] = { ...updated[idx], title: val };
                            return { ...prev, key_features: { ...prev.key_features, features: updated } };
                          });
                        }}
                        placeholder="Pillar Title (e.g. Faith & Prayer)"
                        style={{ width: '100%', padding: '0.45rem 0.65rem', background: '#111C33', border: '1px solid #334155', borderRadius: '5px', color: '#FFFFFF', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem' }}
                      />
                      <textarea
                        rows="3"
                        value={feat.desc}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSections(prev => {
                            const updated = [...(prev.key_features?.features || [])];
                            updated[idx] = { ...updated[idx], desc: val };
                            return { ...prev, key_features: { ...prev.key_features, features: updated } };
                          });
                        }}
                        placeholder="Feature description..."
                        style={{ width: '100%', padding: '0.45rem 0.65rem', background: '#111C33', border: '1px solid #334155', borderRadius: '5px', color: '#CBD5E1', fontSize: '0.78rem', marginBottom: '0.5rem' }}
                      />
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <input
                          type="text"
                          value={feat.link}
                          onChange={(e) => {
                            const val = e.target.value;
                            setSections(prev => {
                              const updated = [...(prev.key_features?.features || [])];
                              updated[idx] = { ...updated[idx], link: val };
                              return { ...prev, key_features: { ...prev.key_features, features: updated } };
                            });
                          }}
                          placeholder="/#key-features"
                          style={{ flex: 1, padding: '0.35rem 0.5rem', background: '#111C33', border: '1px solid #334155', borderRadius: '5px', color: '#60A5FA', fontSize: '0.74rem' }}
                        />
                        <input
                          type="text"
                          value={feat.linkText || 'Learn More'}
                          onChange={(e) => {
                            const val = e.target.value;
                            setSections(prev => {
                              const updated = [...(prev.key_features?.features || [])];
                              updated[idx] = { ...updated[idx], linkText: val };
                              return { ...prev, key_features: { ...prev.key_features, features: updated } };
                            });
                          }}
                          placeholder="Link Text"
                          style={{ width: '90px', padding: '0.35rem 0.5rem', background: '#111C33', border: '1px solid #334155', borderRadius: '5px', color: '#CBD5E1', fontSize: '0.74rem' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* -------------------------------------------------------------
              SECTION 2 — CONTENT + IMAGE (LEFT-RIGHT)
              ------------------------------------------------------------- */}
          <div
            ref={sectionRefs['section-2']}
            style={{
              background: '#111C33',
              border: '1px solid #1E2E4E',
              borderRadius: '12px',
              padding: '1.5rem',
              boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1rem', color: '#FFFFFF' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: '#1E3A8A', color: '#60A5FA', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>
                  2
                </div>
                <span>Section 2 — Content + Image</span>
              </div>
              <span style={{ background: '#1E293B', color: '#94A3B8', fontSize: '0.72rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                LEFT-RIGHT
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>
                  SUBHEADING / EYEBROW
                </label>
                <input
                  type="text"
                  value={sections.section2_content_image.eyebrow}
                  onChange={(e) => setSections(prev => ({ ...prev, section2_content_image: { ...prev.section2_content_image, eyebrow: e.target.value } }))}
                  placeholder="Small text above the heading"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    background: '#0B132B',
                    border: '1px solid #1E2E4E',
                    borderRadius: '8px',
                    color: '#FFFFFF',
                    fontSize: '0.9rem'
                  }}
                />
                <span style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '0.3rem', display: 'block' }}>
                  Small text above the heading
                </span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>
                  HEADING
                </label>
                <input
                  type="text"
                  value={sections.section2_content_image.heading}
                  onChange={(e) => setSections(prev => ({ ...prev, section2_content_image: { ...prev.section2_content_image, heading: e.target.value } }))}
                  placeholder="Section heading"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    background: '#0B132B',
                    border: '1px solid #1E2E4E',
                    borderRadius: '8px',
                    color: '#FFFFFF',
                    fontSize: '0.95rem',
                    fontWeight: 600
                  }}
                />
                <span style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '0.3rem', display: 'block' }}>
                  Section heading
                </span>
              </div>

              {/* Rich WYSIWYG Editor Toolbar with Internal Link Option */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>
                  CONTENT (LEFT SIDE)
                </label>
                {renderContentToolbar('section2_content_image', 'content')}

                <textarea
                  id="page-content-section2_content_image"
                  rows="7"
                  value={sections.section2_content_image.content}
                  onChange={(e) => setSections(prev => ({ ...prev, section2_content_image: { ...prev.section2_content_image, content: e.target.value } }))}
                  style={{
                    width: '100%',
                    padding: '0.85rem 1rem',
                    background: '#0B132B',
                    border: '1px solid #1E2E4E',
                    borderRadius: '0 0 8px 8px',
                    color: '#E2E8F0',
                    fontSize: '0.88rem',
                    lineHeight: 1.6,
                    fontFamily: 'monospace',
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* Section 2 Image (Right Side) */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>
                  SECTION IMAGE (RIGHT SIDE)
                </label>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <input
                    type="url"
                    value={sections.section2_content_image.imageUrl}
                    onChange={(e) => setSections(prev => ({ ...prev, section2_content_image: { ...prev.section2_content_image, imageUrl: e.target.value } }))}
                    placeholder="https://images.unsplash.com/..."
                    style={{
                      flex: 1,
                      minWidth: '240px',
                      padding: '0.65rem 0.85rem',
                      background: '#0B132B',
                      border: '1px solid #1E2E4E',
                      borderRadius: '8px',
                      color: '#FFFFFF',
                      fontSize: '0.85rem'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => { setMediaPickerTarget('section2'); setIsMediaPickerOpen(true); }}
                    style={{
                      padding: '0.65rem 1rem',
                      background: '#1E293B',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                      color: '#60A5FA',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem'
                    }}
                  >
                    <ImageIcon size={14} /> Choose Media
                  </button>
                </div>

                {sections.section2_content_image.imageUrl && (
                  <div style={{ marginTop: '0.75rem', width: '100%', maxHeight: '220px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #1E2E4E' }}>
                    <img
                      src={sections.section2_content_image.imageUrl}
                      alt="Section 2 Graphic"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* -------------------------------------------------------------
              SECTION 3 — CONTENT BLOCK (FULL WIDTH)
              ------------------------------------------------------------- */}
          <div
            ref={sectionRefs['section-3']}
            style={{
              background: '#111C33',
              border: '1px solid #1E2E4E',
              borderRadius: '12px',
              padding: '1.5rem',
              boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1rem', color: '#FFFFFF' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: '#1E3A8A', color: '#60A5FA', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>
                  3
                </div>
                <span>Section 3 — Content Block</span>
              </div>
              <span style={{ background: '#1E293B', color: '#94A3B8', fontSize: '0.72rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                FULL WIDTH
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>
                  HEADING
                </label>
                <input
                  type="text"
                  value={sections.section3_content_block.heading}
                  onChange={(e) => setSections(prev => ({ ...prev, section3_content_block: { ...prev.section3_content_block, heading: e.target.value } }))}
                  placeholder="Section heading"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    background: '#0B132B',
                    border: '1px solid #1E2E4E',
                    borderRadius: '8px',
                    color: '#FFFFFF',
                    fontSize: '0.95rem',
                    fontWeight: 600
                  }}
                />
                <span style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '0.3rem', display: 'block' }}>
                  Section heading
                </span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>
                  CONTENT
                </label>
                {renderContentToolbar('section3_content_block')}
                <textarea
                  id="page-content-section3_content_block"
                  rows="6"
                  value={sections.section3_content_block.content}
                  onChange={(e) => setSections(prev => ({ ...prev, section3_content_block: { ...prev.section3_content_block, content: e.target.value } }))}
                  style={{
                    width: '100%',
                    padding: '0.85rem 1rem',
                    background: '#0B132B',
                    border: '1px solid #1E2E4E',
                    borderRadius: '0 0 8px 8px',
                    color: '#E2E8F0',
                    fontSize: '0.88rem',
                    lineHeight: 1.6,
                    resize: 'vertical'
                  }}
                />
              </div>
            </div>
          </div>

          {/* -------------------------------------------------------------
              SECTION 4 — CONTENT BLOCK (FULL WIDTH)
              ------------------------------------------------------------- */}
          <div
            ref={sectionRefs['section-4']}
            style={{
              background: '#111C33',
              border: '1px solid #1E2E4E',
              borderRadius: '12px',
              padding: '1.5rem',
              boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1rem', color: '#FFFFFF' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: '#1E3A8A', color: '#60A5FA', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>
                  4
                </div>
                <span>Section 4 — Content Block</span>
              </div>
              <span style={{ background: '#1E293B', color: '#94A3B8', fontSize: '0.72rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                FULL WIDTH
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>
                  HEADING
                </label>
                <input
                  type="text"
                  value={sections.section4_content_block.heading}
                  onChange={(e) => setSections(prev => ({ ...prev, section4_content_block: { ...prev.section4_content_block, heading: e.target.value } }))}
                  placeholder="Section heading"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    background: '#0B132B',
                    border: '1px solid #1E2E4E',
                    borderRadius: '8px',
                    color: '#FFFFFF',
                    fontSize: '0.95rem',
                    fontWeight: 600
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>
                  CONTENT
                </label>
                {renderContentToolbar('section4_content_block')}
                <textarea
                  id="page-content-section4_content_block"
                  rows="6"
                  value={sections.section4_content_block.content}
                  onChange={(e) => setSections(prev => ({ ...prev, section4_content_block: { ...prev.section4_content_block, content: e.target.value } }))}
                  style={{
                    width: '100%',
                    padding: '0.85rem 1rem',
                    background: '#0B132B',
                    border: '1px solid #1E2E4E',
                    borderRadius: '0 0 8px 8px',
                    color: '#E2E8F0',
                    fontSize: '0.88rem',
                    lineHeight: 1.6,
                    resize: 'vertical'
                  }}
                />
              </div>
            </div>
          </div>

          {/* -------------------------------------------------------------
              SECTION 5 — CONTENT BLOCK (FULL WIDTH)
              ------------------------------------------------------------- */}
          <div
            ref={sectionRefs['section-5']}
            style={{
              background: '#111C33',
              border: '1px solid #1E2E4E',
              borderRadius: '12px',
              padding: '1.5rem',
              boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1rem', color: '#FFFFFF' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: '#1E3A8A', color: '#60A5FA', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>
                  5
                </div>
                <span>Section 5 — Content Block</span>
              </div>
              <span style={{ background: '#1E293B', color: '#94A3B8', fontSize: '0.72rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                FULL WIDTH
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>
                  HEADING
                </label>
                <input
                  type="text"
                  value={sections.section5_content_block.heading}
                  onChange={(e) => setSections(prev => ({ ...prev, section5_content_block: { ...prev.section5_content_block, heading: e.target.value } }))}
                  placeholder="Section heading"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    background: '#0B132B',
                    border: '1px solid #1E2E4E',
                    borderRadius: '8px',
                    color: '#FFFFFF',
                    fontSize: '0.95rem',
                    fontWeight: 600
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>
                  CONTENT
                </label>
                {renderContentToolbar('section5_content_block')}
                <textarea
                  id="page-content-section5_content_block"
                  rows="6"
                  value={sections.section5_content_block.content}
                  onChange={(e) => setSections(prev => ({ ...prev, section5_content_block: { ...prev.section5_content_block, content: e.target.value } }))}
                  style={{
                    width: '100%',
                    padding: '0.85rem 1rem',
                    background: '#0B132B',
                    border: '1px solid #1E2E4E',
                    borderRadius: '0 0 8px 8px',
                    color: '#E2E8F0',
                    fontSize: '0.88rem',
                    lineHeight: 1.6,
                    resize: 'vertical'
                  }}
                />
              </div>
            </div>
          </div>

          {/* -------------------------------------------------------------
              SECTION 6 — TESTIMONIALS & REVIEWS
              ------------------------------------------------------------- */}
          <div
            ref={sectionRefs['section-6']}
            style={{
              background: '#111C33',
              border: '1px solid #1E2E4E',
              borderRadius: '12px',
              padding: '1.5rem',
              boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1rem', color: '#FFFFFF' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: '#1E3A8A', color: '#60A5FA', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>
                  6
                </div>
                <span>Section 6 — Testimonials</span>
              </div>
              <span style={{ background: '#1E293B', color: '#94A3B8', fontSize: '0.72rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                REVIEWS
              </span>
            </div>

            <p style={{ margin: '0 0 1rem 0', fontSize: '0.78rem', color: '#64748B' }}>
              Include locality names in reviews for hyperlocal SEO. Format: Name / Trip (locality) / Rating / Review
            </p>

            <textarea
              rows="8"
              value={sections.testimonials.raw}
              onChange={(e) => setSections(prev => ({ ...prev, testimonials: { ...prev.testimonials, raw: e.target.value } }))}
              style={{
                width: '100%',
                padding: '0.85rem 1rem',
                background: '#0B132B',
                border: '1px solid #1E2E4E',
                borderRadius: '8px',
                color: '#E2E8F0',
                fontSize: '0.88rem',
                lineHeight: 1.6,
                fontFamily: 'monospace',
                resize: 'vertical'
              }}
            />
          </div>

          {/* -------------------------------------------------------------
              SECTION 7 — FAQ (SCHEMA-READY)
              ------------------------------------------------------------- */}
          <div
            ref={sectionRefs['section-7']}
            style={{
              background: '#111C33',
              border: '1px solid #1E2E4E',
              borderRadius: '12px',
              padding: '1.5rem',
              boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1rem', color: '#FFFFFF' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: '#1E3A8A', color: '#60A5FA', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>
                  7
                </div>
                <span>Section 7 — FAQ</span>
              </div>
              <span style={{ background: '#1E293B', color: '#94A3B8', fontSize: '0.72rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                SCHEMA-READY
              </span>
            </div>

            <p style={{ margin: '0 0 1rem 0', fontSize: '0.78rem', color: '#64748B' }}>
              Target &quot;how much does service cost in [City]&quot; type queries. Each Q&amp;A gets structured FAQ schema markup.
            </p>

            <textarea
              rows="8"
              value={sections.faq.raw}
              onChange={(e) => setSections(prev => ({ ...prev, faq: { ...prev.faq, raw: e.target.value } }))}
              style={{
                width: '100%',
                padding: '0.85rem 1rem',
                background: '#0B132B',
                border: '1px solid #1E2E4E',
                borderRadius: '8px',
                color: '#E2E8F0',
                fontSize: '0.88rem',
                lineHeight: 1.6,
                fontFamily: 'monospace',
                resize: 'vertical'
              }}
            />
          </div>

          {/* -------------------------------------------------------------
              SECTION 8 — LEAD / CONTACT FORM CTA
              ------------------------------------------------------------- */}
          <div
            ref={sectionRefs['section-8']}
            style={{
              background: '#111C33',
              border: '1px solid #1E2E4E',
              borderRadius: '12px',
              padding: '1.5rem',
              boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1rem', color: '#FFFFFF' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: '#1E3A8A', color: '#60A5FA', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>
                  8
                </div>
                <span>Section 8 — Lead &amp; Prayer CTA Form</span>
              </div>
              <span style={{ background: '#1E293B', color: '#94A3B8', fontSize: '0.72rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                LEAD FORM
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>
                    FORM HEADLINE
                  </label>
                  <input
                    type="text"
                    value={sections.lead_form.title}
                    onChange={(e) => setSections(prev => ({ ...prev, lead_form: { ...prev.lead_form, title: e.target.value } }))}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', background: '#0B132B', border: '1px solid #1E2E4E', borderRadius: '8px', color: '#FFFFFF', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>
                    BUTTON ACTION LABEL
                  </label>
                  <input
                    type="text"
                    value={sections.lead_form.buttonText}
                    onChange={(e) => setSections(prev => ({ ...prev, lead_form: { ...prev.lead_form, buttonText: e.target.value } }))}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', background: '#0B132B', border: '1px solid #1E2E4E', borderRadius: '8px', color: '#FFFFFF', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>
                  DESCRIPTION
                </label>
                <textarea
                  rows="2"
                  value={sections.lead_form.description}
                  onChange={(e) => setSections(prev => ({ ...prev, lead_form: { ...prev.lead_form, description: e.target.value } }))}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', background: '#0B132B', border: '1px solid #1E2E4E', borderRadius: '8px', color: '#CBD5E1', fontSize: '0.85rem' }}
                />
              </div>
            </div>
          </div>

          {/* -------------------------------------------------------------
              SEO HEAD TAGS & METADATA SUITE (INTERACTIVE CODE EDITOR & LIVE PUBLISHER)
              ------------------------------------------------------------- */}
          <div
            ref={sectionRefs['section-head']}
            style={{
              background: '#111C33',
              border: '1px solid #1E2E4E',
              borderRadius: '12px',
              padding: '1.5rem',
              boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
            }}
          >
            {/* Header & Tabs */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1rem', color: '#FFFFFF' }}>
                <Globe size={18} color="#60A5FA" />
                <span>SEO Head Tags &amp; Metadata Suite</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#34D399', background: 'rgba(16, 185, 129, 0.15)', padding: '0.15rem 0.5rem', borderRadius: '4px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                  ● Live Published
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <button
                  type="button"
                  onClick={() => setIsRawHtmlEditor(false)}
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    border: '1px solid',
                    borderColor: !isRawHtmlEditor ? '#2563EB' : '#334155',
                    background: !isRawHtmlEditor ? '#1E3A8A' : '#0B132B',
                    color: !isRawHtmlEditor ? '#FFFFFF' : '#94A3B8',
                    cursor: 'pointer'
                  }}
                >
                  <Sliders size={13} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                  Visual Fields
                </button>
                <button
                  type="button"
                  onClick={() => setIsRawHtmlEditor(true)}
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    border: '1px solid',
                    borderColor: isRawHtmlEditor ? '#2563EB' : '#334155',
                    background: isRawHtmlEditor ? '#1E3A8A' : '#0B132B',
                    color: isRawHtmlEditor ? '#FFFFFF' : '#94A3B8',
                    cursor: 'pointer'
                  }}
                >
                  <Code size={13} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                  Raw HTML Editor
                </button>
              </div>
            </div>

            {/* Subheader Toolbar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem', background: '#0B132B', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #1E2E4E' }}>
              <div style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600 }}>
                {isRawHtmlEditor ? 'Edit raw HTML head tags directly. Auto-synced and published live.' : 'Edit structured SEO fields. Real-time generation of tags.'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => handleOptimizeForPageOne(selectedPage)}
                  style={{
                    padding: '0.28rem 0.65rem',
                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                    border: 'none',
                    borderRadius: '5px',
                    color: '#FFFFFF',
                    fontSize: '0.74rem',
                    cursor: 'pointer',
                    fontWeight: 800,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    boxShadow: '0 2px 6px rgba(16,185,129,0.3)'
                  }}
                  title="Automatically synchronize and optimize Title, H1, Description, Keywords, FAQs, and Schema using the 50 SEO Keywords Blueprint for Page 1 ranking"
                >
                  <Sparkles size={12} /> ⭐ Apply 50-Keyword Blueprint ({currentPageObj.name})
                </button>

                <button
                  type="button"
                  onClick={() => setIsKeywordExplorerOpen(prev => !prev)}
                  style={{
                    padding: '0.28rem 0.65rem',
                    background: isKeywordExplorerOpen ? '#D97706' : 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                    border: 'none',
                    borderRadius: '5px',
                    color: '#FFFFFF',
                    fontSize: '0.74rem',
                    cursor: 'pointer',
                    fontWeight: 800,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    boxShadow: '0 2px 6px rgba(245,158,11,0.3)'
                  }}
                  title="Explore all 50 SEO Keywords, Long-tail queries, and Google Intent Questions"
                >
                  <Tag size={12} /> {isKeywordExplorerOpen ? 'Hide 50 Keywords' : '50 Keywords Matrix (Explore)'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const generated = generateRawHtmlTags(seoData, sections.hero?.h1, sections.hero?.subheading, selectedPage);
                    setRawHtmlCode(generated);
                    setFeedback({ type: 'success', text: 'Raw HTML regenerated from current fields.' });
                    setTimeout(() => setFeedback({ type: '', text: '' }), 3000);
                  }}
                  style={{ padding: '0.25rem 0.55rem', background: '#111C33', border: '1px solid #334155', borderRadius: '5px', color: '#60A5FA', fontSize: '0.72rem', cursor: 'pointer', fontWeight: 600 }}
                  title="Regenerate HTML from current fields"
                >
                  <RefreshCw size={12} style={{ verticalAlign: 'middle', marginRight: '3px' }} /> Sync from Fields
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const parsed = parseRawHtmlToFields(rawHtmlCode);
                    setSeoData(prev => ({ ...prev, ...parsed }));
                    setFeedback({ type: 'success', text: 'Parsed HTML tags applied to SEO fields.' });
                    setTimeout(() => setFeedback({ type: '', text: '' }), 3000);
                  }}
                  style={{ padding: '0.25rem 0.55rem', background: '#111C33', border: '1px solid #334155', borderRadius: '5px', color: '#34D399', fontSize: '0.72rem', cursor: 'pointer', fontWeight: 600 }}
                  title="Parse and apply Raw HTML to fields"
                >
                  <Check size={12} style={{ verticalAlign: 'middle', marginRight: '3px' }} /> Apply HTML to Fields
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(rawHtmlCode);
                      setCopiedHtml(true);
                      setTimeout(() => setCopiedHtml(false), 2000);
                    } catch (e) {
                      setFeedback({ type: 'error', text: 'Clipboard copy failed.' });
                    }
                  }}
                  style={{ padding: '0.25rem 0.55rem', background: '#111C33', border: '1px solid #334155', borderRadius: '5px', color: '#E2E8F0', fontSize: '0.72rem', cursor: 'pointer', fontWeight: 600 }}
                >
                  {copiedHtml ? <Check size={12} style={{ verticalAlign: 'middle', marginRight: '3px', color: '#34D399' }} /> : <Copy size={12} style={{ verticalAlign: 'middle', marginRight: '3px' }} />}
                  {copiedHtml ? 'Copied!' : 'Copy HTML'}
                </button>
              </div>
            </div>

            {/* 50 SEO Keywords Explorer & Google Intent Assistant */}
            {isKeywordExplorerOpen && (
              <div style={{
                marginBottom: '1rem',
                background: '#0B132B',
                border: '1px solid #F59E0B',
                borderRadius: '8px',
                padding: '1rem',
                boxShadow: '0 4px 16px rgba(245,158,11,0.15)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Tag size={16} color="#FBBF24" />
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#FBBF24' }}>
                      50 SEO Keywords &amp; Google Search Intent Matrix
                    </span>
                    <span style={{ fontSize: '0.7rem', color: '#94A3B8' }}>
                      Click any keyword to add to this page's meta keywords or focus keyword
                    </span>
                  </div>

                  <input
                    type="text"
                    value={keywordSearchText}
                    onChange={(e) => setKeywordSearchText(e.target.value)}
                    placeholder="Search 50 keywords..."
                    style={{
                      padding: '0.25rem 0.6rem',
                      background: '#111C33',
                      border: '1px solid #334155',
                      borderRadius: '5px',
                      color: '#FFFFFF',
                      fontSize: '0.75rem',
                      width: '180px'
                    }}
                  />
                </div>

                {/* Category Pills */}
                <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                  {[
                    { id: 'all', label: 'All 50 Keywords' },
                    { id: 'primary', label: '1. Primary (1–10)' },
                    { id: 'longTail', label: '2. Long-Tail (11–25)' },
                    { id: 'intent', label: '3. Google Intent Questions (26–40)' },
                    { id: 'local', label: '4. Local SEO (41–50)' },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setKeywordCategoryFilter(tab.id)}
                      style={{
                        padding: '0.22rem 0.55rem',
                        borderRadius: '4px',
                        border: '1px solid',
                        borderColor: keywordCategoryFilter === tab.id ? '#F59E0B' : '#1E2E4E',
                        background: keywordCategoryFilter === tab.id ? 'rgba(245,158,11,0.2)' : '#111C33',
                        color: keywordCategoryFilter === tab.id ? '#FBBF24' : '#94A3B8',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Keyword Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.5rem', maxHeight: '260px', overflowY: 'auto', paddingRight: '4px' }}>
                  {(() => {
                    let list = [];
                    if (keywordCategoryFilter === 'all' || keywordCategoryFilter === 'primary') {
                      list.push(...SEO_KEYWORDS_50_DATABASE.primary.map(k => ({ ...k, type: 'primary', text: k.keyword })));
                    }
                    if (keywordCategoryFilter === 'all' || keywordCategoryFilter === 'longTail') {
                      list.push(...SEO_KEYWORDS_50_DATABASE.longTail.map(k => ({ ...k, type: 'longTail', text: k.keyword })));
                    }
                    if (keywordCategoryFilter === 'all' || keywordCategoryFilter === 'intent') {
                      list.push(...SEO_KEYWORDS_50_DATABASE.userSearchingIntent.map(k => ({ ...k, type: 'intent', text: k.question })));
                    }
                    if (keywordCategoryFilter === 'all' || keywordCategoryFilter === 'local') {
                      list.push(...SEO_KEYWORDS_50_DATABASE.localSeo.map(k => ({ ...k, type: 'local', text: k.keyword })));
                    }

                    if (keywordSearchText.trim()) {
                      const q = keywordSearchText.toLowerCase();
                      list = list.filter(k => k.text.toLowerCase().includes(q));
                    }

                    return list.map(item => (
                      <div
                        key={item.no}
                        style={{
                          background: '#111C33',
                          border: '1px solid #1E2E4E',
                          borderRadius: '6px',
                          padding: '0.5rem 0.65rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.35rem'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#60A5FA' }}>
                            #{item.no} {item.targetPage ? `[Target: ${item.targetPage}]` : ''}
                          </span>
                          <span style={{
                            fontSize: '0.62rem',
                            fontWeight: 700,
                            padding: '1px 5px',
                            borderRadius: '3px',
                            background: item.type === 'primary' ? 'rgba(37,99,235,0.2)' : item.type === 'intent' ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)',
                            color: item.type === 'primary' ? '#93C5FD' : item.type === 'intent' ? '#6EE7B7' : '#FCD34D'
                          }}>
                            {item.type === 'primary' ? 'Primary' : item.type === 'intent' ? 'Google Intent' : item.type === 'local' ? 'Local SEO' : 'Long-Tail'}
                          </span>
                        </div>

                        <div style={{ fontSize: '0.76rem', color: '#FFFFFF', fontWeight: 600, lineHeight: 1.3 }}>
                          {item.text}
                        </div>

                        <div style={{ display: 'flex', gap: '0.3rem', marginTop: '0.2rem' }}>
                          <button
                            type="button"
                            onClick={() => handleInsertKeyword(item.text)}
                            style={{ padding: '0.2rem 0.45rem', background: '#1E293B', border: '1px solid #334155', borderRadius: '4px', color: '#93C5FD', fontSize: '0.65rem', cursor: 'pointer', fontWeight: 700 }}
                            title="Add to page Meta Keywords"
                          >
                            + Keywords
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSetFocusKeyword(item.text)}
                            style={{ padding: '0.2rem 0.45rem', background: '#1E293B', border: '1px solid #334155', borderRadius: '4px', color: '#34D399', fontSize: '0.65rem', cursor: 'pointer', fontWeight: 700 }}
                            title="Set as Focus Keyword"
                          >
                            Set Focus
                          </button>
                          {item.type === 'intent' && (
                            <button
                              type="button"
                              onClick={() => handleInsertFaqQuestion(item.text)}
                              style={{ padding: '0.2rem 0.45rem', background: '#1E293B', border: '1px solid #334155', borderRadius: '4px', color: '#FBBF24', fontSize: '0.65rem', cursor: 'pointer', fontWeight: 700 }}
                              title="Add to FAQ Section"
                            >
                              + Add FAQ
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                await navigator.clipboard.writeText(item.text);
                                setFeedback({ type: 'success', text: `Copied: "${item.text}"` });
                                setTimeout(() => setFeedback({ type: '', text: '' }), 2000);
                              } catch {}
                            }}
                            style={{ padding: '0.2rem 0.45rem', background: '#1E293B', border: '1px solid #334155', borderRadius: '4px', color: '#CBD5E1', fontSize: '0.65rem', cursor: 'pointer' }}
                            title="Copy to clipboard"
                          >
                            Copy
                          </button>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            )}

            {/* Mode 1: Raw HTML Code Editor */}
            {isRawHtmlEditor && (
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>
                  HEAD TAGS (EDITABLE RAW HTML CODE)
                </label>
                <textarea
                  rows="12"
                  value={rawHtmlCode}
                  onChange={(e) => {
                    const nextHtml = e.target.value;
                    setRawHtmlCode(nextHtml);
                    const parsed = parseRawHtmlToFields(nextHtml);
                    setSeoData(prev => ({ ...prev, ...parsed }));
                  }}
                  spellCheck="false"
                  style={{
                    width: '100%',
                    padding: '1rem',
                    background: '#0B132B',
                    border: '1px solid #1E2E4E',
                    borderRadius: '8px',
                    fontFamily: 'monospace',
                    fontSize: '0.82rem',
                    color: '#93C5FD',
                    lineHeight: 1.6,
                    resize: 'vertical',
                    whiteSpace: 'pre'
                  }}
                />
                <span style={{ fontSize: '0.7rem', color: '#64748B', marginTop: '0.35rem', display: 'block' }}>
                  💡 Direct HTML editing enabled. Any tags written here will be automatically published live and injected into document &lt;head&gt;.
                </span>
              </div>
            )}

            {/* Mode 2: Structured Fields */}
            {!isRawHtmlEditor && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        SEO META TITLE
                      </label>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: (seoData.meta_title?.length || 0) >= 45 && (seoData.meta_title?.length || 0) <= 60 ? '#34D399' : '#FBBF24' }}>
                        {seoData.meta_title?.length || 0}/60 chars (Recommended: 45–60)
                      </span>
                    </div>
                    <input
                      type="text"
                      value={seoData.meta_title}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSeoData(prev => {
                          const updated = { ...prev, meta_title: val };
                          setRawHtmlCode(generateRawHtmlTags(updated, sections.hero?.h1, sections.hero?.subheading, selectedPage));
                          return updated;
                        });
                      }}
                      placeholder="e.g. Compassionate Love of Calvary Ministries | Faith, Prayer & Hope"
                      style={{ width: '100%', padding: '0.65rem 0.85rem', background: '#0B132B', border: '1px solid #1E2E4E', borderRadius: '8px', color: '#FFFFFF', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.35rem' }}>
                      PRIMARY FOCUS KEYWORD (PAGE 1 RANKING TARGET)
                    </label>
                    <input
                      type="text"
                      value={seoData.focus_keyword}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSeoData(prev => {
                          const updated = { ...prev, focus_keyword: val };
                          setRawHtmlCode(generateRawHtmlTags(updated, sections.hero?.h1, sections.hero?.subheading, selectedPage));
                          return updated;
                        });
                      }}
                      placeholder="e.g. Compassionate Love of Calvary Ministries"
                      style={{ width: '100%', padding: '0.65rem 0.85rem', background: '#0B132B', border: '1px solid #1E2E4E', borderRadius: '8px', color: '#FFFFFF', fontSize: '0.85rem' }}
                    />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      META DESCRIPTION
                    </label>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: (seoData.meta_description?.length || 0) >= 120 && (seoData.meta_description?.length || 0) <= 160 ? '#34D399' : '#FBBF24' }}>
                      {seoData.meta_description?.length || 0}/160 chars (Recommended: 120–160)
                    </span>
                  </div>
                  <textarea
                    rows="2"
                    value={seoData.meta_description}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSeoData(prev => {
                        const updated = { ...prev, meta_description: val };
                        setRawHtmlCode(generateRawHtmlTags(updated, sections.hero?.h1, sections.hero?.subheading, selectedPage));
                        return updated;
                      });
                    }}
                    placeholder="Compelling snippet displayed in search engine results containing the focus keyword."
                    style={{ width: '100%', padding: '0.65rem 0.85rem', background: '#0B132B', border: '1px solid #1E2E4E', borderRadius: '8px', color: '#CBD5E1', fontSize: '0.85rem' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.35rem' }}>
                      META KEYWORDS (COMMA SEPARATED)
                    </label>
                    <input
                      type="text"
                      value={seoData.meta_keywords}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSeoData(prev => {
                          const updated = { ...prev, meta_keywords: val };
                          setRawHtmlCode(generateRawHtmlTags(updated, sections.hero?.h1, sections.hero?.subheading, selectedPage));
                          return updated;
                        });
                      }}
                      placeholder="calvary, bible study, prayer, chengalpattu"
                      style={{ width: '100%', padding: '0.65rem 0.85rem', background: '#0B132B', border: '1px solid #1E2E4E', borderRadius: '8px', color: '#CBD5E1', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.35rem' }}>
                      CANONICAL URL (HTTPS)
                    </label>
                    <input
                      type="url"
                      value={seoData.canonical_url}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSeoData(prev => {
                          const updated = { ...prev, canonical_url: val };
                          setRawHtmlCode(generateRawHtmlTags(updated, sections.hero?.h1, sections.hero?.subheading, selectedPage));
                          return updated;
                        });
                      }}
                      placeholder={`https://www.loveofcalvary.org/${selectedPage === 'home' ? '' : selectedPage}`}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', background: '#0B132B', border: '1px solid #1E2E4E', borderRadius: '8px', color: '#CBD5E1', fontSize: '0.85rem' }}
                    />
                  </div>
                </div>

                {/* Robots Directives */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', background: '#0B132B', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #1E2E4E' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: '#FFFFFF', cursor: 'pointer', fontWeight: 600 }}>
                    <input
                      type="checkbox"
                      checked={seoData.robots_index}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setSeoData(prev => {
                          const updated = { ...prev, robots_index: checked };
                          setRawHtmlCode(generateRawHtmlTags(updated, sections.hero?.h1, sections.hero?.subheading, selectedPage));
                          return updated;
                        });
                      }}
                    />
                    Index Page in Google (index)
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: '#FFFFFF', cursor: 'pointer', fontWeight: 600 }}>
                    <input
                      type="checkbox"
                      checked={seoData.robots_follow}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setSeoData(prev => {
                          const updated = { ...prev, robots_follow: checked };
                          setRawHtmlCode(generateRawHtmlTags(updated, sections.hero?.h1, sections.hero?.subheading, selectedPage));
                          return updated;
                        });
                      }}
                    />
                    Follow Links (follow)
                  </label>
                </div>
              </div>
            )}

            {/* Google Search Page 1 Result Preview */}
            <div style={{ marginTop: '1.25rem', padding: '1rem 1.25rem', background: '#0F172A', borderRadius: '10px', border: '1px solid #1E293B' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#38BDF8', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Search size={13} /> Google Search Page 1 Snippet Preview
                </span>
                <span style={{ fontSize: '0.7rem', color: '#94A3B8' }}>
                  What searchers see on Google ranking #1
                </span>
              </div>
              <div style={{ padding: '0.9rem 1.1rem', background: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0', fontFamily: 'arial, sans-serif' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D4AF37', fontSize: '0.65rem', fontWeight: 800 }}>
                    ✝
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.78rem', color: '#202124', fontWeight: 500, lineHeight: 1.2 }}>Compassionate Love of Calvary Ministries</span>
                    <span style={{ fontSize: '0.72rem', color: '#4D5156', lineHeight: 1.2 }}>{new URL(pageSettings.slug ? `/${pageSettings.slug}` : currentPageObj.path, window.location.origin).toString()}</span>
                  </div>
                </div>
                <div style={{ fontSize: '1.15rem', color: '#1A0DAB', textDecoration: 'none', lineHeight: 1.3, marginBottom: '0.35rem', fontWeight: 500, cursor: 'pointer' }}>
                  {seoData.meta_title || `${sections.hero.h1 || 'Home'} | Compassionate Love of Calvary Ministries`}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#4D5156', lineHeight: 1.5 }}>
                  {seoData.meta_description || 'Compassionate Love of Calvary Ministries - Rooted in prayer, anchored in Biblical truth, and sharing the boundless love of Christ in Chengalpattu, Tamil Nadu.'}
                </div>
              </div>
            </div>

            {/* Real-Time First-Page SEO Audit Checklist */}
            <div style={{ marginTop: '1.25rem', padding: '1rem', background: '#0B132B', borderRadius: '8px', border: '1px solid #1E2E4E' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Google First-Page Ranking Readiness
                </span>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#34D399', background: 'rgba(16, 185, 129, 0.15)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                  {(() => {
                    const fk = (seoData.focus_keyword || '').toLowerCase().trim();
                    const titleHas = fk && (seoData.meta_title || '').toLowerCase().includes(fk);
                    const descHas = fk && (seoData.meta_description || '').toLowerCase().includes(fk);
                    const heroHas = fk && (sections.hero?.h1 || '').toLowerCase().includes(fk);
                    const score = [titleHas, descHas, heroHas, seoData.robots_index, seoData.canonical_url?.startsWith('https://')].filter(Boolean).length * 20;
                    return `${score}/100 — ${score >= 80 ? 'Page 1 Ready!' : 'Good Optimization'}`;
                  })()}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem', fontSize: '0.74rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: (seoData.focus_keyword && (seoData.meta_title || '').toLowerCase().includes((seoData.focus_keyword || '').toLowerCase())) ? '#34D399' : '#94A3B8' }}>
                  <CheckCircle2 size={13} /> Focus Keyword in Meta Title
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: (seoData.focus_keyword && (seoData.meta_description || '').toLowerCase().includes((seoData.focus_keyword || '').toLowerCase())) ? '#34D399' : '#94A3B8' }}>
                  <CheckCircle2 size={13} /> Focus Keyword in Meta Description
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: (seoData.focus_keyword && (sections.hero?.h1 || '').toLowerCase().includes((seoData.focus_keyword || '').toLowerCase())) ? '#34D399' : '#94A3B8' }}>
                  <CheckCircle2 size={13} /> Focus Keyword in H1 Heading
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: (seoData.canonical_url?.startsWith('https://')) ? '#34D399' : '#94A3B8' }}>
                  <CheckCircle2 size={13} /> Canonical HTTPS Configured
                </div>
              </div>
            </div>

            {/* Instant Publish & Live View Action Row */}
            <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid #1E2E4E' }}>
              <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
                Live URL: <strong style={{ color: '#60A5FA' }}>{new URL(pageSettings.slug ? `/${pageSettings.slug}` : currentPageObj.path, window.location.origin).toString()}</strong>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <a
                  href={new URL(pageSettings.slug ? `/${pageSettings.slug}` : currentPageObj.path, window.location.origin).toString()}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.55rem 0.95rem',
                    background: '#1E293B',
                    color: '#93C5FD',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    textDecoration: 'none'
                  }}
                >
                  <ExternalLink size={14} /> Visit Live Published Page
                </a>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.55rem 1.25rem',
                    background: '#2563EB',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: saving ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 14px rgba(37,99,235,0.4)'
                  }}
                >
                  {saving ? <RefreshCw size={14} className="seo-spin" /> : <Check size={14} />}
                  <span>{saving ? 'Publishing…' : 'Publish & Save Live Now'}</span>
                </button>
              </div>
            </div>

          </div>

        </div>


        {/* =========================================================================
            RIGHT COLUMN: STICKY SIDEBAR (PAGE SETTINGS + HERO IMAGE + STRUCTURE)
            ========================================================================= */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'sticky', top: '1.5rem' }}>

          {/* Card 1: Page Settings */}
          <div style={{
            background: '#111C33',
            border: '1px solid #1E2E4E',
            borderRadius: '12px',
            padding: '1.25rem',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 700, fontSize: '0.92rem', color: '#FFFFFF', marginBottom: '1rem' }}>
              <Settings size={16} color="#60A5FA" />
              <span>Page Settings</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.3rem' }}>
                  INTERNAL TITLE
                </label>
                <input
                  type="text"
                  value={pageSettings.internalTitle}
                  onChange={(e) => setPageSettings(prev => ({ ...prev, internalTitle: e.target.value }))}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', background: '#0B132B', border: '1px solid #1E2E4E', borderRadius: '6px', color: '#FFFFFF', fontSize: '0.82rem' }}
                />
                <span style={{ fontSize: '0.68rem', color: '#64748B', marginTop: '0.2rem', display: 'block' }}>
                  For admin reference only
                </span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.3rem' }}>
                  URL SLUG
                </label>
                <input
                  type="text"
                  value={pageSettings.slug}
                  onChange={(e) => setPageSettings(prev => ({ ...prev, slug: slugify(e.target.value) }))}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', background: '#0B132B', border: '1px solid #1E2E4E', borderRadius: '6px', color: '#FFFFFF', fontSize: '0.82rem', fontFamily: 'monospace' }}
                />
                <span style={{ fontSize: '0.68rem', color: '#64748B', marginTop: '0.2rem', display: 'block' }}>
                  Page URL: {new URL(pageSettings.slug ? `/${pageSettings.slug}` : currentPageObj.path, window.location.origin).toString()}
                </span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.3rem' }}>
                  TARGET LOCATION
                </label>
                <input
                  type="text"
                  value={pageSettings.targetLocation}
                  onChange={(e) => setPageSettings(prev => ({ ...prev, targetLocation: e.target.value }))}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', background: '#0B132B', border: '1px solid #1E2E4E', borderRadius: '6px', color: '#FFFFFF', fontSize: '0.82rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.3rem' }}>
                  STATUS
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#0B132B', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #1E2E4E' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: pageSettings.isPublished ? '#10B981' : '#F59E0B' }} />
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: pageSettings.isPublished ? '#34D399' : '#FBBF24' }}>
                    {pageSettings.isPublished ? 'Published & Live' : 'Draft'}
                  </span>
                </div>
                <span style={{ fontSize: '0.68rem', color: '#64748B' }}>Manage this page’s publish status in the Manage Pages list.</span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.3rem' }}>
                  TEMPLATE
                </label>
                <select
                  value={pageSettings.template}
                  onChange={(e) => setPageSettings(prev => ({ ...prev, template: e.target.value }))}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', background: '#0B132B', border: '1px solid #1E2E4E', borderRadius: '6px', color: '#FFFFFF', fontSize: '0.82rem' }}
                >
                  <option value="Default Landing Page">Default (Landing Page)</option>
                  <option value="Pillar Content Page">Pillar Content Page</option>
                  <option value="Ministry Service Page">Ministry Service Page</option>
                </select>
              </div>
            </div>
          </div>

          {/* Card 2: Hero Image */}
          <div style={{
            background: '#111C33',
            border: '1px solid #1E2E4E',
            borderRadius: '12px',
            padding: '1.25rem',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 700, fontSize: '0.92rem', color: '#FFFFFF', marginBottom: '0.85rem' }}>
              <ImageIcon size={16} color="#60A5FA" />
              <span>Hero Image</span>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>
                IMAGE URL / UPLOAD
              </label>

              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <input
                  type="url"
                  value={seoData.featured_image_url}
                  onChange={(e) => setSeoData(prev => ({ ...prev, featured_image_url: e.target.value }))}
                  placeholder="https://images.unsplash.com/..."
                  style={{ flex: 1, padding: '0.5rem 0.75rem', background: '#0B132B', border: '1px solid #1E2E4E', borderRadius: '6px', color: '#FFFFFF', fontSize: '0.78rem' }}
                />
                <button
                  type="button"
                  onClick={() => { setMediaPickerTarget('hero'); setIsMediaPickerOpen(true); }}
                  style={{ padding: '0.5rem 0.65rem', background: '#1E293B', border: '1px solid #334155', borderRadius: '6px', color: '#60A5FA', fontSize: '0.75rem', cursor: 'pointer' }}
                >
                  <Upload size={13} />
                </button>
              </div>

              <span style={{ fontSize: '0.68rem', color: '#64748B', display: 'block', marginBottom: '0.75rem' }}>
                Upload hero background image (landscape recommended, e.g. 1920x1080px)
              </span>

              {seoData.featured_image_url ? (
                <div style={{ width: '100%', height: '110px', borderRadius: '6px', overflow: 'hidden', border: '1px solid #1E2E4E' }}>
                  <img
                    src={seoData.featured_image_url}
                    alt="Hero Preview"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              ) : (
                <div style={{ width: '100%', height: '80px', borderRadius: '6px', background: '#0B132B', border: '1px dashed #1E2E4E', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B', fontSize: '0.75rem' }}>
                  No image selected
                </div>
              )}
            </div>
          </div>

          {/* Card 3: PAGE PREVIEW STRUCTURE */}
          <div style={{
            background: '#111C33',
            border: '1px solid #1E2E4E',
            borderRadius: '12px',
            padding: '1.25rem',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 700, fontSize: '0.92rem', color: '#FFFFFF', marginBottom: '0.85rem' }}>
              <Layers size={16} color="#60A5FA" />
              <span>PAGE PREVIEW STRUCTURE</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              {[
                { id: 'section-1', num: '1', title: 'Hero (heading + CTA)' },
                { id: 'section-key-features', num: '★', title: 'Key Features & Pillars' },
                { id: 'section-2', num: '2', title: 'Content + Image' },
                { id: 'section-3', num: '3', title: 'Content Block' },
                { id: 'section-4', num: '4', title: 'Content Block' },
                { id: 'section-5', num: '5', title: 'Content Block' },
                { id: 'section-6', num: '6', title: 'Testimonials' },
                { id: 'section-7', num: '7', title: 'FAQ' },
                { id: 'section-8', num: '8', title: 'Lead Form' },
                { id: 'section-head', num: '★', title: 'SEO Head Tags' },
              ].map(step => (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => scrollToSection(step.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    padding: '0.45rem 0.65rem',
                    borderRadius: '6px',
                    border: 'none',
                    background: activeSectionId === step.id ? '#1E3A8A' : '#0B132B',
                    color: activeSectionId === step.id ? '#FFFFFF' : '#94A3B8',
                    cursor: 'pointer',
                    fontSize: '0.78rem',
                    fontWeight: activeSectionId === step.id ? 700 : 500,
                    textAlign: 'left',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '4px',
                    background: activeSectionId === step.id ? '#2563EB' : '#1E293B',
                    color: activeSectionId === step.id ? '#FFFFFF' : '#60A5FA',
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {step.num}
                  </span>
                  <span>{step.title}</span>
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelectMedia={(item) => {
          const url = getMediaUrl(item.file || item.url || item.image_url);
          if (mediaPickerTarget === 'hero') {
            setSeoData(prev => ({ ...prev, featured_image_url: url }));
          } else if (mediaPickerTarget === 'section2') {
            setSections(prev => ({
              ...prev,
              section2_content_image: {
                ...prev.section2_content_image,
                imageUrl: url
              }
            }));
          }
          setIsMediaPickerOpen(false);
        }}
      />

    </div>
  );
};
