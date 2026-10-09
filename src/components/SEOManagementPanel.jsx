import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle, Check, CheckCircle2, Copy, ExternalLink, FileJson2,
  Globe, Loader2, Monitor, Search, Smartphone, Sparkles
} from 'lucide-react';
import { api } from '../services/api';
import '../styles/seo-management.css';

const slugify = (value) => value
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .trim()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '');

const isHttpsUrl = (value) => {
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
};

const getPageUrl = (path, slug) => {
  if (path === '/') return `${window.location.origin}/`;
  const route = slug ? `/${slug}` : path;
  return new URL(route, window.location.origin).toString();
};

const getDefaultSchema = (page, data) => ({
  '@context': 'https://schema.org',
  '@type': data.schema_type || 'WebPage',
  name: data.meta_title || page.name,
  description: data.meta_description || '',
  url: data.canonical_url || getPageUrl(page.path, data.slug),
});

const SEOManagementPanel = ({ page }) => {
  const [savedData, setSavedData] = useState({});
  const [draft, setDraft] = useState({});
  const [title, setTitle] = useState(page.name);
  const [autoSlug, setAutoSlug] = useState(true);
  const [autoCanonical, setAutoCanonical] = useState(true);
  const [loading, setLoading] = useState(true);
  const [savingElement, setSavingElement] = useState('');
  const [editingElement, setEditingElement] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [copied, setCopied] = useState(false);
  const [device, setDevice] = useState('desktop');

  useEffect(() => {
    let isMounted = true;

    api.getAdminPageSEO(page.id)
      .then((data) => {
        if (!isMounted) return;
        const initial = {
          ...data,
          is_published: data.is_published !== false,
          slug: data.slug || page.path.split('/').filter(Boolean).pop() || '',
          canonical_url: data.canonical_url || getPageUrl(page.path, data.slug),
          meta_title: data.meta_title || data.h1_heading || page.name,
          meta_description: data.meta_description || '',
          focus_keyword: data.focus_keyword || '',
          schema_type: data.schema_type || 'WebPage',
        };
        setSavedData(initial);
        setDraft(initial);
        setTitle(initial.meta_title);
        setAutoSlug(!data.slug);
        setAutoCanonical(!data.canonical_url);
      })
      .catch((error) => {
        console.error(`Failed to load SEO details for ${page.id}:`, error);
        if (isMounted) setFeedback({ type: 'error', text: 'Could not load this page’s SEO settings.' });
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [page]);

  const currentUrl = useMemo(
    () => getPageUrl(page.path, draft.slug),
    [page.path, draft.slug]
  );
  const liveUrl = useMemo(
    () => getPageUrl(page.path, savedData.slug),
    [page.path, savedData.slug]
  );

  const schemaText = useMemo(() => {
    if (Object.hasOwn(draft, 'schema_json')) {
      if (!draft.schema_json) return '';
      return typeof draft.schema_json === 'string'
        ? draft.schema_json
        : JSON.stringify(draft.schema_json, null, 2);
    }
    return JSON.stringify(getDefaultSchema(page, draft), null, 2);
  }, [draft, page]);

  const schemaValidation = useMemo(() => {
    try {
      const parsed = JSON.parse(schemaText);
      if (
        !parsed ||
        typeof parsed !== 'object' ||
        Array.isArray(parsed) ||
        parsed['@context'] !== 'https://schema.org' ||
        typeof parsed['@type'] !== 'string'
      ) {
        return { valid: false, message: 'Schema must include @context and @type.' };
      }
      return { valid: true, message: 'Valid JSON-LD object' };
    } catch {
      return { valid: false, message: 'Fix the JSON syntax before publishing.' };
    }
  }, [schemaText]);

  const grade = useMemo(() => {
    const titleLength = (draft.meta_title || '').trim().length;
    const descriptionLength = (draft.meta_description || '').trim().length;
    const focusKeyword = (draft.focus_keyword || '').trim().toLowerCase();
    const sectionContent = Object.values(draft.sections_data || {}).flatMap((section) => (
      typeof section === 'string'
        ? [section]
        : section && typeof section === 'object'
          ? Object.values(section).filter((value) => typeof value === 'string')
          : []
    ));
    const pageContent = [draft.body_content || '', ...sectionContent]
      .join(' ')
      .replace(/<[^>]*>/g, ' ')
      .split(/\s+/)
      .slice(0, 100)
      .join(' ')
      .toLowerCase();
    const checks = [
      Boolean(draft.slug && draft.slug.length <= 75 && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(draft.slug)),
      titleLength >= 45 && titleLength <= 60,
      descriptionLength >= 120 && descriptionLength <= 160,
      Boolean(focusKeyword && (draft.meta_title || '').toLowerCase().includes(focusKeyword)),
      Boolean(focusKeyword && (draft.slug || '').toLowerCase().includes(slugify(focusKeyword))),
      Boolean(focusKeyword && pageContent.includes(focusKeyword)),
      isHttpsUrl(draft.canonical_url),
      schemaValidation.valid,
    ];
    const score = Math.round((checks.filter(Boolean).length / checks.length) * 100);
    return {
      score,
      label: score >= 85 ? 'Excellent' : score >= 50 ? 'Good' : 'Needs Work',
      tone: score >= 85 ? 'excellent' : score >= 50 ? 'good' : 'needs-work',
    };
  }, [draft, schemaValidation.valid]);

  const updateDraft = (updates) => setDraft((current) => ({ ...current, ...updates }));

  const publish = async (element, updates) => {
    setSavingElement(element);
    setFeedback(null);
    try {
      const next = { ...draft, ...updates };
      const savedFields = [
        'h1_heading',
        'featured_image_url',
        'meta_title',
        'meta_description',
        'meta_keywords',
        'focus_keyword',
        'canonical_url',
        'og_title',
        'og_description',
        'og_image_url',
        'twitter_card',
        'schema_type',
        'robots_index',
        'robots_follow',
        'sections_data',
        'slug',
        'schema_json',
        'is_published',
      ];
      const payload = savedFields.reduce((fields, key) => {
        const value = Object.hasOwn(updates, key) ? updates[key] : savedData[key];
        if (value !== undefined) fields[key] = value;
        return fields;
      }, { page_identifier: page.id });
      const result = await api.updateAdminPageSEO(page.id, payload);
      const published = { ...next, ...(result && typeof result === 'object' ? result : {}) };
      setSavedData(published);
      setDraft(published);
      setFeedback({ type: 'success', text: `${element} published.` });
      const publishEvent = { pageIdentifier: page.id };
      window.dispatchEvent(new CustomEvent('seo:published', { detail: publishEvent }));
      if (typeof BroadcastChannel !== 'undefined') {
        const channel = new BroadcastChannel('clm-seo-published');
        channel.postMessage(publishEvent);
        channel.close();
      }
    } catch (error) {
      console.error(`Failed to publish ${element} for ${page.id}:`, error);
      setFeedback({ type: 'error', text: `Could not publish ${element}. Please try again.` });
    } finally {
      setSavingElement('');
    }
  };

  const publishSlug = () => publish('URL slug', { slug: draft.slug });
  const publishCanonical = () => publish('Canonical URL', { canonical_url: draft.canonical_url });
  const publishSnippet = () => publish('Search snippet', {
    meta_title: draft.meta_title,
    meta_description: draft.meta_description,
    focus_keyword: draft.focus_keyword,
  });
  const publishSchema = () => {
    if (!schemaValidation.valid) {
      setFeedback({ type: 'error', text: 'Correct the JSON-LD validation errors before publishing.' });
      return;
    }
    let schema;
    try {
      schema = JSON.parse(schemaText);
    } catch {
      setFeedback({ type: 'error', text: 'Correct the JSON-LD validation errors before publishing.' });
      return;
    }
    publish('Schema.org JSON-LD', {
      schema_json: JSON.stringify(schema),
      schema_type: schema['@type'],
    });
  };

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(liveUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch (error) {
      console.error('Could not copy the live page URL:', error);
      setFeedback({ type: 'error', text: 'Clipboard access is unavailable in this browser.' });
    }
  };

  const canonicalIsValid = isHttpsUrl(draft.canonical_url);
  const hasUnpublishedChanges = [
    'slug',
    'canonical_url',
    'meta_title',
    'meta_description',
    'focus_keyword',
    'schema_json',
  ].some((key) => draft[key] !== savedData[key]);

  const editButton = (element, label = 'Edit') => (
    <button
      type="button"
      className="seo-action-button seo-action-secondary"
      onClick={() => setEditingElement((current) => current === element ? '' : element)}
    >
      {label}
    </button>
  );

  const publishButton = (element, onClick, disabled = false) => (
    <button
      type="button"
      className="seo-action-button seo-action-publish"
      onClick={onClick}
      disabled={disabled || Boolean(savingElement)}
    >
      {savingElement === element ? <Loader2 size={15} className="seo-spin" /> : <Check size={15} />}
      {savingElement === element ? 'Publishing…' : `Publish ${element}`}
    </button>
  );

  if (loading) {
    return (
      <section className="seo-management-panel" aria-live="polite">
        <div className="seo-panel-loading"><Loader2 className="seo-spin" /> Loading SEO settings…</div>
      </section>
    );
  }

  return (
    <section className="seo-management-panel">
      <header className="seo-panel-heading">
        <div>
          <p className="seo-panel-eyebrow">Page SEO controls</p>
          <h2>{page.name} <span className="seo-status-pill"><CheckCircle2 size={14} />{savedData.is_published === false ? 'Draft' : hasUnpublishedChanges ? 'Modified' : 'Published'}</span></h2>
          <p>Changes are saved independently for this page using the admin SEO service.</p>
        </div>
        <a className="seo-action-button seo-action-secondary" href={liveUrl} target="_blank" rel="noopener noreferrer">
          <ExternalLink size={15} /> Visit live page
        </a>
      </header>

      {feedback && (
        <div className={`seo-feedback seo-feedback-${feedback.type}`} role="status">
          {feedback.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          {feedback.text}
        </div>
      )}

      <div className="seo-management-grid">
        <article className="seo-management-card">
          <div className="seo-card-title"><Globe size={18} /><h3>URL slug</h3><span className={`seo-mini-status ${draft.slug !== savedData.slug ? 'seo-status-warning' : ''}`}>{draft.slug === savedData.slug ? 'Published' : 'Unpublished changes'}</span></div>
          <p className="seo-card-description">Generate a clean URL from the title or enter a custom slug.</p>
          {editingElement === 'slug' && (
            <div className="seo-field-stack">
              <label>Page title
                <input value={title} onChange={(event) => {
                  const nextTitle = event.target.value;
                  setTitle(nextTitle);
                  if (autoSlug) {
                    const slug = slugify(nextTitle);
                    updateDraft({
                      slug,
                      ...(autoCanonical ? { canonical_url: getPageUrl(page.path, slug) } : {}),
                    });
                  }
                }} />
              </label>
              <label>URL slug
                <div className="seo-slug-input"><span>/</span><input value={page.path === '/' ? '' : draft.slug || ''} disabled={page.path === '/'} onChange={(event) => {
                  setAutoSlug(false);
                  const slug = slugify(event.target.value);
                  updateDraft({
                    slug,
                    ...(autoCanonical ? { canonical_url: getPageUrl(page.path, slug) } : {}),
                  });
                }} /></div>
              </label>
              <button className="seo-text-button" type="button" onClick={() => {
                setAutoSlug(true);
                const slug = page.path === '/' ? '' : slugify(title);
                updateDraft({
                  slug,
                  ...(autoCanonical ? { canonical_url: getPageUrl(page.path, slug) } : {}),
                });
              }} disabled={page.path === '/'}>Reset slug from title</button>
            </div>
          )}
          {page.path === '/' && <p className="seo-card-description">The home page root route is fixed.</p>}
          <div className="seo-card-actions">{editButton('slug')}{publishButton('URL slug', publishSlug, page.path === '/')}</div>
        </article>

        <article className="seo-management-card">
          <div className="seo-card-title"><Globe size={18} /><h3>Canonical URL</h3><span className={`seo-mini-status ${draft.canonical_url !== savedData.canonical_url ? 'seo-status-warning' : canonicalIsValid ? '' : 'seo-status-warning'}`}>{draft.canonical_url !== savedData.canonical_url ? 'Unpublished changes' : canonicalIsValid ? 'Valid HTTPS' : 'Needs HTTPS'}</span></div>
          <p className="seo-card-description">Set the preferred URL search engines should index.</p>
          {editingElement === 'canonical' && (
            <label className="seo-field-stack">Canonical URL
              <input type="url" value={draft.canonical_url || ''} onChange={(event) => {
                setAutoCanonical(false);
                updateDraft({ canonical_url: event.target.value });
              }} placeholder="https://example.org/page" />
            </label>
          )}
          <div className="seo-url-value">{draft.canonical_url || 'No canonical URL configured'}</div>
          <div className="seo-card-actions">{editButton('canonical')}{publishButton('Canonical URL', publishCanonical, !canonicalIsValid)}</div>
        </article>

        <article className="seo-management-card seo-live-url-card">
          <div className="seo-card-title"><ExternalLink size={18} /><h3>Live published URL</h3><span className="seo-mini-status">Published</span></div>
          <div className="seo-live-url">{liveUrl}</div>
          <div className="seo-card-actions">
            <button type="button" className="seo-action-button seo-action-secondary" onClick={copyUrl}>{copied ? <Check size={15} /> : <Copy size={15} />}{copied ? 'Copied' : 'Copy URL'}</button>
            {editButton('slug', 'Edit URL')}
            {publishButton('URL slug', publishSlug, page.path === '/')}
          </div>
        </article>

        <article className="seo-management-card">
          <div className="seo-card-title"><Sparkles size={18} /><h3>SEO optimization grade</h3><span className={`seo-grade-pill ${grade.tone}`}>{grade.label}</span></div>
          <div className="seo-grade-summary"><strong>{grade.score}</strong><span>/ 100</span><div className="seo-grade-track"><span className={grade.tone} style={{ width: `${grade.score}%` }} /></div></div>
          <p className="seo-card-description">Based on title, description, keyword, slug, canonical URL, and valid structured data.</p>
          <div className="seo-card-actions">{editButton('snippet', 'Edit SEO details')}{publishButton('Search snippet', publishSnippet)}</div>
        </article>

        <article className="seo-management-card seo-preview-card">
          <div className="seo-card-title"><Search size={18} /><h3>Google search preview</h3><span className={`seo-mini-status ${draft.meta_title !== savedData.meta_title || draft.meta_description !== savedData.meta_description ? 'seo-status-warning' : ''}`}>{draft.meta_title !== savedData.meta_title || draft.meta_description !== savedData.meta_description ? 'Unpublished changes' : 'Published'}</span><div className="seo-device-controls">
            <button type="button" aria-label="Desktop preview" className={device === 'desktop' ? 'active' : ''} onClick={() => setDevice('desktop')}><Monitor size={15} /></button>
            <button type="button" aria-label="Mobile preview" className={device === 'mobile' ? 'active' : ''} onClick={() => setDevice('mobile')}><Smartphone size={15} /></button>
          </div></div>
          {editingElement === 'snippet' && (
            <div className="seo-field-stack">
              <label>Meta title <span>{(draft.meta_title || '').length}/60</span>
                <input value={draft.meta_title || ''} onChange={(event) => updateDraft({ meta_title: event.target.value })} maxLength={100} />
              </label>
              <label>Meta description <span>{(draft.meta_description || '').length}/160</span>
                <textarea value={draft.meta_description || ''} onChange={(event) => updateDraft({ meta_description: event.target.value })} rows={3} maxLength={300} />
              </label>
              <label>Focus keyword
                <input value={draft.focus_keyword || ''} onChange={(event) => updateDraft({ focus_keyword: event.target.value })} />
              </label>
            </div>
          )}
          <div className={`seo-google-preview ${device}`}>
            <div className="seo-preview-url">{draft.canonical_url || currentUrl}</div>
            <div className="seo-preview-title">{draft.meta_title || page.name}</div>
            <div className="seo-preview-description">{draft.meta_description || 'Add a meta description to preview how this page may appear in search results.'}</div>
          </div>
          <div className="seo-card-actions">{editButton('snippet', 'Edit snippet')}{publishButton('Search snippet', publishSnippet)}</div>
        </article>

        <article className="seo-management-card seo-schema-card">
          <div className="seo-card-title"><FileJson2 size={18} /><h3>Schema.org JSON-LD</h3><span className={`seo-mini-status ${schemaValidation.valid ? '' : 'seo-status-warning'}`}>{schemaValidation.valid ? 'Valid JSON-LD' : 'Invalid JSON-LD'}</span></div>
          {editingElement === 'schema' && (
            <div className="seo-field-stack">
              <label>Structured data JSON
                <textarea className="seo-schema-editor" value={schemaText} onChange={(event) => updateDraft({ schema_json: event.target.value })} rows={8} spellCheck="false" />
              </label>
              <p className={schemaValidation.valid ? 'seo-validation-valid' : 'seo-validation-error'}>{schemaValidation.valid ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}{schemaValidation.message}</p>
            </div>
          )}
          {editingElement !== 'schema' && <pre className="seo-schema-summary">{schemaText}</pre>}
          <div className="seo-card-actions">{editButton('schema', 'Edit schema')}{publishButton('Schema.org JSON-LD', publishSchema, !schemaValidation.valid)}</div>
        </article>
      </div>
    </section>
  );
};

export default SEOManagementPanel;
