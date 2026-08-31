import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listPackages } from '../../../api/content.api';
import PackageCard from '../../../components/ui/PackageCard';

function Subtitle({ children }) {
  return (
    <div className="flex items-center justify-center gap-3">
      <span className="h-px w-10 bg-gradient-to-r from-transparent to-carissma-300" />
      <p className="text-sm font-extrabold text-espresso-900">{children}</p>
      <span className="h-px w-10 bg-gradient-to-l from-transparent to-carissma-300" />
    </div>
  );
}

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
      {state === 'ready' && catalog.length > 0 && <Subtitle>Choose The Package That Suits You</Subtitle>}

      {state === 'loading' && <p className="text-center text-sm font-semibold text-espresso-500">Loading packages…</p>}
      {state === 'error' && <p className="text-center text-sm font-semibold text-carnation-600">Couldn't load packages right now.</p>}
      {state === 'ready' && catalog.length === 0 && (
        <p className="text-center text-sm font-semibold text-espresso-500">No packages available yet.</p>
      )}

      {state === 'ready' && catalog.length > 0 && (
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {catalog.map((pkg, i) => (
            <PackageCard
              key={pkg.id}
              pkg={pkg}
              index={i}
              ctaLabel={activePackageIds.has(pkg.id) ? 'Buy Again' : 'Buy Now'}
              onBuy={() => navigate(`/profile/packages/${pkg.id}/purchase`)}
            />
          ))}
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
