import { useEffect, useState } from 'react';
import SiteLayout from '../components/layout/SiteLayout';
import { listFaqs } from '../api/content.api';

export default function FaqPage() {
  const [faqs, setFaqs] = useState([]);
  const [openId, setOpenId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    listFaqs()
      .then(setFaqs)
      .catch(() => setError('Could not load FAQs right now.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <SiteLayout>
      <div className="mx-auto max-w-3xl px-8 py-16">
        <h1 className="text-3xl font-bold text-espresso-900">Frequently asked questions</h1>

        {loading && <p className="mt-8 text-espresso-500">Loading…</p>}
        {error && <p className="mt-8 text-carnation-600">{error}</p>}
        {!loading && !error && faqs.length === 0 && (
          <p className="mt-8 text-espresso-500">No FAQs published yet.</p>
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
                    {faq.question_en}
                    <span className="ml-4 text-carissma-600">{isOpen ? '−' : '+'}</span>
                  </button>
                  {isOpen && <p className="mt-3 text-sm text-espresso-600">{faq.answer_en}</p>}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
