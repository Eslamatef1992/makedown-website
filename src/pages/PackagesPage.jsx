import { useEffect, useState } from 'react';
import SiteLayout from '../components/layout/SiteLayout';
import { listPackages } from '../api/content.api';
import StickerHeading from '../components/ui/StickerHeading';

export default function PackagesPage() {
  const [packages, setPackages] = useState([]);
  const [state, setState] = useState('loading');

  useEffect(() => {
    listPackages()
      .then((rows) => {
        setPackages(Array.isArray(rows) ? rows : []);
        setState('ready');
      })
      .catch(() => setState('error'));
  }, []);

  return (
    <SiteLayout>
      <div className="mx-auto max-w-[1400px] px-4 py-16 text-center sm:px-6 lg:px-10">
        <StickerHeading className="text-2xl sm:text-3xl">Packages</StickerHeading>
        <p className="mt-2 text-sm font-semibold text-espresso-700">Top up credits and unlock more games.</p>

        {state === 'loading' && <p className="mt-10 text-sm font-semibold text-espresso-500">Loading packages…</p>}
        {state === 'error' && <p className="mt-10 text-sm font-semibold text-carnation-600">Couldn't load packages right now.</p>}
        {state === 'ready' && packages.length === 0 && (
          <p className="mt-10 text-sm font-semibold text-espresso-500">No packages yet — add some from the admin panel.</p>
        )}

        {state === 'ready' && packages.length > 0 && (
          <div className="mt-10 grid grid-cols-1 gap-6 text-start sm:grid-cols-2 lg:grid-cols-3">
            {packages.map((pkg) => (
              <div key={pkg.id} className="flex flex-col rounded-3xl border-4 border-carissma-200 bg-white p-6">
                <h2 className="text-lg font-extrabold text-espresso-900">{pkg.name_en}</h2>
                {pkg.description_en && <p className="mt-2 flex-1 text-sm font-medium text-espresso-700">{pkg.description_en}</p>}
                <p className="mt-4 text-2xl font-extrabold text-carissma-500">
                  {Number(pkg.price).toFixed(3)} {pkg.currency}
                </p>
                <p className="mt-1 text-sm font-semibold text-espresso-600">{pkg.credits} credits</p>
                {pkg.validity_days && (
                  <p className="mt-1 text-xs font-semibold text-espresso-500">Valid for {pkg.validity_days} days</p>
                )}
                <button
                  disabled
                  title="Checkout is coming soon"
                  className="mt-6 w-full cursor-not-allowed rounded-full bg-carissma-200 py-3 font-bold text-white"
                >
                  Buy — Coming Soon
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
