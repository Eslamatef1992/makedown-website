import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SiteLayout from '../components/layout/SiteLayout';
import StickerHeading from '../components/ui/StickerHeading';
import { SparkleIcon } from '../components/ui/icons';
import { getCmsPage } from '../api/content.api';
import { pickLang } from '../utils/bilingual';

// Renders any admin-managed CMS page by slug: about-us, privacy-policy,
// terms-and-conditions, return-policy, how-it-works.
export default function StaticPage({ slug: slugProp, title: titleProp }) {
  const { t, i18n } = useTranslation();
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
        if (!cancelled) setError(t('staticPage.loadError'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug, t]);

  return (
    <SiteLayout>
      <div className="relative mx-auto max-w-[1400px] px-4 py-10 sm:px-6 lg:px-10">
        <SparkleIcon className="pointer-events-none absolute end-6 top-2 h-7 w-7 sm:end-10 sm:top-4 sm:h-8 sm:w-8" />

        <StickerHeading as="h1" className="text-2xl sm:text-3xl">
          {(page && pickLang(page, 'title', i18n.language)) || titleProp || ''}
        </StickerHeading>

        {loading && <p className="mt-10 text-espresso-500">{t('common.loading')}</p>}
        {error && <p className="mt-10 text-carnation-600">{error}</p>}

        {!loading && !error && page && (
          <div
            className="prose prose-espresso mt-10 max-w-none text-espresso-700
              prose-headings:font-extrabold prose-headings:text-espresso-900
              prose-p:leading-relaxed
              prose-ul:list-disc prose-ul:pl-5 prose-li:marker:text-carissma-400
              prose-a:text-carissma-600 prose-a:no-underline hover:prose-a:underline"
            dangerouslySetInnerHTML={{ __html: pickLang(page, 'content_html', i18n.language) || '' }}
          />
        )}
      </div>
    </SiteLayout>
  );
}
