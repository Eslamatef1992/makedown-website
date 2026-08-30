import { Link, useLocation } from 'react-router-dom';
import SiteLayout from '../../components/layout/SiteLayout';
import StickerHeading from '../../components/ui/StickerHeading';
import { CheckIcon, CloseIcon } from '../../components/ui/icons';

export default function OrderResultPage({ status }) {
  const location = useLocation();
  const order = location.state?.order;
  const message = location.state?.message;
  const isSuccess = status === 'success';

  return (
    <SiteLayout>
      <div className="mx-auto max-w-lg px-6 py-24 text-center sm:px-8">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-md">
          {isSuccess ? (
            <CheckIcon className="h-12 w-12" />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-carnation-500">
              <CloseIcon className="h-6 w-6 text-white" />
            </div>
          )}
        </div>

        <StickerHeading as="h1" className="mt-6 text-2xl">
          {isSuccess ? 'Order Placed!' : "We Couldn't Place Your Order"}
        </StickerHeading>

        {isSuccess ? (
          <>
            <p className="mt-4 text-espresso-600">
              Thank you — we've received your order{order?.order_number ? ` #${order.order_number}` : ''}. It's currently{' '}
              <span className="font-semibold">pending confirmation</span>; we'll be in touch about payment and delivery.
            </p>
            {order?.grand_total && (
              <p className="mt-2 text-lg font-bold text-espresso-900">
                {Number(order.grand_total).toFixed(3)} {order.currency}
              </p>
            )}
          </>
        ) : (
          <p className="mt-4 text-espresso-600">{message || 'Something went wrong while placing your order. Please try again.'}</p>
        )}

        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            to="/products"
            className="rounded-full bg-carissma-400 px-8 py-3 font-bold text-white hover:bg-carissma-500"
          >
            Continue Shopping
          </Link>
          {!isSuccess && (
            <Link
              to="/checkout"
              className="rounded-full border-2 border-carissma-400 px-8 py-3 font-bold text-carissma-500 hover:bg-carissma-50"
            >
              Try Again
            </Link>
          )}
        </div>
      </div>
    </SiteLayout>
  );
}
