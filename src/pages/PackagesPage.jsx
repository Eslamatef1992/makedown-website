import { useEffect, useState } from 'react';
import SiteLayout from '../components/layout/SiteLayout';
import { listPackages } from '../api/content.api';

export default function PackagesPage() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    listPackages()
      .then(setPackages)
      .catch(() => setError('Could not load packages right now.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <SiteLayout>
      <div className="mx-auto max-w-5xl px-8 py-16">
        <h1 className="text-3xl font-bold text-espresso-900">Packages</h1>
        <p className="mt-2 text-espresso-500">Top up credits and unlock more games.</p>

        {loading && <p className="mt-10 text-espresso-500">Loading packages…</p>}
        {error && <p className="mt-10 text-carnation-600">{error}</p>}
        {!loading && !error && packages.length === 0 && (
          <p className="mt-10 text-espresso-500">No packages available yet — check back soon.</p>
        )}

        {!loading && !error && packages.length > 0 && (
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {packages.map((pkg) => (
              <div key={pkg.id} className="flex flex-col rounded-3xl border border-linen-200 bg-white p-6">
                <h2 className="text-lg font-semibold text-espresso-900">{pkg.name}</h2>
                {pkg.description && <p className="mt-2 flex-1 text-sm text-espresso-500">{pkg.description}</p>}
                <p className="mt-4 text-2xl font-bold text-carissma-600">
                  {Number(pkg.price).toFixed(3)} {pkg.currency}
                </p>
                <p className="mt-1 text-sm text-espresso-500">{pkg.credits} credits</p>
                {pkg.validity_days && (
                  <p className="mt-1 text-xs text-espresso-400">Valid for {pkg.validity_days} days</p>
                )}
                <button
                  disabled
                  title="Checkout is coming soon"
                  className="mt-6 w-full cursor-not-allowed rounded-2xl bg-carissma-300 py-3 font-semibold text-white"
                >
                  Buy — coming soon
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
