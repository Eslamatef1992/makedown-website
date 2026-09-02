// Shared by the products grid (ProductsPage.jsx) and the product detail
// page's related/recommended cards (ProductDetailPage.jsx) so both read a
// product's offer price and stock the same way.

// A product with variants only ever shows base_price on a card (there's no
// single "the" price for a multi-variant product to discount against) —
// the offer price is a simple-product-only display, same as on the detail
// page's own compareAtPrice logic for a selected variant.
export function activeProductPrice(product) {
  const offer = Number(product.offer_price);
  const hasOffer = product.offer_price != null && offer > 0 && offer < Number(product.base_price) && !(product.variants?.length);
  return { price: hasOffer ? offer : Number(product.base_price), original: hasOffer ? Number(product.base_price) : null };
}

// stock_quantity (product- or variant-level) is only enforced once it's
// actually been set — null means "not tracked", so an unset product never
// shows as out of stock just because the field is blank.
export function isProductOutOfStock(product) {
  if (product.variants?.length) return product.variants.every((v) => Number(v.stock_quantity) <= 0);
  return product.stock_quantity != null && Number(product.stock_quantity) <= 0;
}
