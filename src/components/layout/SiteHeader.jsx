import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { CartIcon, ChevronDownIcon } from '../ui/icons';

const COUNTRIES = [
  { code: 'KWT', flag: '🇰🇼', name: 'Kuwait' },
  { code: 'SAU', flag: '🇸🇦', name: 'Saudi Arabia' },
  { code: 'ARE', flag: '🇦🇪', name: 'United Arab Emirates' },
  { code: 'QAT', flag: '🇶🇦', name: 'Qatar' },
  { code: 'BHR', flag: '🇧🇭', name: 'Bahrain' },
  { code: 'OMN', flag: '🇴🇲', name: 'Oman' },
  { code: 'USA', flag: '🇺🇸', name: 'America' },
];

const NAV_LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/play', label: 'Play' },
  { to: '/education', label: 'Education' },
  { to: '/products', label: 'Products' },
  { to: '/contact-us', label: 'Contact Us' },
];

export default function SiteHeader() {
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();
  const [countryOpen, setCountryOpen] = useState(false);
  const [country, setCountry] = useState(COUNTRIES[0]);

  return (
    <header className="relative flex items-center justify-between px-4 py-5 sm:px-6 lg:px-10">
      <Link to="/" className="flex h-12 w-12 items-center justify-center">
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

      <div className="flex items-center gap-2.5">
        <Link
          to="/cart"
          className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white text-espresso-800 shadow-sm hover:text-carissma-500"
          aria-label="Cart"
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
              {COUNTRIES.map((c) => (
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

        {isAuthenticated ? (
          <>
            <Link to="/profile" className="hidden text-sm font-bold text-espresso-800 hover:text-carissma-500 sm:inline">
              {user?.firstName || user?.fullName}
            </Link>
            <button
              onClick={logout}
              className="rounded-full bg-carissma-100 px-4 py-2 text-sm font-bold text-carissma-700 hover:bg-carissma-200"
            >
              Log out
            </button>
          </>
        ) : (
          <Link to="/login" className="rounded-full bg-carissma-400 px-5 py-2 text-sm font-bold text-white hover:bg-carissma-500">
            Login
          </Link>
        )}
      </div>
    </header>
  );
}
