import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listSocialLinks } from '../../api/content.api';

export default function SiteFooter() {
  const [links, setLinks] = useState([]);

  useEffect(() => {
    listSocialLinks().then(setLinks).catch(() => setLinks([]));
  }, []);

  return (
    <footer className="mt-24 border-t border-linen-200 px-8 py-10">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 text-center sm:flex-row sm:justify-between sm:text-left">
        <div>
          <img src="/logo-mark.png" alt="Make Down" className="h-10 w-10 object-contain" />
          <p className="mt-3 text-sm text-espresso-500">Learn, play, and win with Make Down.</p>
        </div>

        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-medium text-espresso-700">
          <Link to="/about-us" className="hover:text-carissma-600">About us</Link>
          <Link to="/how-it-works" className="hover:text-carissma-600">How it works</Link>
          <Link to="/faq" className="hover:text-carissma-600">FAQ</Link>
          <Link to="/contact-us" className="hover:text-carissma-600">Contact us</Link>
          <Link to="/privacy-policy" className="hover:text-carissma-600">Privacy policy</Link>
          <Link to="/terms-and-conditions" className="hover:text-carissma-600">Terms &amp; conditions</Link>
          <Link to="/return-policy" className="hover:text-carissma-600">Return policy</Link>
        </div>

        {links.length > 0 && (
          <div className="flex justify-center gap-3">
            {links.map((l) => (
              <a
                key={l.id}
                href={l.url}
                target="_blank"
                rel="noreferrer"
                className="rounded-full bg-linen-100 px-3 py-2 text-xs font-semibold capitalize text-espresso-700 hover:bg-carissma-100 hover:text-carissma-700"
              >
                {l.platform}
              </a>
            ))}
          </div>
        )}
      </div>
      <p className="mt-8 text-center text-xs text-espresso-400">
        All Rights Reserved By Teknulugy Company @{new Date().getFullYear()}
      </p>
    </footer>
  );
}
