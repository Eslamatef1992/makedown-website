import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SiteLayout from '../../components/layout/SiteLayout';
import StickerHeading from '../../components/ui/StickerHeading';
import { listSchools } from '../../api/content.api';

export default function SchoolsPage() {
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
        if (!cancelled) setError('Could not load schools right now.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <SiteLayout>
      <div className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 lg:px-10">
        <StickerHeading as="h1" className="text-2xl">
          Schools
        </StickerHeading>
        <p className="mt-2 text-espresso-600">Browse the schools taking part in Make Down's education program.</p>

        {loading && <p className="mt-10 text-espresso-500">Loading schools…</p>}
        {error && <p className="mt-10 text-carnation-600">{error}</p>}
        {!loading && !error && schools.length === 0 && (
          <p className="mt-10 text-espresso-500">No schools are listed yet — check back soon.</p>
        )}

        {!loading && !error && schools.length > 0 && (
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {schools.map((s) => (
              <Link
                key={s.id}
                to={`/education/${s.id}`}
                className="flex flex-col items-center gap-3 rounded-2xl border border-carissma-100 bg-white/70 p-6 text-center transition hover:border-carissma-300 hover:shadow-md"
              >
                <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-linen-100">
                  {s.logoUrl ? (
                    <img src={s.logoUrl} alt={s.nameEn} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-2xl font-extrabold text-carissma-300">{(s.nameEn || '?')[0]}</span>
                  )}
                </div>
                <p className="text-sm font-bold text-espresso-900">{s.nameEn}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
