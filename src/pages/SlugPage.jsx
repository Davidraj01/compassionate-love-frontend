import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../services/api';
import { findStaticBlogPost } from '../utils/staticBlogData';
import { cleanSlug, resolveSlug } from '../utils/slugs';

// Public Pages for dynamic SEO route mapping
import { HomePage } from './HomePage';
import { AboutPage } from './AboutPage';
import { MinistriesPage } from './MinistriesPage';
import { BiblePage } from './BiblePage';
import { StudyPage } from './StudyPage';
import { DevotionalPage } from './DevotionalPage';
import { SermonsPage } from './SermonsPage';
import { EventsPage } from './EventsPage';
import { BlogPage } from './BlogPage';
import { BlogDetailPage } from './BlogDetailPage';
import { MediaPage } from './MediaPage';
import { ContactPage } from './ContactPage';

export const SEO_PAGE_ROUTES = [
  { id: 'about', Component: AboutPage },
  { id: 'ministries', Component: MinistriesPage },
  { id: 'bible', Component: BiblePage },
  { id: 'study', Component: StudyPage },
  { id: 'devotional', Component: DevotionalPage },
  { id: 'sermons', Component: SermonsPage },
  { id: 'events', Component: EventsPage },
  { id: 'blog', Component: BlogPage },
  { id: 'media', Component: MediaPage },
  { id: 'contact', Component: ContactPage },
];

/**
 * SlugPage Component
 * Dynamically resolves root-level slugs (e.g. `/:slug`) to:
 * 1. Customized SEO page slugs set in the Admin SEO editor (e.g., custom path aliases)
 * 2. Active blog articles if accessed without the `/blog/` prefix
 * 3. Fallback to HomePage if not found
 */
export const SlugPage = () => {
  const { slug } = useParams();
  const [routeResult, setRouteResult] = useState({ slug: null, status: 'loading', Component: null });

  useEffect(() => {
    let isMounted = true;

    Promise.allSettled(
      SEO_PAGE_ROUTES.map(async (page) => ({
        ...page,
        seoData: await api.getPageSEO(page.id),
      }))
    ).then((results) => {
      if (!isMounted) return;

      const successfulResults = results
        .filter((result) => result.status === 'fulfilled')
        .map((result) => result.value);

      const normalizedSlug = cleanSlug(slug);
      const canonicalSlug = resolveSlug(normalizedSlug);

      const match = successfulResults.find(
        (page) => page.seoData?.slug === normalizedSlug || page.seoData?.slug === slug
      );

      if (match) {
        setRouteResult({ slug, status: 'matched', Component: match.Component });
      } else {
        // Check if the slug corresponds to an active or static blog article
        api.getBlogPostBySlug(canonicalSlug)
          .then((blogData) => {
            if (!isMounted) return;
            if (blogData && blogData.post) {
              setRouteResult({ slug, status: 'matched', Component: BlogDetailPage });
            } else if (findStaticBlogPost(canonicalSlug)) {
              setRouteResult({ slug, status: 'matched', Component: BlogDetailPage });
            } else {
              setRouteResult({ slug, status: 'not-found', Component: null });
            }
          })
          .catch(() => {
            if (!isMounted) return;
            if (findStaticBlogPost(canonicalSlug)) {
              setRouteResult({ slug, status: 'matched', Component: BlogDetailPage });
            } else {
              setRouteResult({ slug, status: 'not-found', Component: null });
            }
          });
      }
    });

    return () => {
      isMounted = false;
    };
  }, [slug]);

  if (routeResult.slug !== slug || routeResult.status === 'loading') {
    return (
      <div role="status" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh', fontSize: '1rem', color: '#64748b' }}>
        Loading page…
      </div>
    );
  }

  if (routeResult.status === 'error') {
    return (
      <div role="alert" style={{ textAlign: 'center', padding: '3rem 1rem', color: '#ef4444' }}>
        Unable to load this page. Please try again later.
      </div>
    );
  }

  if (routeResult.status === 'not-found') {
    return <HomePage />;
  }

  const PageComponent = routeResult.Component;
  return <PageComponent />;
};

export const SEOPageSlugRoute = SlugPage;

export default SlugPage;
