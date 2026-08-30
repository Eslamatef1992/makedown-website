import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import SiteLayout from '../../components/layout/SiteLayout';
import StickerHeading from '../../components/ui/StickerHeading';
import { getProductBySlug } from '../../api/content.api';
import { useCart } from '../../context/CartContext';
import { MinusIcon, PlusIcon } from '../../components/ui/icons';

function parseAttrs(variant) {
  if (!variant?.attributes_json) return {};
  return typeof variant.attributes_json === 'string' ? JSON.parse(variant.attributes_json) : variant.attributes_json;
}

// Titlecases attribute keys like "width" -> "Width" for the option-group labels.
function titleCase(str) {
  return str.replace(/(^|[\s_-])(\w)/g, (m, sep, ch) => (sep ? ' ' : '') + ch.toUpperCase());
}

export default function ProductDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [selection, setSelection] = useState({});
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    setAdded(false);
    setQuantity(1);
    getProductBySlug(slug)
      .then((data) => {
        if (cancelled) return;
        setProduct(data);
        const firstVariant = data.variants?.[0];
        setSelection(firstVariant ? parseAttrs(firstVariant) : {});
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

  // Group variant attributes into option rows, e.g. { Color: ['Red','Blue'], Width: ['20cm','30cm'] }
  const optionGroups = useMemo(() => {
    if (!product?.variants?.length) return [];
    const groups = {};
    product.variants.forEach((v) => {
      const attrs = parseAttrs(v);
      Object.entries(attrs).forEach(([key, val]) => {
        if (!groups[key]) groups[key] = [];
        if (!groups[key].includes(val)) groups[key].push(val);
      });
    });
    return Object.entries(groups);
  }, [product]);

  const selectedVariant = useMemo(() => {
    if (!product?.variants?.length) return null;
    return (
      product.variants.find((v) => {
        const attrs = parseAttrs(v);
        return Object.entries(selection).every(([k, val]) => attrs[k] === val);
      }) || null
    );
  }, [product, selection]);

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

  const hasVariants = product.variants?.length > 0;
  const displayPrice = selectedVariant ? selectedVariant.price : product.base_price;
  const gallery = product.images?.length ? product.images.map((i) => i.image_url) : [product.thumbnail_url].filter(Boolean);
  const outOfStock = hasVariants ? !selectedVariant || selectedVariant.stock_quantity <= 0 : product.stock_quantity <= 0;
  const stockAvailable = hasVariants ? selectedVariant?.stock_quantity : product.stock_quantity;

  const handleAddToCart = () => {
    if (outOfStock) return;
    const variantAttrs = selectedVariant ? parseAttrs(selectedVariant) : null;
    const variantLabel = variantAttrs ? Object.values(variantAttrs).join(' / ') : null;
    addItem({
      productId: product.id,
      variantId: selectedVariant?.id ?? null,
      name: product.name_en,
      image: gallery[0] || null,
      price: displayPrice,
      currency: product.currency,
      variantLabel,
      variantAttrs,
      quantity,
      maxQuantity: stockAvailable ?? 999,
    });
    setAdded(true);
  };

  return (
    <SiteLayout>
      <div className="mx-auto max-w-5xl px-8 py-16">
        <Link to="/products" className="text-sm font-bold text-carissma-500 hover:underline">← Back to shop</Link>

        <div className="mt-6 grid grid-cols-1 gap-10 md:grid-cols-2">
          <div className="aspect-square overflow-hidden rounded-3xl bg-linen-100">
            {gallery[0] ? (
              <img src={gallery[0]} alt={product.name_en} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-espresso-300">No image</div>
            )}
          </div>

          <div>
            <StickerHeading as="h1" className="text-2xl">
              {product.name_en}
            </StickerHeading>
            <p className="mt-3 text-2xl font-extrabold text-espresso-900">
              {Number(displayPrice).toFixed(3)} {product.currency}
            </p>
            {product.description_en && <p className="mt-4 whitespace-pre-line text-espresso-600">{product.description_en}</p>}

            {optionGroups.map(([key, values]) => (
              <div key={key} className="mt-6">
                <p className="mb-2 text-sm font-bold text-espresso-800">{titleCase(key)}</p>
                <div className="flex flex-wrap gap-2">
                  {values.map((val) => {
                    const isActive = selection[key] === val;
                    return (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setSelection((s) => ({ ...s, [key]: val }))}
                        className={`rounded-xl border-2 px-4 py-2 text-sm font-bold transition ${
                          isActive
                            ? 'border-carissma-400 bg-carissma-50 text-carissma-600'
                            : 'border-carissma-100 text-espresso-700 hover:border-carissma-300'
                        }`}
                      >
                        {val}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {outOfStock && <p className="mt-4 text-sm font-bold text-carnation-600">Out of stock</p>}

            <div className="mt-6 flex items-center gap-4">
              <p className="text-sm font-bold text-espresso-800">Quantity</p>
              <div className="flex items-center gap-3 rounded-full border border-carissma-200 px-3 py-1.5">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="flex h-6 w-6 items-center justify-center rounded-full text-carissma-500 hover:bg-carissma-50"
                  aria-label="Decrease quantity"
                >
                  <MinusIcon className="h-3.5 w-3.5" />
                </button>
                <span className="w-4 text-center text-sm font-bold text-espresso-900">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(stockAvailable || 999, q + 1))}
                  className="flex h-6 w-6 items-center justify-center rounded-full text-carissma-500 hover:bg-carissma-50"
                  aria-label="Increase quantity"
                >
                  <PlusIcon className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={outOfStock}
              className="mt-8 w-full rounded-full bg-carissma-400 py-3.5 font-bold text-white transition hover:bg-carissma-500 disabled:cursor-not-allowed disabled:bg-carissma-200"
            >
              {outOfStock ? 'Out of stock' : 'Add To Cart'}
            </button>

            {added && (
              <div className="mt-4 flex items-center justify-between rounded-2xl bg-carissma-50 px-4 py-3 text-sm font-semibold text-carissma-700">
                <span>Added to your cart.</span>
                <button onClick={() => navigate('/cart')} className="font-bold text-carissma-600 hover:underline">
                  View Cart
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
