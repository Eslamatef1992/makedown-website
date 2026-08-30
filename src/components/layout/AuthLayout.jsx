import { Link } from 'react-router-dom';
import StickerHeading from '../ui/StickerHeading';

// Mirrors the Figma auth screens: a wavy pink/blue checkerboard background
// behind a centered pink-bordered card with a white-outlined "sticker" title.
export default function AuthLayout({ title, subtitle, children, cardClassName = '' }) {
  return (
    <div
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-carissma-400 px-4 py-10"
      style={{
        backgroundImage: 'url(/backgrounds/wavy-grid.svg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className={`relative w-full max-w-md rounded-[2rem] border-4 border-carissma-300 bg-carissma-50 p-8 shadow-xl ${cardClassName}`}>
        <div className="mb-6 flex flex-col items-center text-center">
          <Link to="/" className="mb-3 flex h-14 w-14 items-center justify-center">
            <img src="/logo-mark.png" alt="Make Down" className="h-full w-full object-contain" />
          </Link>
          <StickerHeading as="h1" className="text-3xl tracking-wide">
            {title}
          </StickerHeading>
          {subtitle && <p className="mt-2 text-sm font-semibold text-carissma-400">{subtitle}</p>}
        </div>

        {children}

        <a
          href="https://teknulugy.com"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 block text-center text-xs font-bold text-espresso-900 transition hover:text-carissma-500 hover:underline"
        >
          All Rights Reserved By Teknulugy Company @{new Date().getFullYear()}
        </a>
      </div>
    </div>
  );
}
