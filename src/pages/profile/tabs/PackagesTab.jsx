import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listPackages } from '../../../api/content.api';

export default function PackagesTab({ myPackages = [] }) {
  const navigate = useNavigate();
  const [catalog, setCatalog] = useState([]);
  const [state, setState] = useState('loading');

  useEffect(() => {
    listPackages()
      .then((rows) => {
        setCatalog(Array.isArray(rows) ? rows : []);
        setState('ready');
      })
      .catch(() => setState('error'));
  }, []);

  const activePackageIds = new Set(myPackages.filter((p) => p.status === 'active').map((p) => p.package_id));

  return (
    <div>
      {state === 'loading' && <p className="text-center text-sm font-semibold text-espresso-500">Loading packages…</p>}
      {state === 'error' && <p className="text-center text-sm font-semibold text-carnation-600">Couldn't load packages right now.</p>}
      {state === 'ready' && catalog.length === 0 && (
        <p className="text-center text-sm font-semibold text-espresso-500">No packages available yet.</p>
      )}

      {state === 'ready' && catalog.length > 0 && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {catalog.map((pkg) => {
            const owned = activePackageIds.has(pkg.id);
            return (
              <div key={pkg.id} className="flex flex-col rounded-3xl border-4 border-carissma-200 bg-white p-6 text-start">
                <h3 className="text-lg font-extrabold text-espresso-900">{pkg.name_en}</h3>
                {pkg.description_en && <p className="mt-2 flex-1 text-sm font-medium text-espresso-700">{pkg.description_en}</p>}
                <p className="mt-4 text-2xl font-extrabold text-carissma-500">
                  {Number(pkg.price).toFixed(3)} {pkg.currency}
                </p>
                <p className="mt-1 text-sm font-semibold text-espresso-600">{pkg.credits} Games</p>
                {pkg.validity_days && <p className="mt-1 text-xs font-semibold text-espresso-500">Valid for {pkg.validity_days} days</p>}
                <button
                  onClick={() => navigate(`/profile/packages/${pkg.id}/purchase`)}
                  className="mt-6 w-full rounded-full bg-carissma-400 py-3 font-bold text-white hover:bg-carissma-500"
                >
                  {owned ? 'Buy Again' : 'Buy Now'}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {myPackages.length > 0 && (
        <div className="mt-10">
          <h3 className="text-sm font-bold text-espresso-900">Purchase History</h3>
          <div className="mt-3 space-y-2">
            {myPackages.map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-2xl border border-carissma-100 bg-white/70 px-5 py-3 text-sm">
                <div>
                  <p className="font-bold text-espresso-900">{p.package_name_en}</p>
                  <p className="text-xs font-semibold text-espresso-500">
                    Purchased {new Date(p.purchased_at).toLocaleDateString()}
                    {p.expires_at ? ` · Expires ${new Date(p.expires_at).toLocaleDateString()}` : ''}
                  </p>
                </div>
                <div className="text-end">
                  <p className="font-bold text-carissma-500">{p.credits_remaining} left</p>
                  <p
                    className={`text-xs font-bold uppercase ${
                      p.status === 'active' ? 'text-green-600' : p.status === 'expired' ? 'text-carnation-500' : 'text-espresso-400'
                    }`}
                  >
                    {p.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
