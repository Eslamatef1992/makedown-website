import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import SiteLayout from '../components/layout/SiteLayout';
import StickerHeading from '../components/ui/StickerHeading';
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
      <div className="mx-auto max-w-3xl px-6 py-12 sm:px-8 sm:py-16">
        <div className="text-center">
          <StickerHeading as="h1" className="text-2xl sm:text-3xl">
            {page?.title_en || titleProp || ''}
          </StickerHeading>
        </div>

        {loading && <p className="mt-10 text-center text-espresso-500">Loading…</p>}
        {error && <p className="mt-10 text-center text-carnation-600">{error}</p>}

        {!loading && !error && page && (
          <div className="mt-10 rounded-3xl border border-carissma-100 bg-white/70 p-6 sm:p-10">
            <div
              className="prose prose-espresso max-w-none text-espresso-700
                prose-headings:font-extrabold prose-headings:text-espresso-900
                prose-p:leading-relaxed
                prose-ul:list-disc prose-ul:pl-5 prose-li:marker:text-carissma-400
                prose-a:text-carissma-600 prose-a:no-underline hover:prose-a:underline"
              dangerouslySetInnerHTML={{ __html: page.content_html_en || '' }}
            />
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
