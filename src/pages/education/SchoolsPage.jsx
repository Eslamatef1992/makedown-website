import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SiteLayout from '../../components/layout/SiteLayout';
import { SparkleIcon } from '../../components/ui/icons';
import { listSchools } from '../../api/content.api';

// Schools carry nameEn/nameAr (camelCase, from schools.controller.js) rather
// than the usual snake_case _en/_ar pair, so this picks the display name
// directly instead of going through the shared pickLang() helper.
function schoolName(school, lang) {
  return (lang?.startsWith('ar') && school.nameAr) || school.nameEn;
}

export default function SchoolsPage() {
  const { t, i18n } = useTranslation();
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    listSchools()
      .then((data) => {
        if (!cancelled) setSchools(data || []);
      })
      .catch(() => {
        if (!cancelled) setError(t('education.schools.loadError'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [t]);

  return (
    <SiteLayout>
      <div className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 lg:px-10">
        <nav className="text-sm font-semibold text-espresso-500">
          {t('nav.education')}
          <span className="mx-1.5 text-carissma-400">›</span>
          <span className="text-carissma-500">{t('education.schools.title')}</span>
        </nav>

        <div className="relative mt-5 inline-block">
          <SparkleIcon className="absolute -start-3 -top-3 h-6 w-6 sm:-start-4 sm:-top-4 sm:h-7 sm:w-7" />
          <span className="inline-block rounded-full border-2 border-carissma-200 bg-white px-7 py-2.5 text-2xl font-extrabold text-carissma-600 shadow-sm sm:text-3xl">
            {t('education.schools.title')}
          </span>
        </div>

        {loading && <p className="mt-10 text-espresso-500">{t('education.schools.loading')}</p>}
        {error && <p className="mt-10 text-carnation-600">{error}</p>}
        {!loading && !error && schools.length === 0 && (
          <p className="mt-10 text-espresso-500">{t('education.schools.empty')}</p>
        )}

        {!loading && !error && schools.length > 0 && (
          <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {schools.map((s) => (
              <Link
                key={s.id}
                to={`/education/${s.id}`}
                className="overflow-hidden rounded-2xl border border-carissma-100 bg-white shadow-sm transition hover:border-carissma-300 hover:shadow-md"
              >
                <div className="flex aspect-square items-center justify-center bg-carissma-100 p-8">
                  <img
                    src={s.logoUrl || '/logo-mark.png'}
                    alt={schoolName(s, i18n.language)}
                    className="h-full w-full object-contain"
                  />
                </div>
                <p className="px-3 py-3.5 text-center text-sm font-extrabold text-espresso-900 sm:text-base">
                  {schoolName(s, i18n.language)}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
