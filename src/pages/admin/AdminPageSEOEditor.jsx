import React, { useState, useEffect, useMemo, useRef } from 'react';
import { api, getMediaUrl } from '../../services/api';
import { ROUTES } from '../../routes/routes';
import { MediaPickerModal } from '../../components/MediaPickerModal';
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
  { id: 'home', name: 'Home Page', path: ROUTES.HOME, defaultKw: 'compassionate love of calvary ministries' },
  { id: 'about', name: 'About Page', path: ROUTES.ABOUT, defaultKw: 'christian ministry chengalpattu' },
  { id: 'ministries', name: 'Ministries Page', path: ROUTES.MINISTRIES, defaultKw: 'church ministries and community outreach' },
  { id: 'bible', name: 'Bible Page', path: ROUTES.BIBLE, defaultKw: 'holy scriptures bible reading plans' },
  { id: 'study', name: 'Study Page', path: ROUTES.STUDY, defaultKw: 'verse by verse bible studies discipleship' },
  { id: 'devotional', name: 'Devotional Page', path: ROUTES.DEVOTIONAL, defaultKw: 'daily christian devotionals morning prayer' },
  { id: 'sermons', name: 'Sermons Page', path: ROUTES.SERMONS, defaultKw: 'gospel sermons video messages faith' },
  { id: 'events', name: 'Events Page', path: ROUTES.EVENTS, defaultKw: 'worship prayer assembly church events' },
  { id: 'blog', name: 'Blog Page', path: ROUTES.BLOG, defaultKw: 'christian living articles spiritual growth' },
  { id: 'media', name: 'Media Page', path: ROUTES.MEDIA, defaultKw: 'ministry worship photos video gallery' },
  { id: 'contact', name: 'Contact Page', path: ROUTES.CONTACT, defaultKw: 'prayer request pastor contact chengalpattu' },
];

const DEFAULT_SECTIONS = {
  hero: {
    h1: 'Sharing the Love of Christ, Bringing Hope to Every Heart',
    subheading: 'A Christ-centered ministry devoted to sharing God’s love, strengthening faith, serving others, and bringing hope through the transforming message of Jesus Christ.',
    ctaText: 'Discover Our Ministry',
    ctaLink: '/about',
  },
  section2_content_image: {
    eyebrow: 'Rooted in Faith, Driven by Compassion',
    heading: 'A Sanctuary of Worship, Fellowship & Gospel Outreach',
    content: `<p>At Compassionate Love of Calvary Ministries, our doors and hearts are open to everyone. Rooted in prayer, anchored in Biblical truth, and energized by the Holy Spirit, we are dedicated to fostering a loving community where lives are restored, spiritual growth is nurtured, and the light of Christ shines through compassionate service.</p>\n<p>Whether you are seeking prayer, fellowship, spiritual growth, or simply a place to belong, you are always welcome in our spiritual family.</p>`,
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

  const [sections, setSections] = useState(DEFAULT_SECTIONS);
  const [pageSettings, setPageSettings] = useState({
    internalTitle: 'Home Page SEO & Sections Builder',
    slug: '',
    targetLocation: 'Chengalpattu, Tamil Nadu, India',
    isPublished: true,
    template: 'Default Landing Page',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', text: '' });
  const [activeSectionId, setActiveSectionId] = useState('section-1');

  // Media Picker modal
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [mediaPickerTarget, setMediaPickerTarget] = useState('hero'); // 'hero', 'section2'

  // Ref for sections
  const sectionRefs = {
    'section-1': useRef(null),
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

        if (data.sections_data && Object.keys(data.sections_data).length > 0) {
          setSections(prev => ({
            ...prev,
            ...data.sections_data
          }));
        } else if (data.h1_heading) {
          setSections(prev => ({
            ...prev,
            hero: {
              ...prev.hero,
              h1: data.h1_heading || prev.hero.h1,
            }
          }));
        }

        setPageSettings({
          internalTitle: `${PAGES.find(p => p.id === pageId)?.name || pageId} Landing Structure`,
          slug: pageId === 'home' ? '' : pageId,
          targetLocation: 'Chengalpattu, Tamil Nadu, India',
          isPublished: true,
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

  const handleSave = async () => {
    setSaving(true);
    setFeedback({ type: '', text: '' });
    try {
      const payload = {
        page_identifier: selectedPage,
        h1_heading: sections.hero.h1 || seoData.h1_heading,
        featured_image_url: seoData.featured_image_url,
        meta_title: seoData.meta_title || `${sections.hero.h1} | Compassionate Love of Calvary`,
        meta_description: seoData.meta_description || (sections.hero.subheading ? sections.hero.subheading.slice(0, 160) : ''),
        meta_keywords: seoData.meta_keywords,
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
      };

      await api.updateAdminPageSEO(selectedPage, payload);
      setFeedback({ type: 'success', text: 'All 8 Page Sections & SEO Settings saved and deployed successfully!' });
      setTimeout(() => setFeedback({ type: '', text: '' }), 4500);
    } catch (err) {
      setFeedback({ type: 'error', text: 'Failed to save SEO Page structure. Please check server connection.' });
    } finally {
      setSaving(false);
    }
  };

  // Helper to insert quick formatting into textarea
  const insertFormatting = (targetKey, subKey, startTag, endTag = '') => {
    const currentValue = sections[targetKey][subKey] || '';
    const updated = `${currentValue}\n${startTag}Sample Content${endTag}`;
    setSections(prev => ({
      ...prev,
      [targetKey]: {
        ...prev[targetKey],
        [subKey]: updated
      }
    }));
  };

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
            <Save size={16} /> {saving ? 'Saving Changes...' : 'Save & Publish'}
          </button>
        </div>
      </div>

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

              {/* Rich WYSIWYG Editor Toolbar */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>
                  CONTENT (LEFT SIDE)
                </label>

                {/* Toolbar */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  background: '#0B132B',
                  padding: '0.4rem 0.6rem',
                  borderRadius: '8px 8px 0 0',
                  border: '1px solid #1E2E4E',
                  borderBottom: 'none',
                  flexWrap: 'wrap'
                }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748B', padding: '0 0.4rem' }}>Paragraph</span>
                  <div style={{ width: '1px', height: '14px', background: '#1E2E4E', margin: '0 0.2rem' }} />
                  
                  <button type="button" onClick={() => insertFormatting('section2_content_image', 'content', '<strong>', '</strong>')} style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '0.2rem' }} title="Bold">
                    <Bold size={14} />
                  </button>
                  <button type="button" onClick={() => insertFormatting('section2_content_image', 'content', '<em>', '</em>')} style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '0.2rem' }} title="Italic">
                    <Italic size={14} />
                  </button>
                  <button type="button" onClick={() => insertFormatting('section2_content_image', 'content', '<u>', '</u>')} style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '0.2rem' }} title="Underline">
                    <Underline size={14} />
                  </button>
                  <button type="button" onClick={() => insertFormatting('section2_content_image', 'content', '<s>', '</s>')} style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '0.2rem' }} title="Strikethrough">
                    <Strikethrough size={14} />
                  </button>

                  <div style={{ width: '1px', height: '14px', background: '#1E2E4E', margin: '0 0.2rem' }} />

                  <button type="button" onClick={() => insertFormatting('section2_content_image', 'content', '<ul>\n  <li>', '</li>\n</ul>')} style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '0.2rem' }} title="Bullet List">
                    <List size={14} />
                  </button>
                  <button type="button" onClick={() => insertFormatting('section2_content_image', 'content', '<ol>\n  <li>', '</li>\n</ol>')} style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '0.2rem' }} title="Numbered List">
                    <ListOrdered size={14} />
                  </button>
                  <button type="button" onClick={() => insertFormatting('section2_content_image', 'content', '<blockquote>', '</blockquote>')} style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '0.2rem' }} title="Quote">
                    <Quote size={14} />
                  </button>
                  <button type="button" onClick={() => insertFormatting('section2_content_image', 'content', '<a href="#">', '</a>')} style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '0.2rem' }} title="Link">
                    <LinkIcon size={14} />
                  </button>
                </div>

                <textarea
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
                <textarea
                  rows="6"
                  value={sections.section3_content_block.content}
                  onChange={(e) => setSections(prev => ({ ...prev, section3_content_block: { ...prev.section3_content_block, content: e.target.value } }))}
                  style={{
                    width: '100%',
                    padding: '0.85rem 1rem',
                    background: '#0B132B',
                    border: '1px solid #1E2E4E',
                    borderRadius: '8px',
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
                <textarea
                  rows="6"
                  value={sections.section4_content_block.content}
                  onChange={(e) => setSections(prev => ({ ...prev, section4_content_block: { ...prev.section4_content_block, content: e.target.value } }))}
                  style={{
                    width: '100%',
                    padding: '0.85rem 1rem',
                    background: '#0B132B',
                    border: '1px solid #1E2E4E',
                    borderRadius: '8px',
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
                <textarea
                  rows="6"
                  value={sections.section5_content_block.content}
                  onChange={(e) => setSections(prev => ({ ...prev, section5_content_block: { ...prev.section5_content_block, content: e.target.value } }))}
                  style={{
                    width: '100%',
                    padding: '0.85rem 1rem',
                    background: '#0B132B',
                    border: '1px solid #1E2E4E',
                    borderRadius: '8px',
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
              SEO HEAD TAGS (RAW HTML & METADATA SUITE)
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1rem', color: '#FFFFFF' }}>
                <Globe size={18} color="#60A5FA" />
                <span>SEO Head Tags &amp; Metadata</span>
              </div>
              <span style={{ background: '#1E293B', color: '#94A3B8', fontSize: '0.72rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                RAW HTML
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>
                  HEAD TAGS (RAW HTML PREVIEW)
                </label>
                <div style={{
                  background: '#0B132B',
                  border: '1px solid #1E2E4E',
                  borderRadius: '8px',
                  padding: '1rem',
                  fontFamily: 'monospace',
                  fontSize: '0.78rem',
                  color: '#93C5FD',
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap'
                }}>
                  {`<title>${seoData.meta_title || `${sections.hero.h1} | Compassionate Love of Calvary`}</title>\n<meta name="description" content="${seoData.meta_description || (sections.hero.subheading ? sections.hero.subheading.slice(0, 160) : '')}" />\n<meta name="keywords" content="${seoData.meta_keywords || 'ministry, prayer, faith, Calvary, Tamil Nadu'}" />\n<link rel="canonical" href="${seoData.canonical_url || `https://www.loveofcalvary.org/${selectedPage === 'home' ? '' : selectedPage}`}" />\n<meta name="robots" content="${seoData.robots_index ? 'index' : 'noindex'}, ${seoData.robots_follow ? 'follow' : 'nofollow'}" />`}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>
                    SEO META TITLE
                  </label>
                  <input
                    type="text"
                    value={seoData.meta_title}
                    onChange={(e) => setSeoData(prev => ({ ...prev, meta_title: e.target.value }))}
                    placeholder="Custom meta title tag"
                    style={{ width: '100%', padding: '0.65rem 0.85rem', background: '#0B132B', border: '1px solid #1E2E4E', borderRadius: '8px', color: '#FFFFFF', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>
                    PRIMARY FOCUS KEYWORD
                  </label>
                  <input
                    type="text"
                    value={seoData.focus_keyword}
                    onChange={(e) => setSeoData(prev => ({ ...prev, focus_keyword: e.target.value }))}
                    placeholder="e.g. Calvary ministry in Tamil Nadu"
                    style={{ width: '100%', padding: '0.65rem 0.85rem', background: '#0B132B', border: '1px solid #1E2E4E', borderRadius: '8px', color: '#FFFFFF', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>
                  META DESCRIPTION
                </label>
                <textarea
                  rows="2"
                  value={seoData.meta_description}
                  onChange={(e) => setSeoData(prev => ({ ...prev, meta_description: e.target.value }))}
                  placeholder="Snippet displayed in search engine results (120–160 chars recommended)"
                  style={{ width: '100%', padding: '0.65rem 0.85rem', background: '#0B132B', border: '1px solid #1E2E4E', borderRadius: '8px', color: '#CBD5E1', fontSize: '0.85rem' }}
                />
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
                  onChange={(e) => setPageSettings(prev => ({ ...prev, slug: e.target.value }))}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', background: '#0B132B', border: '1px solid #1E2E4E', borderRadius: '6px', color: '#FFFFFF', fontSize: '0.82rem', fontFamily: 'monospace' }}
                />
                <span style={{ fontSize: '0.68rem', color: '#64748B', marginTop: '0.2rem', display: 'block' }}>
                  Page URL: loveofcalvary.org/{pageSettings.slug || ''}
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
