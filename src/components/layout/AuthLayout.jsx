import { Link } from 'react-router-dom';

// Mirrors the Figma auth screens: two soft decorative blobs behind a
// centered white card, logo + heading at the top, copyright footer.
export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-linen-50 px-4 py-10">
      <div className="pointer-events-none absolute -left-40 bottom-0 h-[620px] w-[620px] rounded-full bg-carissma-100/60 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 top-0 h-[420px] w-[420px] rounded-full bg-saffron-100/60 blur-3xl" />

      <div className="relative w-full max-w-md rounded-3xl bg-white/90 p-8 shadow-xl backdrop-blur">
        <div className="mb-6 flex flex-col items-center text-center">
          <Link to="/" className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-carissma-600 text-2xl font-bold text-white">
            MD
          </Link>
          <h1 className="text-2xl font-semibold text-espresso-900">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-espresso-500">{subtitle}</p>}
        </div>

        {children}

        <p className="mt-8 text-center text-xs text-espresso-400">
          All Rights Reserved By Teknulugy Company @{new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
