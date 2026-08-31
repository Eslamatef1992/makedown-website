import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SiteLayout from '../components/layout/SiteLayout';
import { listProducts, listGameCategories, listFaqs, getHomeVideo } from '../api/content.api';
import { ChevronLeftIcon, ChevronRightIcon } from '../components/ui/icons';
import StickerHeading from '../components/ui/StickerHeading';
import { pickLang } from '../utils/bilingual';

function getYoutubeId(rawUrl) {
  if (!rawUrl) return null;
  const trimmed = rawUrl.trim();
  let url;
  try {
    url = new URL(/^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`);
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^www\.|^m\./, '');
  if (host === 'youtu.be') {
    const id = url.pathname.split('/').filter(Boolean)[0];
    return id && id.length === 11 ? id : null;
  }
  if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
    if (url.pathname === '/watch') {
      const v = url.searchParams.get('v');
      return v && v.length === 11 ? v : null;
    }
    const match = url.pathname.match(/\/(?:embed|shorts|live)\/([\w-]{11})/);
    if (match) return match[1];
  }
  return null;
}

function CategoryCarousel({ categories, loading, error }) {
  const { t, i18n } = useTranslation();
  const [index, setIndex] = useState(0);
  if (loading) return <p className="mt-10 text-sm font-semibold text-espresso-500">{t('home.categories.loading')}</p>;
  if (error) return <p className="mt-10 text-sm font-semibold text-carnation-600">{t('home.categories.error')}</p>;
  if (categories.length === 0) return <p className="mt-10 text-sm font-semibold text-espresso-500">{t('home.categories.empty')}</p>;

  const at = (offset) => categories[(index + offset + categories.length) % categories.length];
  const prev = categories.length > 1 ? at(-1) : null;
  const current = at(0);
  const next = categories.length > 1 ? at(1) : null;
  const lang = i18n.language;

  return (
    <div className="mt-12 flex items-center justify-center gap-4 sm:gap-8 lg:gap-12">
      <button
        onClick={() => setIndex((i) => i - 1)}
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-carissma-400 shadow-md hover:bg-carissma-50 sm:h-14 sm:w-14"
        aria-label={t('home.categories.prevAria')}
      >
        <ChevronLeftIcon className="h-5 w-5 rtl:rotate-180" />
      </button>

      {prev && (
        <div className="hidden w-56 shrink-0 rounded-[1.75rem] bg-sky-100 p-5 text-center shadow-sm sm:block sm:w-64 lg:w-72 lg:p-6">
          {prev.icon_url ? (
            <img src={prev.icon_url} alt={pickLang(prev, 'name', lang)} className="mx-auto h-28 w-28 object-contain sm:h-32 sm:w-32 lg:h-36 lg:w-36" />
          ) : (
            <div className="mx-auto h-28 w-28 rounded-2xl bg-sky-200 sm:h-32 sm:w-32 lg:h-36 lg:w-36" />
          )}
          <p className="mt-4 rounded-full bg-white/70 py-2.5 text-sm font-bold text-espresso-400 sm:py-3 sm:text-base">{t('home.categories.startPlay')}</p>
        </div>
      )}

      <div className="w-96 shrink-0 rounded-[2rem] border-4 border-carissma-300 bg-sky-100 p-7 text-center shadow-xl sm:w-[28rem] sm:p-9 lg:w-[34rem] lg:p-10">
        <p className="text-xl font-extrabold text-carissma-400 sm:text-2xl">{pickLang(current, 'name', lang)}</p>
        {current.icon_url ? (
          <img
            src={current.icon_url}
            alt={pickLang(current, 'name', lang)}
            className="mx-auto mt-4 h-56 w-56 rounded-2xl border-2 border-carissma-300 object-cover sm:h-72 sm:w-72 lg:h-80 lg:w-80"
          />
        ) : (
          <div className="mx-auto mt-4 h-56 w-56 rounded-2xl border-2 border-carissma-300 bg-sky-200 sm:h-72 sm:w-72 lg:h-80 lg:w-80" />
        )}
        <Link
          to="/play"
          className="mt-6 block rounded-full bg-carissma-400 py-4 text-lg font-bold text-white hover:bg-carissma-500"
        >
          {t('home.categories.startPlay')}
        </Link>
      </div>

      {next && (
        <div className="hidden w-56 shrink-0 rounded-[1.75rem] bg-sky-100 p-5 text-center shadow-sm sm:block sm:w-64 lg:w-72 lg:p-6">
          {next.icon_url ? (
            <img src={next.icon_url} alt={pickLang(next, 'name', lang)} className="mx-auto h-28 w-28 object-contain sm:h-32 sm:w-32 lg:h-36 lg:w-36" />
          ) : (
            <div className="mx-auto h-28 w-28 rounded-2xl bg-sky-200 sm:h-32 sm:w-32 lg:h-36 lg:w-36" />
          )}
          <p className="mt-4 rounded-full bg-white/70 py-2.5 text-sm font-bold text-espresso-400 sm:py-3 sm:text-base">{t('home.categories.startPlay')}</p>
        </div>
      )}

      <button
        onClick={() => setIndex((i) => i + 1)}
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-carissma-400 shadow-md hover:bg-carissma-50 sm:h-14 sm:w-14"
        aria-label={t('home.categories.nextAria')}
      >
        <ChevronRightIcon className="h-5 w-5 rtl:rotate-180" />
      </button>
    </div>
  );
}

function FaqAccordion({ faqs }) {
  const { i18n } = useTranslation();
  const lang = i18n.language;
  const [openId, setOpenId] = useState(faqs[0]?.id ?? null);
  return (
    <div className="mx-auto mt-8 max-w-3xl space-y-3">
      {faqs.map((f) => {
        const open = f.id === openId;
        const answer = pickLang(f, 'answer', lang);
        return (
          <div key={f.id} className="rounded-2xl bg-carissma-100/60 px-6 py-5 text-start">
            <button
              onClick={() => setOpenId(open ? null : f.id)}
              className="flex w-full items-center justify-between text-start text-sm font-bold text-espresso-900"
            >
              {pickLang(f, 'question', lang)}
              <span className="ms-3 text-lg font-bold text-carissma-400">{open ? '×' : '+'}</span>
            </button>
            {open && answer && <p className="mt-3 text-sm font-medium text-espresso-800">{answer}</p>}
          </div>
        );
      })}
    </div>
  );
}

function ProductCard({ p }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const name = pickLang(p, 'name', lang);
  const description = pickLang(p, 'description', lang);
  return (
    <div className="overflow-hidden rounded-2xl border border-carissma-100 bg-white/80">
      <Link to={`/products/${p.slug}`} className="block aspect-square w-full overflow-hidden bg-carissma-100">
        {p.thumbnail_url ? (
          <img src={p.thumbnail_url} alt={name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-carissma-300">{t('common.noImage')}</div>
        )}
      </Link>
      <div className="p-3">
        <Link to={`/products/${p.slug}`} className="block text-sm font-bold text-carissma-500 hover:underline">
          {name}
        </Link>
        {description && <p className="mt-0.5 truncate text-xs font-medium text-espresso-700">{description}</p>}
        <p className="mt-1 text-sm font-bold text-espresso-900">
          {Number(p.base_price).toFixed(0)} {p.currency}
        </p>
        <Link
          to={`/products/${p.slug}`}
          className="mt-2 block rounded-full bg-carissma-400 py-1.5 text-center text-xs font-bold text-white hover:bg-carissma-500"
        >
          {t('home.products.addToCart')}
        </Link>
      </div>
    </div>
  );
}

export default function Home() {
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [productsState, setProductsState] = useState('loading');
  const [categories, setCategories] = useState([]);
  const [categoriesState, setCategoriesState] = useState('loading');
  const [faqs, setFaqs] = useState([]);
  const [faqsState, setFaqsState] = useState('loading');
  const [videoUrl, setVideoUrl] = useState('');

  useEffect(() => {
    listProducts({ page: 1, pageSize: 10 })
      .then((d) => {
        setProducts(d.rows || []);
        setProductsState('ready');
      })
      .catch(() => setProductsState('error'));

    listGameCategories()
      .then((rows) => {
        setCategories(Array.isArray(rows) ? rows : []);
        setCategoriesState('ready');
      })
      .catch(() => setCategoriesState('error'));

    listFaqs()
      .then((rows) => {
        setFaqs(Array.isArray(rows) ? rows : []);
        setFaqsState('ready');
      })
      .catch(() => setFaqsState('error'));

    getHomeVideo()
      .then((data) => setVideoUrl(data?.url || ''))
      .catch(() => setVideoUrl(''));
  }, []);

  const youtubeId = getYoutubeId(videoUrl);

  return (
    <SiteLayout>
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
        {/* Hero */}
        <section className="relative mt-2 overflow-hidden rounded-3xl bg-carissma-50/70 px-6 py-10 text-center sm:px-12">
          <span className="pointer-events-none absolute start-8 top-10 text-2xl text-carissma-300" aria-hidden="true">✦</span>
          <span className="pointer-events-none absolute end-10 top-6 text-lg text-saffron-400" aria-hidden="true">✦</span>
          <StickerHeading className="text-2xl sm:text-3xl">{t('home.hero.title')}</StickerHeading>
          <p className="mt-1 text-sm font-bold text-saffron-500">{t('home.hero.subtitle')}</p>

          <div className="mx-auto mt-6 max-w-sm rounded-3xl border-4 border-carissma-200 bg-white px-6 py-6">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-carissma-50 text-2xl">🌐</div>
            <p className="mt-3 font-extrabold text-carissma-400">{t('home.hero.onlinePlay')}</p>
            <p className="mt-1 text-xs font-semibold text-espresso-600">{t('home.hero.onlinePlaySubtitle')}</p>
            <Link
              to="/play"
              className="mt-4 block rounded-full bg-carissma-400 py-2.5 text-sm font-bold text-white hover:bg-carissma-500"
            >
              {t('home.hero.startNow')}
            </Link>
          </div>
        </section>

        {/* Intro / video */}
        <section className="mt-14 text-center">
          <StickerHeading className="text-2xl sm:text-3xl">Make Down</StickerHeading>
          <p className="mx-auto mt-3 max-w-2xl text-sm font-semibold text-espresso-700">{t('home.intro.blurb')}</p>

          <div className="relative mx-auto mt-14 max-w-3xl">
            <div
              aria-hidden="true"
              className="absolute -top-8 left-1/2 h-16 w-2/3 -translate-x-1/2 rounded-t-full border-2 border-b-0 border-carnation-300 bg-linen-100"
            />
            <div className="relative aspect-video overflow-hidden rounded-3xl bg-gradient-to-br from-espresso-900 to-carissma-900">
            {youtubeId && (
              <img
                src={`https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`}
                alt="Home page video thumbnail"
                className="absolute inset-0 h-full w-full object-cover opacity-90"
                onError={(e) => {
                  e.currentTarget.src = `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
                }}
              />
            )}
            <a
              href={videoUrl || undefined}
              target={videoUrl ? '_blank' : undefined}
              rel={videoUrl ? 'noopener noreferrer' : undefined}
              className="absolute inset-0 flex items-center justify-center"
              aria-label="Watch on YouTube"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 text-2xl text-carissma-500">▶</div>
            </a>
            {videoUrl && (
              <a
                href={videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute bottom-4 start-4 rounded-full bg-white px-4 py-2 text-xs font-bold text-espresso-900 shadow"
              >
                {t('home.intro.watchOnYoutube')}
              </a>
            )}
            </div>
          </div>

          <Link
            to="/packages"
            className="mt-8 inline-block rounded-full bg-carissma-400 px-8 py-3 text-sm font-bold text-white hover:bg-carissma-500"
          >
            {t('home.intro.buyPackage')}
          </Link>
        </section>

        {/* Categories */}
        <section className="mt-16 text-center">
          <StickerHeading className="text-2xl sm:text-3xl">{t('home.categories.title')}</StickerHeading>
          <p className="mx-auto mt-3 max-w-2xl text-sm font-semibold text-espresso-700">{t('home.intro.blurb')}</p>
          <CategoryCarousel categories={categories} loading={categoriesState === 'loading'} error={categoriesState === 'error'} />
        </section>

        {/* Products */}
        <section className="mt-16">
          <div className="flex items-center justify-between">
            <StickerHeading className="text-xl sm:text-2xl">{t('home.products.title')}</StickerHeading>
            <Link to="/products" className="text-sm font-bold text-carissma-500 hover:underline">
              {t('home.products.viewAll')}
            </Link>
          </div>
          {productsState === 'loading' && <p className="mt-6 text-sm font-semibold text-espresso-500">{t('home.products.loading')}</p>}
          {productsState === 'error' && <p className="mt-6 text-sm font-semibold text-carnation-600">{t('home.products.error')}</p>}
          {productsState === 'ready' && products.length === 0 && (
            <p className="mt-6 text-sm font-semibold text-espresso-500">{t('home.products.empty')}</p>
          )}
          {productsState === 'ready' && products.length > 0 && (
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {products.map((p) => (
                <ProductCard key={p.id} p={p} />
              ))}
            </div>
          )}
        </section>

        {/* FAQ */}
        <section className="mt-16 pb-16 text-center">
          <StickerHeading className="text-2xl sm:text-3xl">{t('home.faq.title')}</StickerHeading>
          <p className="mx-auto mt-3 max-w-2xl text-sm font-semibold text-espresso-700">{t('home.intro.blurb')}</p>
          {faqsState === 'loading' && <p className="mt-8 text-sm font-semibold text-espresso-500">{t('home.faq.loading')}</p>}
          {faqsState === 'error' && <p className="mt-8 text-sm font-semibold text-carnation-600">{t('home.faq.error')}</p>}
          {faqsState === 'ready' && faqs.length === 0 && (
            <p className="mt-8 text-sm font-semibold text-espresso-500">{t('home.faq.empty')}</p>
          )}
          {faqsState === 'ready' && faqs.length > 0 && <FaqAccordion faqs={faqs} />}
        </section>
      </div>
    </SiteLayout>
  );
}
