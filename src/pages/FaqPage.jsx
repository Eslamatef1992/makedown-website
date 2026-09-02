import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import SiteLayout from '../components/layout/SiteLayout';
import { listFaqs } from '../api/content.api';
import { pickLang } from '../utils/bilingual';

export default function FaqPage() {
  const { t, i18n } = useTranslation();
  const [faqs, setFaqs] = useState([]);
  const [openId, setOpenId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    listFaqs()
      .then(setFaqs)
      .catch(() => setError(t('faq.loadError')))
      .finally(() => setLoading(false));
  }, [t]);

  return (
    <SiteLayout>
      <div className="mx-auto max-w-3xl px-8 py-16">
        <h1 className="text-3xl font-bold text-espresso-900">{t('faq.title')}</h1>

        {loading && <p className="mt-8 text-espresso-500">{t('common.loading')}</p>}
        {error && <p className="mt-8 text-carnation-600">{error}</p>}
        {!loading && !error && faqs.length === 0 && (
          <p className="mt-8 text-espresso-500">{t('faq.empty')}</p>
        )}

        {!loading && !error && faqs.length > 0 && (
          <div className="mt-8 divide-y divide-linen-200 rounded-3xl border border-linen-200 bg-white">
            {faqs.map((faq) => {
              const isOpen = openId === faq.id;
              return (
                <div key={faq.id} className="p-5">
                  <button
                    onClick={() => setOpenId(isOpen ? null : faq.id)}
                    className="flex w-full items-center justify-between text-left font-semibold text-espresso-900"
                  >
                    {pickLang(faq, 'question', i18n.language)}
                    <span className="ml-4 text-carissma-600">{isOpen ? '−' : '+'}</span>
                  </button>
                  {isOpen && <p className="mt-3 text-sm text-espresso-600">{pickLang(faq, 'answer', i18n.language)}</p>}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
