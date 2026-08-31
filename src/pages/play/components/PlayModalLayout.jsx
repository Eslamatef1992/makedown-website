import { Link } from 'react-router-dom';

// Full-bleed checkerboard background used for every pre-game screen (Solo/
// Team, Create/Join, Game Link, Start Play With, Waiting) — no site header,
// just this backdrop with one or two centered cards on top.
export default function PlayModalLayout({ children, backTo, onBack, backLabel = 'Back', backStyle = 'link' }) {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center gap-8 px-4 py-10"
      style={{
        backgroundColor: '#fbdce8',
        backgroundImage:
          'repeating-conic-gradient(from 45deg, #f8b8cf 0% 25%, #bfe3f2 0% 50%)',
        backgroundSize: '64px 64px',
      }}
    >
      <div className="flex flex-col items-center gap-8">{children}</div>

      {backTo || onBack ? (
        backStyle === 'button' ? (
          onBack ? (
            <button
              onClick={onBack}
              className="rounded-full bg-carissma-100 px-8 py-2.5 text-sm font-bold text-carissma-600 hover:bg-carissma-200"
            >
              {backLabel}
            </button>
          ) : (
            <Link
              to={backTo}
              className="rounded-full bg-carissma-100 px-8 py-2.5 text-sm font-bold text-carissma-600 hover:bg-carissma-200"
            >
              {backLabel}
            </Link>
          )
        ) : onBack ? (
          <button onClick={onBack} className="text-sm font-bold text-carissma-600 underline hover:text-carissma-700">
            {backLabel}
          </button>
        ) : (
          <Link to={backTo} className="text-sm font-bold text-carissma-600 underline hover:text-carissma-700">
            {backLabel}
          </Link>
        )
      ) : null}
    </div>
  );
}

export function PlayCard({ children, className = '' }) {
  return (
    <div className={`w-full max-w-sm rounded-3xl border-2 border-carissma-200 bg-carissma-50/95 p-8 text-center shadow-lg ${className}`}>
      {children}
    </div>
  );
}
