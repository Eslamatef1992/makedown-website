import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { listPackages } from '../../api/content.api';
import PackageCard from '../ui/PackageCard';
import { useAuth } from '../../context/AuthContext';

const STICKER_SHADOW = {
  textShadow: '2px 0 0 #fff, -2px 0 0 #fff, 0 2px 0 #fff, 0 -2px 0 #fff, 2px 2px 0 #fff, -2px -2px 0 #fff, 2px -2px 0 #fff, -2px 2px 0 #fff',
};

// Full-screen takeover shown when the backend rejects a create/join-game
// call with 402 (the account's one free game is used up and it has no
// package credits left). Same wavy-grid background treatment as the
// login/signup screens (AuthLayout) so it reads as part of the same auth-y
// "you need an account/plan to continue" family of screens, but built
// standalone here since the packages grid needs a much wider card than
// AuthLayout's max-w-md, and the title needs mixed case (StickerHeading
// forces uppercase, which doesn't match this screen's design).
export default function FreeGameOverScreen({ onBack }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-carissma-400 bg-cover bg-center bg-no-repeat bg-[url('/backgrounds/wavy-grid-portrait.jpg')] px-4 py-10 sm:bg-[url('/backgrounds/wavy-grid-landscape.jpg')]">
      <div className="relative w-full max-w-5xl rounded-[2rem] border-4 border-carissma-300 bg-carissma-50 p-8 shadow-xl sm:p-10">
        <div className="text-center">
          <p className="text-2xl font-extrabold text-carissma-300 sm:text-3xl" style={STICKER_SHADOW}>
            {t('play.freeGameOver.title')}
          </p>
          <p className="mt-4 text-sm font-bold text-espresso-900 sm:text-base">{t('play.freeGameOver.completed')}</p>
          <p className="mt-1 text-sm font-semibold text-espresso-700 sm:text-base">
            {t('play.freeGameOver.choosePackage')}
          </p>
        </div>

        <p className="mt-8 text-center text-lg font-extrabold text-carissma-300" style={STICKER_SHADOW}>
          {t('play.freeGameOver.packages')}
        </p>
        <div className="mt-2 flex items-center justify-center gap-3">
          <span className="h-px w-10 bg-gradient-to-r from-transparent to-carissma-300" />
          <p className="text-sm font-extrabold text-espresso-900">{t('play.freeGameOver.choosePackageSuits')}</p>
          <span className="h-px w-10 bg-gradient-to-l from-transparent to-carissma-300" />
        </div>

        {state === 'loading' && <p className="mt-8 text-center text-sm font-semibold text-espresso-500">{t('play.freeGameOver.loading')}</p>}
        {state === 'error' && <p className="mt-8 text-center text-sm font-semibold text-carnation-600">{t('play.freeGameOver.loadError')}</p>}
        {state === 'ready' && packages.length === 0 && (
          <p className="mt-8 text-center text-sm font-semibold text-espresso-500">{t('play.freeGameOver.noPackages')}</p>
        )}

        {state === 'ready' && packages.length > 0 && (
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
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

        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={onBack}
            className="rounded-full border-2 border-carissma-200 bg-white px-10 py-3 text-sm font-bold text-carissma-400 transition hover:bg-carissma-50"
          >
            {t('common.back')}
          </button>
        </div>
      </div>
    </div>
  );
}
