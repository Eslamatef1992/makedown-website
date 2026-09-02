import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { listPackages } from '../../../api/content.api';
import PackageCard from '../../../components/ui/PackageCard';
import { pickLang } from '../../../utils/bilingual';

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
  const { t, i18n } = useTranslation();
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
      {state === 'ready' && catalog.length > 0 && <Subtitle>{t('profile.packagesTab.chooseSuits')}</Subtitle>}

      {state === 'loading' && <p className="text-center text-sm font-semibold text-espresso-500">{t('profile.packagesTab.loading')}</p>}
      {state === 'error' && <p className="text-center text-sm font-semibold text-carnation-600">{t('profile.packagesTab.loadError')}</p>}
      {state === 'ready' && catalog.length === 0 && (
        <p className="text-center text-sm font-semibold text-espresso-500">{t('profile.packagesTab.empty')}</p>
      )}

      {state === 'ready' && catalog.length > 0 && (
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {catalog.map((pkg, i) => (
            <PackageCard
              key={pkg.id}
              pkg={pkg}
              index={i}
              ctaLabel={activePackageIds.has(pkg.id) ? t('profile.packagesTab.buyAgain') : t('profile.packagesTab.buyNow')}
              onBuy={() => navigate(`/profile/packages/${pkg.id}/purchase`)}
            />
          ))}
        </div>
      )}

      {myPackages.length > 0 && (
        <div className="mt-10">
          <h3 className="text-sm font-bold text-espresso-900">{t('profile.packagesTab.purchaseHistory')}</h3>
          <div className="mt-3 space-y-2">
            {myPackages.map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-2xl border border-carissma-100 bg-white/70 px-5 py-3 text-sm">
                <div>
                  <p className="font-bold text-espresso-900">{pickLang(p, 'package_name', i18n.language)}</p>
                  <p className="text-xs font-semibold text-espresso-500">
                    {t('profile.packagesTab.purchased', { date: new Date(p.purchased_at).toLocaleDateString() })}
                  </p>
                </div>
                <div className="text-end">
                  <p className="font-bold text-carissma-500">{t('profile.packagesTab.left', { count: p.credits_remaining })}</p>
                  <p
                    className={`text-xs font-bold uppercase ${
                      p.status === 'active' ? 'text-green-600' : p.status === 'expired' ? 'text-carnation-500' : 'text-espresso-400'
                    }`}
                  >
                    {t(`profile.packagesTab.status.${p.status}`, p.status)}
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
