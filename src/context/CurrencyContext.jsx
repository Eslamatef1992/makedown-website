import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getExchangeRates } from '../api/content.api';

// Every price in the API/DB is in KWD (see makedown-api/sql/schema.sql).
// This is the single source of truth for country -> currency and the
// flag/name shown in the header's country switcher.
export const COUNTRIES = [
  { code: 'KWT', currency: 'KWD', flag: '🇰🇼', name: 'Kuwait' },
  { code: 'SAU', currency: 'SAR', flag: '🇸🇦', name: 'Saudi Arabia' },
  { code: 'ARE', currency: 'AED', flag: '🇦🇪', name: 'United Arab Emirates' },
  { code: 'QAT', currency: 'QAR', flag: '🇶🇦', name: 'Qatar' },
  { code: 'BHR', currency: 'BHD', flag: '🇧🇭', name: 'Bahrain' },
  { code: 'OMN', currency: 'OMR', flag: '🇴🇲', name: 'Oman' },
  { code: 'USA', currency: 'USD', flag: '🇺🇸', name: 'America' },
];

const COUNTRY_STORAGE_KEY = 'md_website_country';

const CurrencyContext = createContext(null);

function loadStoredCountry() {
  try {
    const code = localStorage.getItem(COUNTRY_STORAGE_KEY);
    return COUNTRIES.find((c) => c.code === code) || COUNTRIES[0];
  } catch {
    return COUNTRIES[0];
  }
}

export function CurrencyProvider({ children }) {
  const [country, setCountryState] = useState(loadStoredCountry);
  const [rates, setRates] = useState(null); // { base, rates: {KWD,USD,...}, stale }

  useEffect(() => {
    getExchangeRates()
      .then(setRates)
      .catch(() => setRates(null)); // convert() falls back to 1:1 (KWD face value) when rates are unavailable
  }, []);

  const setCountry = (next) => {
    setCountryState(next);
    try {
      localStorage.setItem(COUNTRY_STORAGE_KEY, next.code);
    } catch {
      // localStorage can be unavailable (private browsing, etc.) — the
      // selection just won't survive a reload, which is a fine fallback.
    }
  };

  const value = useMemo(() => {
    const currency = country.currency;
    const rate = rates?.rates?.[currency];
    // amountKwd -> amount in the selected currency, using the cached rate;
    // 1:1 (unconverted KWD value) whenever a real rate isn't available yet.
    const convert = (amountKwd) => Number(amountKwd || 0) * (typeof rate === 'number' ? rate : 1);
    // KWD/BHD/OMR are 3-decimal-place currencies by convention (fils/baisa
    // subunits) — matches how prices were already formatted pre-conversion
    // (see e.g. PackagePurchasePage's .toFixed(3)). The rest round to whole
    // units, which is how this storefront displayed them before too.
    const decimals = ['KWD', 'BHD', 'OMR'].includes(currency) ? 3 : 0;
    const formatPrice = (amountKwd) => `${convert(amountKwd).toFixed(decimals)} ${currency}`;
    return { countries: COUNTRIES, country, setCountry, currency, rate, convert, formatPrice, ratesLoaded: Boolean(rates) };
  }, [country, rates]);

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within a CurrencyProvider');
  return ctx;
}
