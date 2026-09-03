import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { listSocialLinks } from '../../api/content.api';
import StickerHeading from '../ui/StickerHeading';

const SOCIAL_ICONS = {
  facebook: '/icons/social-facebook.svg',
  instagram: '/icons/social-instagram.svg',
  twitter: '/icons/social-twitter.svg',
  x: '/icons/social-twitter.svg',
};

export default function SiteFooter() {
  const { t } = useTranslation();
  const QUICK_LINKS = [
    { to: '/', label: t('header.home') },
    { to: '/play', label: t('header.play') },
    { to: '/products', label: t('header.products') },
    { to: '/packages', label: t('footer.packages') },
    { to: '/contact-us', label: t('header.contactUs') },
  ];
  const [links, setLinks] = useState([]);

  useEffect(() => {
    listSocialLinks().then(setLinks).catch(() => setLinks([]));
  }, []);

  const socials =
    links.length > 0
      ? links
      : [
          { id: 'fb', platform: 'facebook', url: '#' },
          { id: 'ig', platform: 'instagram', url: '#' },
          { id: 'tw', platform: 'twitter', url: '#' },
        ];

  return (
    <footer className="mt-16 px-4 py-12 sm:px-6 sm:py-14 lg:px-10">
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-10 sm:grid-cols-3">
        <div>
          <img src="/logo-mark.png" alt="Make Down" className="h-16 w-16 object-contain" />
          <p className="mt-3 max-w-xs text-sm font-medium text-espresso-800">{t('footer.tagline')}</p>
          <div className="mt-4 flex gap-2.5">
            {socials.map((l) => (
              <a
                key={l.id}
                href={l.url}
                target="_blank"
                rel="noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-carissma-50 hover:bg-carissma-100"
                aria-label={l.platform}
              >
                <img src={SOCIAL_ICONS[l.platform] || SOCIAL_ICONS.facebook} alt={l.platform} className="h-9 w-9" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <StickerHeading as="h3" className="text-lg">
            {t('footer.quickLinks')}
          </StickerHeading>
          <ul className="mt-3 space-y-2 text-sm font-bold text-espresso-900">
            {QUICK_LINKS.map((l) => (
              <li key={l.to} className="flex items-center gap-2">
                <span className="text-espresso-500">•</span>
                <Link to={l.to} className="hover:text-carissma-500">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="sm:flex sm:flex-col sm:items-end sm:text-end">
          <StickerHeading as="h3" className="text-lg">
            {t('footer.downloadApp')}
          </StickerHeading>
          <div className="mt-3 flex flex-col gap-2.5 sm:items-end">
            <a href="#" aria-label={t('footer.downloadOnAppStore')}>
              <img src="/icons/apple-play.svg" alt="Apple Play" className="h-[52px] w-[148px]" />
            </a>
            <a href="#" aria-label={t('footer.getOnGooglePlay')}>
              <img src="/icons/google-play.svg" alt="Google Play" className="h-[52px] w-[148px]" />
            </a>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-10 flex max-w-[1400px] flex-col items-center justify-between gap-3 border-t border-carissma-300/50 pt-6 text-xs font-bold text-espresso-900 sm:flex-row">
        <p>{t('footer.copyright', { year: new Date().getFullYear() })}</p>
        <div className="flex gap-4">
          <Link to="/privacy-policy" className="underline hover:text-carissma-500">{t('footer.privacyPolicy')}</Link>
          <Link to="/terms-and-conditions" className="underline hover:text-carissma-500">{t('footer.termsAndConditions')}</Link>
          <Link to="/return-policy" className="underline hover:text-carissma-500">{t('footer.returnPolicy')}</Link>
        </div>
      </div>
    </footer>
  );
}
