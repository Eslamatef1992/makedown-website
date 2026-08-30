import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import SiteLayout from '../components/layout/SiteLayout';
import { getCmsPage } from '../api/content.api';

// Renders any admin-managed CMS page by slug: about-us, privacy-policy,
// terms-and-conditions, return-policy, how-it-works.
export default function StaticPage({ slug: slugProp, title: titleProp }) {
  const params = useParams();
  const slug = slugProp || params.slug;

  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    getCmsPage(slug)
      .then((data) => {
        if (!cancelled) setPage(data);
      })
      .catch(() => {
        if (!cancelled) setError('This page is not available yet.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  return (
    <SiteLayout>
      <div className="mx-auto max-w-3xl px-8 py-16">
        <h1 className="text-3xl font-bold text-espresso-900">{page?.title || titleProp || ''}</h1>
        {loading && <p className="mt-8 text-espresso-500">Loading…</p>}
        {error && <p className="mt-8 text-carnation-600">{error}</p>}
        {!loading && !error && page && (
          <div
            className="prose prose-espresso mt-8 max-w-none text-espresso-700"
            dangerouslySetInnerHTML={{ __html: page.content_html || '' }}
          />
        )}
      </div>
    </SiteLayout>
  );
}
