import React, { useEffect, useState, useMemo } from 'react';
import { api, getMediaUrl } from '../services/api';
import { BookOpen, Sparkles, CheckCircle2 } from 'lucide-react';

/**
 * Helper to compile sections into rich HTML if body_content is missing
 */
const compileSections = (sections) => {
  if (!sections || typeof sections !== 'object') return '';
  const parts = [];

  // 1. Key Features / Core Pillars
  const kf = sections.key_features;
  if (kf && Array.isArray(kf.features) && kf.features.length > 0) {
    parts.push(`
      <section id="key-features" class="page-seo-key-features" style="margin: 2rem 0; padding: 1.5rem; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 1.25rem;">
          <span style="font-size: 0.78rem; font-weight: 800; color: #0284c7; text-transform: uppercase; letter-spacing: 0.05em;">Core Pillars</span>
          <h2 style="font-size: 1.6rem; font-weight: 800; color: #0f172a; margin: 0.3rem 0 0.4rem 0;">${kf.heading || 'Core Pillars & Key Ministry Features'}</h2>
          ${kf.subheading ? `<p style="font-size: 0.95rem; color: #64748b; margin: 0 auto; max-width: 650px;">${kf.subheading}</p>` : ''}
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem;">
          ${kf.features.map(f => `
            <div class="key-feature-card" style="padding: 1.2rem; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.03);">
              <h3 style="font-size: 1.05rem; font-weight: 700; color: #0f172a; margin: 0 0 0.4rem 0;">${f.title}</h3>
              <p style="font-size: 0.88rem; color: #475569; line-height: 1.5; margin: 0 0 0.6rem 0;">${f.desc}</p>
              ${f.link ? `<a href="${f.link}" style="color: #0284c7; font-weight: 700; font-size: 0.82rem; text-decoration: underline;">${f.linkText || 'Learn More'} &rarr;</a>` : ''}
            </div>
          `).join('')}
        </div>
      </section>
    `);
  }

  // 2. Section 2: Content & Image
  const s2 = sections.section2_content_image;
  if (s2 && (s2.heading || s2.content || s2.imageUrl)) {
    parts.push(`
      <section class="page-seo-section-2" style="margin: 2.2rem 0;">
        ${s2.eyebrow ? `<span style="font-size: 0.8rem; font-weight: 800; color: #d4af37; text-transform: uppercase;">${s2.eyebrow}</span>` : ''}
        ${s2.heading ? `<h2 style="font-size: 1.6rem; font-weight: 800; color: #0f172a; margin: 0.4rem 0 1.2rem 0;">${s2.heading}</h2>` : ''}
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; align-items: center;">
          <div class="page-seo-content-col" style="font-size: 1rem; line-height: 1.7; color: #334155;">
            ${s2.content || ''}
          </div>
          ${s2.imageUrl ? `
            <div class="page-seo-image-col">
              <img src="${s2.imageUrl}" alt="${s2.heading || 'Ministry Image'}" style="width: 100%; border-radius: 12px; box-shadow: 0 6px 20px rgba(0,0,0,0.08); object-fit: cover; max-height: 380px;" />
            </div>
          ` : ''}
        </div>
      </section>
    `);
  }

  // 3. Sections 3, 4, 5: Content Blocks
  ['section3_content_block', 'section4_content_block', 'section5_content_block'].forEach(key => {
    const s = sections[key];
    if (s && (s.heading || s.content)) {
      parts.push(`
        <section class="page-seo-content-block" style="margin: 2.2rem 0; padding-top: 1.5rem; border-top: 1px solid #e2e8f0;">
          ${s.heading ? `<h2 style="font-size: 1.45rem; font-weight: 800; color: #0f172a; margin-bottom: 0.85rem;">${s.heading}</h2>` : ''}
          <div style="font-size: 1rem; line-height: 1.75; color: #334155; white-space: pre-wrap;">${s.content}</div>
        </section>
      `);
    }
  });

  // 4. Testimonials
  if (sections.testimonials?.raw) {
    const items = sections.testimonials.raw.split('\n\n').filter(Boolean);
    parts.push(`
      <section class="page-seo-testimonials-block" style="margin: 2.2rem 0; padding: 1.75rem; background: #f1f5f9; border-radius: 12px;">
        <h2 style="font-size: 1.4rem; font-weight: 800; color: #0f172a; margin-bottom: 1rem;">Community Voices &amp; Testimonies</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1rem;">
          ${items.map(item => `
            <div style="padding: 1.1rem; background: #ffffff; border-radius: 8px; border: 1px solid #cbd5e1;">
              <pre style="font-family: inherit; font-size: 0.88rem; color: #334155; white-space: pre-wrap; margin: 0;">${item}</pre>
            </div>
          `).join('')}
        </div>
      </section>
    `);
  }

  // 5. FAQ Block
  if (sections.faq?.raw) {
    const qas = sections.faq.raw.split('\n\n').filter(Boolean);
    parts.push(`
      <section class="page-seo-faq-block" style="margin: 2.2rem 0;">
        <h2 style="font-size: 1.45rem; font-weight: 800; color: #0f172a; margin-bottom: 1rem;">Frequently Asked Questions</h2>
        <div style="display: flex; flex-direction: column; gap: 0.75rem;">
          ${qas.map(qa => `
            <div style="padding: 1rem 1.25rem; background: #f8fafc; border-left: 4px solid #0284c7; border-radius: 6px;">
              <pre style="font-family: inherit; font-size: 0.9rem; color: #1e293b; white-space: pre-wrap; margin: 0; line-height: 1.6;">${qa}</pre>
            </div>
          `).join('')}
        </div>
      </section>
    `);
  }

  // 6. Lead / Prayer Request CTA Form
  if (sections.lead_form && (sections.lead_form.title || sections.lead_form.buttonText)) {
    parts.push(`
      <section class="page-seo-lead-cta" style="margin: 2.5rem 0 1rem 0; padding: 2rem; background: linear-gradient(135deg, #0b192c 0%, #1e293b 100%); border-radius: 12px; text-align: center; color: #ffffff;">
        <h2 style="font-size: 1.55rem; font-weight: 800; color: #ffffff; margin: 0 0 0.6rem 0;">${sections.lead_form.title}</h2>
        ${sections.lead_form.description ? `<p style="font-size: 0.95rem; color: #cbd5e1; max-width: 600px; margin: 0 auto 1.25rem auto; line-height: 1.6;">${sections.lead_form.description}</p>` : ''}
        <a href="${sections.lead_form.targetLink || '/contact'}" class="btn-cta" style="display: inline-block; padding: 11px 26px; background: #d4af37; color: #0b192c; font-weight: 800; border-radius: 8px; text-decoration: none; font-size: 0.95rem;">
          ${sections.lead_form.buttonText || 'Contact Pastoral Team'} &rarr;
        </a>
      </section>
    `);
  }

  return parts.join('\n');
};

/**
 * Injects head tags dynamically and handles custom raw head tags
 */
const injectHeadTags = (data, pageIdentifier, defaultTitle, defaultDesc) => {
  if (!data) return;

  const pageTitle = data.meta_title || defaultTitle || `${pageIdentifier.charAt(0).toUpperCase() + pageIdentifier.slice(1)} | Compassionate Love of Calvary Ministries`;
  const pageDescription = data.meta_description || defaultDesc || "Compassionate Love of Calvary Ministries - Rooted in prayer, anchored in Biblical truth, and sharing the boundless love of Christ.";
  const canonicalUrl = data.canonical_url || `https://www.loveofcalvary.org${pageIdentifier === 'home' ? '' : '/' + pageIdentifier}`;
  const ogImg = data.og_image_url || data.featured_image_url || 'https://www.loveofcalvary.org/logo.png';

  document.title = pageTitle;

  const setMetaByName = (name, content) => {
    if (!content) return;
    let el = document.querySelector(`meta[name="${name}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute('name', name);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  };

  const setMetaByProperty = (property, content) => {
    if (!content) return;
    let el = document.querySelector(`meta[property="${property}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute('property', property);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  };

  setMetaByName('description', pageDescription);
  
  const keywords = [data.focus_keyword, data.meta_keywords].filter(Boolean).join(', ');
  if (keywords) {
    setMetaByName('keywords', keywords);
  }

  let canonicalEl = document.querySelector('link[rel="canonical"]');
  if (!canonicalEl) {
    canonicalEl = document.createElement('link');
    canonicalEl.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalEl);
  }
  canonicalEl.setAttribute('href', canonicalUrl);

  const robotsIndex = data.robots_index !== false ? 'index' : 'noindex';
  const robotsFollow = data.robots_follow !== false ? 'follow' : 'nofollow';
  setMetaByName('robots', `${robotsIndex}, ${robotsFollow}, max-snippet:-1, max-image-preview:large, max-video-preview:-1`);

  setMetaByProperty('og:title', data.og_title || pageTitle);
  setMetaByProperty('og:description', data.og_description || pageDescription);
  setMetaByProperty('og:url', canonicalUrl);
  setMetaByProperty('og:type', 'website');
  setMetaByProperty('og:site_name', 'Compassionate Love of Calvary Ministries');
  if (ogImg) {
    setMetaByProperty('og:image', getMediaUrl(ogImg));
  }

  setMetaByName('twitter:card', data.twitter_card || 'summary_large_image');
  setMetaByName('twitter:title', data.og_title || pageTitle);
  setMetaByName('twitter:description', data.og_description || pageDescription);
  if (ogImg) {
    setMetaByName('twitter:image', getMediaUrl(ogImg));
  }

  // Schema.org JSON-LD
  const scriptId = `clm-schema-${pageIdentifier}`;
  let scriptEl = document.getElementById(scriptId);
  if (!scriptEl) {
    scriptEl = document.createElement('script');
    scriptEl.id = scriptId;
    scriptEl.type = 'application/ld+json';
    document.head.appendChild(scriptEl);
  }

  let schemaObject;
  try {
    schemaObject = data.schema_json
      ? typeof data.schema_json === 'string' ? JSON.parse(data.schema_json) : data.schema_json
      : null;
  } catch (err) {
    console.error(`Invalid Schema.org JSON-LD for ${pageIdentifier}:`, err);
  }

  schemaObject = schemaObject && typeof schemaObject === 'object' && !Array.isArray(schemaObject)
    ? schemaObject
    : {
      "@context": "https://schema.org",
      "@type": data.schema_type || "Church",
      "name": "Compassionate Love of Calvary Ministries",
      "headline": pageTitle,
      "description": pageDescription,
      "url": canonicalUrl,
      "keywords": keywords || "Compassionate Love of Calvary Ministries, Church Chengalpattu, Prayer, Bible Study",
      "about": [
        data.focus_keyword || "Compassionate Love of Calvary Ministries",
        "Christian Ministry Chengalpattu",
        "Bible Teaching and Prayer",
        "Gospel Mission Tamil Nadu"
      ],
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": canonicalUrl
      },
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.loveofcalvary.org/logo.png",
        "width": 500,
        "height": 500
      },
      "image": getMediaUrl(ogImg),
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "81/5, 6th Street, Shanthi Nagar",
        "addressLocality": "Chengalpattu",
        "addressRegion": "Tamil Nadu",
        "postalCode": "603003",
        "addressCountry": "IN"
      }
    };

  scriptEl.textContent = JSON.stringify(schemaObject);

  // Custom Raw Head Tags injection
  if (data.raw_head_tags) {
    const rawContainerId = `clm-raw-head-${pageIdentifier}`;
    let rawContainer = document.getElementById(rawContainerId);
    if (!rawContainer) {
      rawContainer = document.createElement('div');
      rawContainer.id = rawContainerId;
      rawContainer.style.display = 'none';
      document.head.appendChild(rawContainer);
    }
    rawContainer.innerHTML = data.raw_head_tags;
  }
};

/**
 * PageSEOSection Component
 */
export const PageSEOSection = ({ pageIdentifier, defaultTitle = '', defaultDesc = '', className = '' }) => {
  const [seoData, setSeoData] = useState(() => {
    try {
      const cached = localStorage.getItem(`clm_seo_${pageIdentifier}`);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(!seoData);

  useEffect(() => {
    if (!pageIdentifier) return;
    let isMounted = true;

    // Apply cached immediately if available
    if (seoData) {
      injectHeadTags(seoData, pageIdentifier, defaultTitle, defaultDesc);
    }

    const fetchSEO = async () => {
      try {
        const data = await api.getPageSEO(pageIdentifier);
        if (isMounted && data) {
          let cached = null;
          try {
            const cachedRaw = localStorage.getItem(`clm_seo_${pageIdentifier}`);
            cached = cachedRaw ? JSON.parse(cachedRaw) : null;
          } catch {}

          // Intelligently merge so admin block content is never overwritten by empty backend responses
          const mergedData = {
            ...cached,
            ...data,
            body_content: (data.body_content && data.body_content.trim())
              ? data.body_content
              : (cached?.body_content || ''),
            sections_data: (data.sections_data && Object.keys(data.sections_data).length > 0)
              ? data.sections_data
              : (cached?.sections_data || null),
            focus_keyword: data.focus_keyword || cached?.focus_keyword || '',
            raw_head_tags: data.raw_head_tags || cached?.raw_head_tags || '',
          };

          setSeoData(mergedData);
          injectHeadTags(mergedData, pageIdentifier, defaultTitle, defaultDesc);
          try {
            localStorage.setItem(`clm_seo_${pageIdentifier}`, JSON.stringify(mergedData));
          } catch {}
        }
      } catch (err) {
        console.warn(`Could not load page SEO for ${pageIdentifier}:`, err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchSEO();

    const handlePublishedSEO = (event) => {
      if (event.detail?.pageIdentifier === pageIdentifier) {
        if (event.detail?.data) {
          setSeoData(event.detail.data);
          injectHeadTags(event.detail.data, pageIdentifier, defaultTitle, defaultDesc);
        } else {
          try {
            const cached = localStorage.getItem(`clm_seo_${pageIdentifier}`);
            if (cached) {
              const parsed = JSON.parse(cached);
              setSeoData(parsed);
              injectHeadTags(parsed, pageIdentifier, defaultTitle, defaultDesc);
            }
          } catch {}
          fetchSEO();
        }
      }
    };

    const seoChannel = typeof BroadcastChannel !== 'undefined'
      ? new BroadcastChannel('clm-seo-published')
      : null;

    const handleBroadcastSEO = (event) => {
      if (event.data?.pageIdentifier === pageIdentifier) {
        if (event.data?.data) {
          setSeoData(event.data.data);
          injectHeadTags(event.data.data, pageIdentifier, defaultTitle, defaultDesc);
        } else {
          try {
            const cached = localStorage.getItem(`clm_seo_${pageIdentifier}`);
            if (cached) {
              const parsed = JSON.parse(cached);
              setSeoData(parsed);
              injectHeadTags(parsed, pageIdentifier, defaultTitle, defaultDesc);
            }
          } catch {}
          fetchSEO();
        }
      }
    };

    window.addEventListener('seo:published', handlePublishedSEO);
    seoChannel?.addEventListener('message', handleBroadcastSEO);

    return () => {
      isMounted = false;
      window.removeEventListener('seo:published', handlePublishedSEO);
      seoChannel?.removeEventListener('message', handleBroadcastSEO);
      seoChannel?.close();
      const scriptEl = document.getElementById(`clm-schema-${pageIdentifier}`);
      if (scriptEl) scriptEl.remove();
      const rawContainer = document.getElementById(`clm-raw-head-${pageIdentifier}`);
      if (rawContainer) rawContainer.remove();
    };
  }, [pageIdentifier, defaultTitle, defaultDesc]);

  const renderedContent = useMemo(() => {
    if (!seoData) return '';
    if (seoData.body_content && seoData.body_content.trim()) {
      return seoData.body_content;
    }
    if (seoData.sections_data) {
      return compileSections(seoData.sections_data);
    }
    return '';
  }, [seoData]);

  if (!seoData || (!renderedContent && !seoData.h1_heading)) {
    return null;
  }

  const featuredImg = getMediaUrl(seoData.featured_image_url);

  return (
    <section className={`section page-seo-article-section ${className}`} id={`seo-content-${pageIdentifier}`}>
      <div className="container" style={{ maxWidth: '980px' }}>
        <article className="page-seo-article-card">
          
          {/* Header & H1 Heading */}
          {seoData.h1_heading && (!renderedContent || !renderedContent.includes('<h1')) && (
            <div className="page-seo-header">
              <span className="section-badge">
                <Sparkles size={14} style={{ display: 'inline', marginRight: '6px' }} />
                Ministry &amp; Biblical Insights
              </span>
              <h1 className="page-seo-h1">
                {seoData.h1_heading}
              </h1>
            </div>
          )}

          {/* Featured Image */}
          {featuredImg && (
            <div className="page-seo-featured-wrap">
              <img 
                src={featuredImg} 
                alt={seoData.h1_heading || 'Calvary Ministries'} 
                className="page-seo-featured-img"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>
          )}

          {/* Rich Body Content (Rendered live from Admin Page SEO Suite) */}
          {renderedContent && (
            <div 
              className="page-seo-rich-body"
              dangerouslySetInnerHTML={{ __html: renderedContent }}
            />
          )}

          {/* Footer Badge / Attribution */}
          <div className="page-seo-footer">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              <BookOpen size={16} color="var(--gold-primary)" />
              <span>Compassionate Love of Calvary Ministries &bull; Chengalpattu, Tamil Nadu</span>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
};

