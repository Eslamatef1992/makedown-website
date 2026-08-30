import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import SiteLayout from '../../components/layout/SiteLayout';
import { getProductBySlug } from '../../api/content.api';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [selectedVariantId, setSelectedVariantId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    getProductBySlug(slug)
      .then((data) => {
        if (cancelled) return;
        setProduct(data);
        setSelectedVariantId(data.variants?.[0]?.id ?? null);
      })
      .catch((err) => {
        if (!cancelled && err?.response?.status === 404) setNotFound(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-5xl px-8 py-24 text-center text-espresso-500">Loading…</div>
      </SiteLayout>
    );
  }

  if (notFound || !product) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-5xl px-8 py-24 text-center">
          <h1 className="text-2xl font-semibold text-espresso-900">Product not found</h1>
          <Link to="/products" className="mt-4 inline-block font-semibold text-carissma-600 hover:underline">
            Back to shop
          </Link>
        </div>
      </SiteLayout>
    );
  }

  const selectedVariant = product.variants?.find((v) => v.id === selectedVariantId);
  const displayPrice = selectedVariant ? selectedVariant.price : product.base_price;
  const gallery = product.images?.length ? product.images.map((i) => i.image_url) : [product.thumbnail_url].filter(Boolean);

  return (
    <SiteLayout>
      <div className="mx-auto max-w-5xl px-8 py-16">
        <Link to="/products" className="text-sm font-medium text-carissma-600 hover:underline">← Back to shop</Link>

        <div className="mt-6 grid grid-cols-1 gap-10 md:grid-cols-2">
          <div className="aspect-square overflow-hidden rounded-3xl bg-linen-100">
            {gallery[0] ? (
              <img src={gallery[0]} alt={product.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-espresso-300">No image</div>
            )}
          </div>

          <div>
            <h1 className="text-3xl font-bold text-espresso-900">{product.name}</h1>
            <p className="mt-3 text-2xl font-semibold text-carissma-600">
              {Number(displayPrice).toFixed(3)} {product.currency}
            </p>
            {product.description && <p className="mt-4 whitespace-pre-line text-espresso-600">{product.description}</p>}

            {product.variants?.length > 0 && (
              <div className="mt-6">
                <p className="mb-2 text-sm font-medium text-espresso-800">Choose an option</p>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v) => {
                    const attrs = v.attributes_json
                      ? (typeof v.attributes_json === 'string' ? JSON.parse(v.attributes_json) : v.attributes_json)
                      : null;
                    const label = attrs ? Object.values(attrs).join(' / ') : v.sku;
                    return (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVariantId(v.id)}
                        disabled={v.stock_quantity <= 0}
                        className={`rounded-xl border px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-40 ${
                          selectedVariantId === v.id
                            ? 'border-carissma-600 bg-carissma-50 text-carissma-700'
                            : 'border-linen-300 text-espresso-700 hover:border-carissma-400'
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
                {selectedVariant && selectedVariant.stock_quantity <= 0 && (
                  <p className="mt-2 text-sm text-carnation-600">Out of stock</p>
                )}
              </div>
            )}

            <button
              disabled
              title="Cart & checkout are coming soon"
              className="mt-8 w-full cursor-not-allowed rounded-2xl bg-carissma-300 py-3.5 font-semibold text-white"
            >
              Add to cart — coming soon
            </button>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
