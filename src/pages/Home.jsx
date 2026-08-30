import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SiteLayout from '../components/layout/SiteLayout';
import { listProducts, listGameCategories, listFaqs } from '../api/content.api';
import { ChevronLeftIcon, ChevronRightIcon } from '../components/ui/icons';

const BLURB =
  'A Multiplayer Quiz Game Featuring More Than 200 Diverse Categories, With Dedicated Sections For Students, Adults, And Children.';

function StickerHeading({ children, className = '' }) {
  return (
    <h2
      className={`font-extrabold uppercase text-carissma-300 ${className}`}
      style={{
        textShadow:
          '2px 0 0 #fff, -2px 0 0 #fff, 0 2px 0 #fff, 0 -2px 0 #fff, 2px 2px 0 #fff, -2px -2px 0 #fff, 2px -2px 0 #fff, -2px 2px 0 #fff',
      }}
    >
      {children}
    </h2>
  );
}

function CategoryCarousel({ categories }) {
  const [index, setIndex] = useState(0);
  if (categories.length === 0) return null;
  const at = (offset) => categories[(index + offset + categories.length) % categories.length];
  const prev = categories.length > 1 ? at(-1) : null;
  const current = at(0);
  const next = categories.length > 1 ? at(1) : null;

  return (
    <div className="mt-10 flex items-center justify-center gap-3 sm:gap-6">
      <button
        onClick={() => setIndex((i) => i - 1)}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-carissma-400 shadow-sm hover:bg-carissma-50"
        aria-label="Previous category"
      >
        <ChevronLeftIcon />
      </button>

      {prev && (
        <div className="hidden w-32 shrink-0 rounded-2xl bg-sky-100 p-3 text-center sm:block">
          {prev.icon_url ? (
            <img src={prev.icon_url} alt={prev.name_en} className="mx-auto h-16 w-16 object-contain" />
          ) : (
            <div className="mx-auto h-16 w-16 rounded-xl bg-sky-200" />
          )}
          <p className="mt-3 rounded-full bg-white/70 py-1 text-xs font-bold text-espresso-400">Start Play</p>
        </div>
      )}

      <div className="w-56 shrink-0 rounded-3xl border-4 border-carissma-300 bg-sky-100 p-4 text-center shadow-lg">
        <p className="text-sm font-extrabold text-carissma-400">{current.name_en}</p>
        {current.icon_url ? (
          <img src={current.icon_url} alt={current.name_en} className="mx-auto mt-2 h-28 w-28 object-contain" />
        ) : (
          <div className="mx-auto mt-2 h-28 w-28 rounded-2xl bg-sky-200" />
        )}
        <Link
          to="/play"
          className="mt-3 block rounded-full bg-carissma-400 py-2 text-sm font-bold text-white hover:bg-carissma-500"
        >
          Start Play
        </Link>
      </div>

      {next && (
        <div className="hidden w-32 shrink-0 rounded-2xl bg-sky-100 p-3 text-center sm:block">
          {next.icon_url ? (
            <img src={next.icon_url} alt={next.name_en} className="mx-auto h-16 w-16 object-contain" />
          ) : (
            <div className="mx-auto h-16 w-16 rounded-xl bg-sky-200" />
          )}
          <p className="mt-3 rounded-full bg-white/70 py-1 text-xs font-bold text-espresso-400">Start Play</p>
        </div>
      )}

      <button
        onClick={() => setIndex((i) => i + 1)}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-carissma-400 shadow-sm hover:bg-carissma-50"
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
          <div key={f.id} className="rounded-2xl bg-white/70 px-5 py-4">
            <button
              onClick={() => setOpenId(open ? null : f.id)}
              className="flex w-full items-center justify-between text-start text-sm font-bold text-espresso-900"
            >
              {f.question_en}
              <span className="ms-3 text-carissma-400">{open ? '×' : '+'}</span>
            </button>
            {open && f.answer_en && <p className="mt-2 text-sm text-espresso-700">{f.answer_en}</p>}
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
  const [categories, setCategories] = useState([]);
  const [faqs, setFaqs] = useState([]);

  useEffect(() => {
    listProducts({ page: 1, pageSize: 10 }).then((d) => setProducts(d.rows || [])).catch(() => setProducts([]));
    listGameCategories().then((rows) => setCategories(rows || [])).catch(() => setCategories([]));
    listFaqs().then((rows) => setFaqs(rows || [])).catch(() => setFaqs([]));
  }, []);

  return (
    <SiteLayout>
      <div className="mx-auto max-w-6xl px-6 sm:px-8">
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

          <div className="relative mx-auto mt-8 aspect-video max-w-3xl overflow-hidden rounded-3xl bg-gradient-to-br from-espresso-900 to-carissma-900">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 text-2xl text-carissma-500">▶</div>
            </div>
            <a
              href="#"
              className="absolute bottom-4 start-4 rounded-full bg-white px-4 py-2 text-xs font-bold text-espresso-900 shadow"
            >
              Watch On Youtube
            </a>
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
          <CategoryCarousel categories={categories} />
        </section>

        {/* Products */}
        {products.length > 0 && (
          <section className="mt-16">
            <div className="flex items-center justify-between">
              <StickerHeading className="text-xl sm:text-2xl">Popular Products</StickerHeading>
              <Link to="/products" className="text-sm font-bold text-carissma-500 hover:underline">
                View All
              </Link>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {products.map((p) => (
                <ProductCard key={p.id} p={p} />
              ))}
            </div>
          </section>
        )}

        {/* FAQ */}
        {faqs.length > 0 && (
          <section className="mt-16 pb-16 text-center">
            <StickerHeading className="text-2xl sm:text-3xl">Frequently Asked Questions</StickerHeading>
            <p className="mx-auto mt-3 max-w-2xl text-sm font-semibold text-espresso-700">{BLURB}</p>
            <FaqAccordion faqs={faqs} />
          </section>
        )}
      </div>
    </SiteLayout>
  );
}
