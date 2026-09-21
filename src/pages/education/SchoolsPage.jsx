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
          <SparkleIcon className="absolute -start-2.5 -top-2.5 h-5 w-5 sm:-start-3 sm:-top-3 sm:h-6 sm:w-6 md:-start-4 md:-top-4 md:h-7 md:w-7" />
          <span className="inline-block rounded-full border-2 border-carissma-200 bg-white px-5 py-2 text-xl font-extrabold text-carissma-600 shadow-sm sm:px-7 sm:py-2.5 sm:text-2xl md:text-3xl">
            {t('education.schools.title')}
          </span>
        </div>

        {loading && <p className="mt-10 text-espresso-500">{t('education.schools.loading')}</p>}
        {error && <p className="mt-10 text-carnation-600">{error}</p>}
        {!loading && !error && schools.length === 0 && (
          <p className="mt-10 text-espresso-500">{t('education.schools.empty')}</p>
        )}

        {!loading && !error && schools.length > 0 && (
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
            {schools.map((s) => (
              <Link
                key={s.id}
                to={`/education/${s.id}`}
                className="overflow-hidden rounded-2xl border border-carissma-100 bg-white shadow-sm transition hover:border-carissma-300 hover:shadow-md"
              >
                <div className="flex aspect-square items-center justify-center bg-carissma-100 p-4 sm:p-6 lg:p-8">
                  <img
                    src={s.logoUrl || '/logo-mark.png'}
                    alt={schoolName(s, i18n.language)}
                    className="h-full w-full object-contain"
                  />
                </div>
                <p className="px-2 py-2.5 text-center text-xs font-extrabold leading-snug text-espresso-900 sm:px-3 sm:py-3.5 sm:text-sm lg:text-base">
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
