import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// Placeholder for every page not yet built out (shop, cart, checkout,
// packages, play, profile, static pages). Keeps navigation/routing real
// while those modules are implemented in follow-up passes.
export default function ComingSoon({ title }) {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-linen-50 px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-carissma-600 text-xl font-bold text-white">MD</div>
      <h1 className="text-2xl font-semibold text-espresso-900">{title}</h1>
      <p className="max-w-sm text-espresso-500">{t('comingSoon.body')}</p>
      <Link to="/" className="font-semibold text-carissma-600 hover:underline">{t('comingSoon.backHome')}</Link>
    </div>
  );
}
