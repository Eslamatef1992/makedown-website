import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SiteLayout from '../components/layout/SiteLayout';
import { listProducts, listGameCategories, listFaqs, getHomeVideo } from '../api/content.api';
import { ChevronLeftIcon, ChevronRightIcon } from '../components/ui/icons';
import StickerHeading from '../components/ui/StickerHeading';

const BLURB =
  'A Multiplayer Quiz Game Featuring More Than 200 Diverse Categories, With Dedicated Sections For Students, Adults, And Children.';

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
  const [index, setIndex] = useState(0);
  if (loading) return <p className="mt-10 text-sm font-semibold text-espresso-500">Loading categories…</p>;
  if (error) return <p className="mt-10 text-sm font-semibold text-carnation-600">Couldn't load categories right now.</p>;
  if (categories.length === 0) return <p className="mt-10 text-sm font-semibold text-espresso-500">No categories yet — add some from the admin panel.</p>;

  const at = (offset) => categories[(index + offset + categories.length) % categories.length];
  const prev = categories.length > 1 ? at(-1) : null;
  const current = at(0);
  const next = categories.length > 1 ? at(1) : null;

  return (
    <div className="mt-12 flex items-center justify-center gap-4 sm:gap-8">
      <button
        onClick={() => setIndex((i) => i - 1)}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-carissma-400 shadow-md hover:bg-carissma-50"
        aria-label="Previous category"
      >
        <ChevronLeftIcon />
      </button>

      {prev && (
        <div className="hidden w-40 shrink-0 rounded-[1.75rem] bg-sky-100 p-4 text-center shadow-sm sm:block">
          {prev.icon_url ? (
            <img src={prev.icon_url} alt={prev.name_en} className="mx-auto h-20 w-20 object-contain" />
          ) : (
            <div className="mx-auto h-20 w-20 rounded-2xl bg-sky-200" />
          )}
          <p className="mt-4 rounded-full bg-white/70 py-2 text-xs font-bold text-espresso-400">Start Play</p>
        </div>
      )}

      <div className="w-64 shrink-0 rounded-[2rem] border-4 border-carissma-300 bg-sky-100 p-5 text-center shadow-xl sm:w-80 sm:p-6">
        <p className="text-base font-extrabold text-carissma-400 sm:text-lg">{current.name_en}</p>
        {current.icon_url ? (
          <img
            src={current.icon_url}
            alt={current.name_en}
            className="mx-auto mt-3 h-36 w-36 rounded-2xl border-2 border-carissma-300 object-cover sm:h-44 sm:w-44"
          />
        ) : (
          <div className="mx-auto mt-3 h-36 w-36 rounded-2xl border-2 border-carissma-300 bg-sky-200 sm:h-44 sm:w-44" />
        )}
        <Link
          to="/play"
          className="mt-4 block rounded-full bg-carissma-400 py-3 text-sm font-bold text-white hover:bg-carissma-500"
        >
          Start Play
        </Link>
      </div>

      {next && (
        <div className="hidden w-40 shrink-0 rounded-[1.75rem] bg-sky-100 p-4 text-center shadow-sm sm:block">
          {next.icon_url ? (
            <img src={next.icon_url} alt={next.name_en} className="mx-auto h-20 w-20 object-contain" />
          ) : (
            <div className="mx-auto h-20 w-20 rounded-2xl bg-sky-200" />
          )}
          <p className="mt-4 rounded-full bg-white/70 py-2 text-xs font-bold text-espresso-400">Start Play</p>
        </div>
      )}

      <button
        onClick={() => setIndex((i) => i + 1)}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-carissma-400 shadow-md hover:bg-carissma-50"
        aria-label="Next category"
      >
        <ChevronRightIcon />
      </button>
    </div>
  );
}

function FaqAccordion({ faqs }) {
  const [openId, setOpenId] = useState(faqs[0]?.id ?? null);
  return (
    <div className="mx-auto mt-8 max-w-3xl space-y-3">
      {faqs.map((f) => {
        const open = f.id === openId;
        return (
          <div key={f.id} className="rounded-2xl bg-carissma-100/60 px-6 py-5 text-start">
            <button
              onClick={() => setOpenId(open ? null : f.id)}
              className="flex w-full items-center justify-between text-start text-sm font-bold text-espresso-900"
            >
              {f.question_en}
              <span className="ms-3 text-lg font-bold text-carissma-400">{open ? '×' : '+'}</span>
            </button>
            {open && f.answer_en && <p className="mt-3 text-sm font-medium text-espresso-800">{f.answer_en}</p>}
          </div>
        );
      })}
    </div>
  );
}

function ProductCard({ p }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-carissma-100 bg-white/80">
      <Link to={`/products/${p.slug}`} className="block aspect-square w-full overflow-hidden bg-carissma-100">
        {p.thumbnail_url ? (
          <img src={p.thumbnail_url} alt={p.name_en} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-carissma-300">No image</div>
        )}
      </Link>
      <div className="p-3">
        <Link to={`/products/${p.slug}`} className="block text-sm font-bold text-carissma-500 hover:underline">
          {p.name_en}
        </Link>
        {p.description_en && <p className="mt-0.5 truncate text-xs font-medium text-espresso-700">{p.description_en}</p>}
        <p className="mt-1 text-sm font-bold text-espresso-900">
          {Number(p.base_price).toFixed(0)} {p.currency}
        </p>
        <Link
          to={`/products/${p.slug}`}
          className="mt-2 block rounded-full bg-carissma-400 py-1.5 text-center text-xs font-bold text-white hover:bg-carissma-500"
        >
          Add To Cart
        </Link>
      </div>
    </div>
  );
}

export default function Home() {
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
          <StickerHeading className="text-2xl sm:text-3xl">Ready To Play?</StickerHeading>
          <p className="mt-1 text-sm font-bold text-saffron-500">Challenge Yourself, Your Team, And Others!</p>

          <div className="mx-auto mt-6 max-w-sm rounded-3xl border-4 border-carissma-200 bg-white px-6 py-6">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-carissma-50 text-2xl">🌐</div>
            <p className="mt-3 font-extrabold text-carissma-400">Online Play</p>
            <p className="mt-1 text-xs font-semibold text-espresso-600">Play Solo Or Challenge Teams Online</p>
            <Link
              to="/play"
              className="mt-4 block rounded-full bg-carissma-400 py-2.5 text-sm font-bold text-white hover:bg-carissma-500"
            >
              Start Now
            </Link>
          </div>
        </section>

        {/* Intro / video */}
        <section className="mt-14 text-center">
          <StickerHeading className="text-2xl sm:text-3xl">Make Down</StickerHeading>
          <p className="mx-auto mt-3 max-w-2xl text-sm font-semibold text-espresso-700">{BLURB}</p>

          <div className="relative mx-auto mt-14 max-w-3xl">
            <div
              aria-hidden="true"
              className="absolute -top-8 start-1/2 h-16 w-2/3 -translate-x-1/2 rounded-t-full border-2 border-b-0 border-carnation-300 bg-linen-100"
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
                Watch On Youtube
              </a>
            )}
            </div>
          </div>

          <Link
            to="/packages"
            className="mt-8 inline-block rounded-full bg-carissma-400 px-8 py-3 text-sm font-bold text-white hover:bg-carissma-500"
          >
            + Buy A Package And Play
          </Link>
        </section>

        {/* Categories */}
        <section className="mt-16 text-center">
          <StickerHeading className="text-2xl sm:text-3xl">Popular Categories</StickerHeading>
          <p className="mx-auto mt-3 max-w-2xl text-sm font-semibold text-espresso-700">{BLURB}</p>
          <CategoryCarousel categories={categories} loading={categoriesState === 'loading'} error={categoriesState === 'error'} />
        </section>

        {/* Products */}
        <section className="mt-16">
          <div className="flex items-center justify-between">
            <StickerHeading className="text-xl sm:text-2xl">Popular Products</StickerHeading>
            <Link to="/products" className="text-sm font-bold text-carissma-500 hover:underline">
              View All
            </Link>
          </div>
          {productsState === 'loading' && <p className="mt-6 text-sm font-semibold text-espresso-500">Loading products…</p>}
          {productsState === 'error' && <p className="mt-6 text-sm font-semibold text-carnation-600">Couldn't load products right now.</p>}
          {productsState === 'ready' && products.length === 0 && (
            <p className="mt-6 text-sm font-semibold text-espresso-500">No products yet — add some from the admin panel.</p>
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
          <StickerHeading className="text-2xl sm:text-3xl">Frequently Asked Questions</StickerHeading>
          <p className="mx-auto mt-3 max-w-2xl text-sm font-semibold text-espresso-700">{BLURB}</p>
          {faqsState === 'loading' && <p className="mt-8 text-sm font-semibold text-espresso-500">Loading FAQs…</p>}
          {faqsState === 'error' && <p className="mt-8 text-sm font-semibold text-carnation-600">Couldn't load FAQs right now.</p>}
          {faqsState === 'ready' && faqs.length === 0 && (
            <p className="mt-8 text-sm font-semibold text-espresso-500">No FAQs yet — add some from the admin panel.</p>
          )}
          {faqsState === 'ready' && faqs.length > 0 && <FaqAccordion faqs={faqs} />}
        </section>
      </div>
    </SiteLayout>
  );
}
