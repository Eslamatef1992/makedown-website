import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import SiteLayout from '../../components/layout/SiteLayout';
import { listProducts } from '../../api/content.api';
import { SearchIcon, ChevronDownIcon } from '../../components/ui/icons';
import StickerHeading from '../../components/ui/StickerHeading';

const PAGE_SIZE = 60;
const BATCH = 20;

export default function ProductsPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('low-high');
  const [visible, setVisible] = useState(BATCH);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    listProducts({ page: 1, pageSize: PAGE_SIZE })
      .then((data) => {
        if (!cancelled) setRows(data.rows || []);
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
  }, []);

  const filteredSorted = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = rows;
    if (q) {
      list = list.filter((p) => (p.name_en || '').toLowerCase().includes(q) || (p.name_ar || '').includes(q));
    }
    return [...list].sort((a, b) =>
      sort === 'low-high' ? Number(a.base_price) - Number(b.base_price) : Number(b.base_price) - Number(a.base_price)
    );
  }, [rows, search, sort]);

  const visibleRows = filteredSorted.slice(0, visible);
  const hasMore = visible < filteredSorted.length;

  return (
    <SiteLayout>
      <div className="mx-auto max-w-6xl px-6 py-10 sm:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <StickerHeading as="h1" className="text-2xl">
            Products
          </StickerHeading>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative">
              <SearchIcon className="pointer-events-none absolute inset-y-0 start-3 my-auto h-4 w-4 text-carissma-300" />
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setVisible(BATCH);
                }}
                placeholder="Search Product"
                className="w-full rounded-full border border-carissma-200 bg-white py-2 ps-9 pe-4 text-sm text-espresso-900 placeholder:text-carissma-300 focus:outline-none focus:ring-2 focus:ring-carissma-400 sm:w-56"
              />
            </div>
            <label className="flex items-center gap-2 text-sm font-semibold text-espresso-900">
              Sort By:
              <div className="relative">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="appearance-none rounded-full border border-carissma-200 bg-white py-2 ps-3 pe-8 text-sm font-bold text-carissma-500 focus:outline-none focus:ring-2 focus:ring-carissma-400"
                >
                  <option value="low-high">Low-High Price</option>
                  <option value="high-low">High-Low Price</option>
                </select>
                <ChevronDownIcon className="pointer-events-none absolute inset-y-0 end-2 my-auto h-4 w-4 text-carissma-400" />
              </div>
            </label>
          </div>
        </div>

        {loading && <p className="mt-10 text-espresso-500">Loading products…</p>}
        {error && <p className="mt-10 text-carnation-600">{error}</p>}
        {!loading && !error && filteredSorted.length === 0 && (
          <p className="mt-10 text-espresso-500">No products available yet — check back soon.</p>
        )}

        {!loading && !error && visibleRows.length > 0 && (
          <>
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {visibleRows.map((p) => (
                <div key={p.id} className="overflow-hidden rounded-2xl border border-carissma-100 bg-carissma-50/60">
                  <Link to={`/products/${p.slug}`} className="block aspect-square w-full overflow-hidden bg-carissma-100">
                    {p.thumbnail_url ? (
                      <img src={p.thumbnail_url} alt={p.name_en} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-carissma-300">No image</div>
                    )}
                  </Link>
                  <div className="p-3">
                    <Link to={`/products/${p.slug}`} className="block text-sm font-bold text-carissma-500 hover:underline">
                      {p.name_en}
                    </Link>
                    {p.description_en && (
                      <p className="mt-0.5 truncate text-xs font-medium text-espresso-700">{p.description_en}</p>
                    )}
                    <p className="mt-1 text-sm font-bold text-espresso-900">
                      {Number(p.base_price).toFixed(0)} {p.currency}
                    </p>
                    <Link
                      to={`/products/${p.slug}`}
                      className="mt-2 block rounded-full bg-carissma-400 py-1.5 text-center text-xs font-bold text-white hover:bg-carissma-500"
                    >
                      Add To Cart
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {hasMore && (
              <div className="mt-10 flex justify-center">
                <button
                  onClick={() => setVisible((v) => v + BATCH)}
                  className="rounded-full border-2 border-carissma-300 px-8 py-2.5 text-sm font-bold text-carissma-400 hover:bg-carissma-50"
                >
                  See More
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </SiteLayout>
  );
}
