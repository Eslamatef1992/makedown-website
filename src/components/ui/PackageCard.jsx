import { useTranslation } from 'react-i18next';
import { pickLang } from '../../utils/bilingual';

const TIER_ICONS = ['🎮', '💎', '👑'];

const STICKER_SHADOW = {
  textShadow: '2px 0 0 #fff, -2px 0 0 #fff, 0 2px 0 #fff, 0 -2px 0 #fff, 2px 2px 0 #fff, -2px -2px 0 #fff, 2px -2px 0 #fff, -2px 2px 0 #fff',
};

// One "Choose the package that suits you" pricing card — used by both the
// public Packages page and the profile's Packages tab so the two stay in
// sync visually. `index` just cycles the icon for however many tiers an
// admin has configured; it isn't tied to a fixed Standard/Perineum/VIP set.
export default function PackageCard({ pkg, index = 0, ctaLabel, onBuy }) {
  const { t, i18n } = useTranslation();
  const freeGames = Number(pkg.free_credits) || 0;
  const paidGames = Number(pkg.credits) || 0;
  const buyNowLabel = ctaLabel ?? t('profile.packagesTab.buyNow');

  return (
    <div className="flex flex-col rounded-[2rem] border-2 border-carissma-300 bg-white p-6 text-center sm:p-7">
      <div className="mx-auto flex h-20 w-20 rotate-45 items-center justify-center rounded-2xl bg-gradient-to-br from-carissma-300 to-carissma-500 shadow-md">
        <span className="-rotate-45 text-3xl">{TIER_ICONS[index % TIER_ICONS.length]}</span>
      </div>

      <p className="mt-5 text-xl font-extrabold text-carissma-300" style={STICKER_SHADOW}>
        {pickLang(pkg, 'name', i18n.language)}
      </p>
      <p className="mt-1 text-lg font-extrabold text-carissma-300" style={STICKER_SHADOW}>
        {Number(pkg.price).toFixed(0)} Kwd
      </p>

      <div className="mt-6 space-y-3 border-t border-linen-200 pt-5 text-start">
        <div className="flex items-center gap-2 border-b border-linen-100 pb-3">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-carissma-400 text-[10px] text-white">✓</span>
          <span className="text-sm font-bold text-espresso-900">
            {t('packagePurchase.games', { count: paidGames })}
            {freeGames > 0 && (
              <>
                {' '}
                {t('packageCard.freeGamesPrefix', { count: freeGames })}{' '}
                <span className="text-carissma-500">{t('packageCard.free')}</span>
              </>
            )}
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={onBuy}
        disabled={!onBuy}
        className="mt-6 w-full rounded-full bg-carissma-400 py-3 font-bold text-white hover:bg-carissma-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {buyNowLabel}
      </button>
    </div>
  );
}
