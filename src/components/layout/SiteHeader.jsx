import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useCurrency } from '../../context/CurrencyContext';
import { CartIcon, ChevronDownIcon, ChevronRightIcon, MenuIcon, CloseIcon } from '../ui/icons';

export default function SiteHeader() {
  const { t, i18n } = useTranslation();
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();
  const { countries, country, setCountry } = useCurrency();
  const [countryOpen, setCountryOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const NAV_LINKS = [
    { to: '/', label: t('header.home'), end: true },
    { to: '/play', label: t('header.play') },
    { to: '/education', label: t('header.education') },
    { to: '/products', label: t('header.products') },
    { to: '/contact-us', label: t('header.contactUs') },
  ];

  const toggleLanguage = () => i18n.changeLanguage(i18n.language === 'ar' ? 'en' : 'ar');
  const otherLanguageLabel = i18n.language === 'ar' ? 'EN' : 'AR';

  // Lock background scroll while the mobile drawer is open, and let Escape close it.
  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKeyDown = (e) => e.key === 'Escape' && setMenuOpen(false);
    document.addEventListener('keydown', onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [menuOpen]);

  return (
    <header className="relative flex items-center justify-between px-4 py-5 sm:px-6 lg:px-10">
      <Link to="/" className="flex h-12 w-12 shrink-0 items-center justify-center">
        <img src="/logo-mark.png" alt="Make Down" className="h-full w-full object-contain" />
      </Link>

      <nav className="hidden items-center gap-6 text-sm font-bold text-espresso-800 md:flex">
        {NAV_LINKS.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) => (isActive ? 'text-carissma-500' : 'hover:text-carissma-500')}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="flex items-center gap-2 sm:gap-2.5">
        <Link
          to="/cart"
          className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white text-espresso-800 shadow-sm hover:text-carissma-500"
          aria-label={t('header.cart')}
        >
          <CartIcon />
          {itemCount > 0 && (
            <span className="absolute -top-1.5 -end-1.5 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-carnation-500 px-1 text-[11px] font-bold text-white">
              {itemCount > 99 ? '99+' : itemCount}
            </span>
          )}
        </Link>

        <div className="relative">
          <button
            type="button"
            onClick={() => setCountryOpen((v) => !v)}
            className="flex items-center gap-1.5 rounded-full bg-white px-3 py-2 text-sm shadow-sm"
          >
            <span aria-hidden="true">{country.flag}</span>
            <ChevronDownIcon className="h-3.5 w-3.5 text-espresso-500" />
          </button>
          {countryOpen && (
            <div className="absolute end-0 z-20 mt-2 w-48 overflow-hidden rounded-2xl bg-white py-1 shadow-xl">
              {countries.map((c) => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => {
                    setCountry(c);
                    setCountryOpen(false);
                  }}
                  className="flex w-full items-center gap-2.5 px-4 py-2 text-start text-sm font-semibold text-espresso-800 hover:bg-carissma-50"
                >
                  <span aria-hidden="true">{c.flag}</span>
                  {c.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Language switcher — hidden on the smallest screens where it lives inside the mobile drawer instead */}
        <button
          type="button"
          onClick={toggleLanguage}
          className="hidden h-9 items-center justify-center rounded-full bg-white px-3 text-xs font-bold text-espresso-800 shadow-sm hover:text-carissma-500 sm:flex"
          aria-label={t('common.language')}
        >
          {otherLanguageLabel}
        </button>

        {isAuthenticated ? (
          <>
            <Link to="/profile" className="hidden text-sm font-bold text-espresso-800 hover:text-carissma-500 sm:inline">
              {user?.firstName || user?.fullName}
            </Link>
            <button
              onClick={logout}
              className="hidden rounded-full bg-carissma-100 px-4 py-2 text-sm font-bold text-carissma-700 hover:bg-carissma-200 sm:inline-flex"
            >
              {t('header.logout')}
            </button>
          </>
        ) : (
          <Link
            to="/login"
            className="hidden rounded-full bg-carissma-400 px-5 py-2 text-sm font-bold text-white hover:bg-carissma-500 sm:inline-flex"
          >
            {t('header.login')}
          </Link>
        )}

        {/* Hamburger — mobile/tablet only; the nav, language toggle, and account action move into the drawer below */}
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-espresso-800 shadow-sm md:hidden"
          aria-label={t('common.menu', 'Menu')}
          aria-expanded={menuOpen}
        >
          <MenuIcon className="h-5 w-5" />
        </button>
      </div>

      {menuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            type="button"
            aria-label={t('common.close')}
            onClick={() => setMenuOpen(false)}
            className="absolute inset-0 bg-espresso-900/30"
          />
          <div className="absolute inset-y-0 end-0 flex w-[85%] max-w-xs flex-col overflow-y-auto rounded-s-[2rem] bg-carissma-50 px-6 py-6 shadow-2xl">
            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label={t('common.close')}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-espresso-800 shadow-sm"
              >
                <CloseIcon className="h-4 w-4" />
              </button>
            </div>

            <nav className="mt-4 flex flex-col text-base font-bold text-espresso-900">
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center justify-between border-b border-carissma-200/60 py-4 ${
                      isActive ? 'text-carissma-500' : 'hover:text-carissma-500'
                    }`
                  }
                >
                  {link.label}
                  <ChevronRightIcon className="h-4 w-4 text-espresso-400 rtl:rotate-180" />
                </NavLink>
              ))}
            </nav>

            <button
              type="button"
              onClick={toggleLanguage}
              className="mt-6 flex w-fit items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-espresso-800 shadow-sm"
            >
              {otherLanguageLabel}
            </button>

            <div className="mt-6 border-t border-carissma-200/60 pt-6">
              {isAuthenticated ? (
                <div className="flex flex-col gap-3">
                  <Link
                    to="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="text-sm font-bold text-espresso-800 hover:text-carissma-500"
                  >
                    {user?.firstName || user?.fullName}
                  </Link>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      logout();
                    }}
                    className="w-full rounded-full bg-carissma-100 px-5 py-2.5 text-sm font-bold text-carissma-700 hover:bg-carissma-200"
                  >
                    {t('header.logout')}
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="block w-full rounded-full bg-carissma-400 px-5 py-2.5 text-center text-sm font-bold text-white hover:bg-carissma-500"
                >
                  {t('header.login')}
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
