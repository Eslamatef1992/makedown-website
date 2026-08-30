import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import SiteLayout from '../../components/layout/SiteLayout';
import { listProducts } from '../../api/content.api';

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get('page')) || 1;
  const [result, setResult] = useState({ rows: [], total: 0, page: 1, pageSize: 20 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    listProducts({ page })
      .then((data) => {
        if (!cancelled) setResult(data);
      })
      .catch(() => {
        if (!cancelled) setError('Could not load products right now.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [page]);

  const totalPages = Math.max(1, Math.ceil((result.total || 0) / (result.pageSize || 20)));

  return (
    <SiteLayout>
      <div className="mx-auto max-w-6xl px-8 py-16">
        <h1 className="text-3xl font-bold text-espresso-900">Shop</h1>
        <p className="mt-2 text-espresso-500">Merch, gear, and goodies from Make Down.</p>

        {loading && <p className="mt-10 text-espresso-500">Loading products…</p>}
        {error && <p className="mt-10 text-carnation-600">{error}</p>}

        {!loading && !error && result.rows.length === 0 && (
          <p className="mt-10 text-espresso-500">No products available yet — check back soon.</p>
        )}

        {!loading && !error && result.rows.length > 0 && (
          <>
            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {result.rows.map((p) => (
                <Link
                  key={p.id}
                  to={`/products/${p.slug}`}
                  className="group overflow-hidden rounded-3xl border border-linen-200 bg-white transition hover:shadow-lg"
                >
                  <div className="aspect-square w-full overflow-hidden bg-linen-100">
                    {p.thumbnail_url ? (
                      <img
                        src={p.thumbnail_url}
                        alt={p.name_en}
                        className="h-full w-full object-cover transition group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-espresso-300">No image</div>
                    )}
                  </div>
                  <div className="p-4">
                    <h2 className="font-semibold text-espresso-900">{p.name_en}</h2>
                    <p className="mt-1 text-sm font-medium text-carissma-600">
                      {Number(p.base_price).toFixed(3)} {p.currency}
                    </p>
                  </div>
                </Link>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-3">
                <button
                  disabled={page <= 1}
                  onClick={() => setSearchParams({ page: String(page - 1) })}
                  className="rounded-xl border border-linen-300 px-4 py-2 text-sm font-medium text-espresso-700 disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="text-sm text-espresso-500">Page {page} of {totalPages}</span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setSearchParams({ page: String(page + 1) })}
                  className="rounded-xl border border-linen-300 px-4 py-2 text-sm font-medium text-espresso-700 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </SiteLayout>
  );
}
