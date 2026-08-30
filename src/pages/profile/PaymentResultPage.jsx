import { Link, useLocation, useSearchParams } from 'react-router-dom';
import SiteLayout from '../../components/layout/SiteLayout';
import StickerHeading from '../../components/ui/StickerHeading';
import { CheckIcon, CloseIcon } from '../../components/ui/icons';

const FAILURE_MESSAGES = {
  not_paid: 'Your payment was not completed — it may have been declined or cancelled.',
  status_check_failed: "We couldn't confirm your payment due to a network error. If any amount was deducted, it will be refunded automatically.",
  missing_reference: 'Something went wrong starting the payment. Please try again.',
  order_not_found: "We couldn't find this order. Please try again.",
};

export default function PaymentResultPage() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const status = searchParams.get('status');
  const reason = searchParams.get('reason');
  const method = searchParams.get('method') || location.state?.order?.payment_method;
  const isSuccess = status === 'success';
  const packageName = location.state?.packageName;

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
          {isSuccess ? 'Payment Successful!' : 'Payment Failed!'}
        </StickerHeading>

        <p className="mt-4 text-espresso-600">
          {isSuccess
            ? method === 'cash'
              ? `You're all set${packageName ? ` with ${packageName}` : ''} — your games are ready. Please settle the payment in cash.`
              : 'Your payment went through and your package is now active.'
            : FAILURE_MESSAGES[reason] || 'Something went wrong with this payment. Please try again.'}
        </p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link to="/profile" className="rounded-full bg-carissma-400 px-8 py-3 font-bold text-white hover:bg-carissma-500">
            {isSuccess ? 'Go To My Profile' : 'Back To Profile'}
          </Link>
          {!isSuccess && (
            <Link
              to="/profile?tab=packages"
              className="rounded-full border-2 border-carissma-400 px-8 py-3 font-bold text-carissma-500 hover:bg-carissma-50"
            >
              Change Payment Method
            </Link>
          )}
        </div>
      </div>
    </SiteLayout>
  );
}
