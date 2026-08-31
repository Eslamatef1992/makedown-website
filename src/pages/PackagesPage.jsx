import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SiteLayout from '../components/layout/SiteLayout';
import { listPackages } from '../api/content.api';
import StickerHeading from '../components/ui/StickerHeading';
import PackageCard from '../components/ui/PackageCard';
import { useAuth } from '../context/AuthContext';

function Subtitle({ children }) {
  return (
    <div className="flex items-center justify-center gap-3">
      <span className="h-px w-10 bg-gradient-to-r from-transparent to-carissma-300" />
      <p className="text-sm font-extrabold text-espresso-900">{children}</p>
      <span className="h-px w-10 bg-gradient-to-l from-transparent to-carissma-300" />
    </div>
  );
}

export default function PackagesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
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

        {state === 'ready' && packages.length > 0 && (
          <div className="mt-4">
            <Subtitle>Choose The Package That Suits You</Subtitle>
          </div>
        )}

        {state === 'loading' && <p className="mt-10 text-sm font-semibold text-espresso-500">Loading packages…</p>}
        {state === 'error' && <p className="mt-10 text-sm font-semibold text-carnation-600">Couldn't load packages right now.</p>}
        {state === 'ready' && packages.length === 0 && (
          <p className="mt-10 text-sm font-semibold text-espresso-500">No packages yet — add some from the admin panel.</p>
        )}

        {state === 'ready' && packages.length > 0 && (
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {packages.map((pkg, i) => (
              <PackageCard
                key={pkg.id}
                pkg={pkg}
                index={i}
                onBuy={() => navigate(user ? `/profile/packages/${pkg.id}/purchase` : '/login')}
              />
            ))}
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
