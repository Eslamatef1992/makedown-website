import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listSocialLinks } from '../../api/content.api';

const QUICK_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/play', label: 'Play' },
  { to: '/products', label: 'Products' },
  { to: '/packages', label: 'Packages' },
  { to: '/contact-us', label: 'Contact Us' },
];

const SOCIAL_ICON_PATHS = {
  facebook: 'M14 9h3V6h-3c-1.7 0-3 1.3-3 3v2H9v3h2v6h3v-6h2.5l.5-3H14V9z',
  instagram:
    'M12 8.5a3.5 3.5 0 100 7 3.5 3.5 0 000-7zM12 2c-2.7 0-3.05.01-4.12.06-1.06.05-1.79.22-2.43.47a5 5 0 00-1.8 1.17 5 5 0 00-1.17 1.8c-.25.64-.42 1.37-.47 2.43C2 8.95 2 9.3 2 12s.01 3.05.06 4.12c.05 1.06.22 1.79.47 2.43a5 5 0 001.17 1.8 5 5 0 001.8 1.17c.64.25 1.37.42 2.43.47C8.95 22 9.3 22 12 22s3.05-.01 4.12-.06c1.06-.05 1.79-.22 2.43-.47a5 5 0 001.8-1.17 5 5 0 001.17-1.8c.25-.64.42-1.37.47-2.43.05-1.07.06-1.42.06-4.12s-.01-3.05-.06-4.12c-.05-1.06-.22-1.79-.47-2.43a5 5 0 00-1.17-1.8 5 5 0 00-1.8-1.17c-.64-.25-1.37-.42-2.43-.47C15.05 2.01 14.7 2 12 2z',
  twitter: 'M18.9 6.3c-.5.2-1 .4-1.6.5.6-.3 1-.9 1.2-1.6-.5.3-1.1.6-1.8.7a2.8 2.8 0 00-4.8 2.6A8 8 0 015 5.4a2.8 2.8 0 00.9 3.8c-.5 0-.9-.2-1.3-.4v.1a2.8 2.8 0 002.3 2.8 2.8 2.8 0 01-1.3.1 2.8 2.8 0 002.6 2 5.6 5.6 0 01-4.2 1.2A8 8 0 0016 7.7v-.4c.6-.4 1.1-.9 1.5-1.5-.5.2-1 .4-1.6.5.6-.4 1-.9 1-1.6z',
};

export default function SiteFooter() {
  const [links, setLinks] = useState([]);

  useEffect(() => {
    listSocialLinks().then(setLinks).catch(() => setLinks([]));
  }, []);

  const socials = links.length > 0 ? links : [{ id: 'fb', platform: 'facebook', url: '#' }, { id: 'ig', platform: 'instagram', url: '#' }, { id: 'tw', platform: 'twitter', url: '#' }];

  return (
    <footer className="mt-16 px-6 py-10 sm:px-10">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 sm:grid-cols-3">
        <div>
          <img src="/logo-mark.png" alt="Make Down" className="h-14 w-14 object-contain" />
          <p className="mt-3 max-w-xs text-sm text-espresso-700">
            A Multiplayer Quiz Game Featuring More Than 200 Diverse Categories, With Dedicated Sections For Students,
            Adults, And Children.
          </p>
          <div className="mt-4 flex gap-2.5">
            {socials.map((l) => (
              <a
                key={l.id}
                href={l.url}
                target="_blank"
                rel="noreferrer"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-carissma-400 hover:bg-carissma-100"
                aria-label={l.platform}
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                  <path d={SOCIAL_ICON_PATHS[l.platform] || SOCIAL_ICON_PATHS.facebook} />
                </svg>
              </a>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-extrabold text-carissma-400">Quick Links</h3>
          <ul className="mt-3 space-y-2 text-sm font-semibold text-espresso-800">
            {QUICK_LINKS.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="hover:text-carissma-500">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-extrabold text-carissma-400">Download App</h3>
          <div className="mt-3 flex flex-col gap-2">
            <a href="#" className="rounded-xl bg-white px-4 py-2 text-center text-sm font-bold text-espresso-800 shadow-sm hover:bg-carissma-50">
              🍎 Apple Play
            </a>
            <a href="#" className="rounded-xl bg-white px-4 py-2 text-center text-sm font-bold text-espresso-800 shadow-sm hover:bg-carissma-50">
              ▶ Google Play
            </a>
          </div>
          <a
            href="https://teknulugy.com"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 block text-end text-xs font-bold text-carissma-500 hover:underline"
          >
            Developed By Teknulugy
          </a>
        </div>
      </div>

      <div className="mx-auto mt-10 flex max-w-6xl flex-col items-center justify-between gap-3 border-t border-carissma-200/70 pt-6 text-xs font-semibold text-espresso-700 sm:flex-row">
        <p>Copyright {new Date().getFullYear()} Make Down</p>
        <div className="flex gap-4">
          <Link to="/privacy-policy" className="hover:text-carissma-500">Privacy Policy</Link>
          <Link to="/terms-and-conditions" className="hover:text-carissma-500">Terms And Conditions</Link>
          <Link to="/return-policy" className="hover:text-carissma-500">Return Policy</Link>
        </div>
      </div>
    </footer>
  );
}
