import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// Full-bleed wavy pink/blue background (same asset as the login/signup
// screens) used for every pre-game screen (Solo/Team, Create/Join, Game
// Link, Start Play With, Waiting) — no site header, just this backdrop
// with one or two centered cards on top.
export default function PlayModalLayout({ children, backTo, onBack, backLabel, backStyle = 'link' }) {
  const { t } = useTranslation();
  const label = backLabel ?? t('common.back');
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-carissma-400 bg-cover bg-center bg-no-repeat bg-[url('/backgrounds/wavy-grid-portrait.jpg')] px-4 py-10 sm:bg-[url('/backgrounds/wavy-grid-landscape.jpg')]">
      <div className="flex w-full max-w-4xl flex-col items-center gap-8">{children}</div>

      {backTo || onBack ? (
        backStyle === 'button' ? (
          onBack ? (
            <button
              onClick={onBack}
              className="rounded-full bg-carissma-100 px-8 py-2.5 text-sm font-bold text-carissma-600 hover:bg-carissma-200"
            >
              {label}
            </button>
          ) : (
            <Link
              to={backTo}
              className="rounded-full bg-carissma-100 px-8 py-2.5 text-sm font-bold text-carissma-600 hover:bg-carissma-200"
            >
              {label}
            </Link>
          )
        ) : onBack ? (
          <button onClick={onBack} className="text-sm font-bold text-carissma-600 underline hover:text-carissma-700">
            {label}
          </button>
        ) : (
          <Link to={backTo} className="text-sm font-bold text-carissma-600 underline hover:text-carissma-700">
            {label}
          </Link>
        )
      ) : null}
    </div>
  );
}

// `maxWidth`/`border`/`radius` are dedicated props (not just part of
// `className`) so a caller's override can't lose a same-specificity CSS
// conflict against this component's own defaults — only one utility per
// property for this element ever ends up in the class string.
export function PlayCard({
  children,
  className = '',
  maxWidth = 'max-w-sm',
  border = 'border-2 border-carissma-200',
  radius = 'rounded-3xl',
}) {
  return (
    <div className={`w-full ${maxWidth} ${radius} ${border} bg-carissma-50/95 p-8 text-center shadow-lg ${className}`}>
      {children}
    </div>
  );
}
