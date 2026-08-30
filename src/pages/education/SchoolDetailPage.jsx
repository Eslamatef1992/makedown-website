import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import SiteLayout from '../../components/layout/SiteLayout';
import StickerHeading from '../../components/ui/StickerHeading';
import { listSchools, verifySchoolCode } from '../../api/content.api';
import { CheckIcon, CloseIcon } from '../../components/ui/icons';

function JoinCodeModal({ onClose }) {
  const [code, setCode] = useState('');
  const [result, setResult] = useState(null); // { ok: boolean, school? , message? }
  const [checking, setChecking] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code.trim() || checking) return;
    setChecking(true);
    try {
      const school = await verifySchoolCode(code.trim());
      setResult({ ok: true, school });
    } catch {
      setResult({ ok: false });
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-espresso-900/40 px-4">
      <div className="relative w-full max-w-sm rounded-3xl bg-white p-8 text-center shadow-xl">
        <button
          onClick={onClose}
          className="absolute end-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-espresso-400 hover:bg-linen-100"
          aria-label="Close"
        >
          <CloseIcon className="h-4 w-4" />
        </button>

        {!result && (
          <form onSubmit={handleSubmit}>
            <StickerHeading as="h2" className="text-xl">
              Enter Game Code
            </StickerHeading>
            <p className="mt-2 text-sm text-espresso-600">Enter the code your teacher shared with you.</p>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. ACA1234"
              className="mt-6 w-full rounded-xl border border-carissma-200 bg-white px-4 py-3 text-center text-lg font-bold tracking-widest text-espresso-900 placeholder:text-carissma-300 focus:outline-none focus:ring-2 focus:ring-carissma-400"
            />
            <button
              type="submit"
              disabled={checking}
              className="mt-6 w-full rounded-full bg-carissma-400 py-3.5 font-bold text-white transition hover:bg-carissma-500 disabled:opacity-60"
            >
              {checking ? 'Checking…' : 'Submit'}
            </button>
          </form>
        )}

        {result?.ok && (
          <div>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-md">
              <CheckIcon className="h-10 w-10" />
            </div>
            <StickerHeading as="h2" className="mt-4 text-xl">
              Code Verified!
            </StickerHeading>
            <p className="mt-2 text-sm text-espresso-600">
              You're all set for <span className="font-bold">{result.school?.nameEn}</span>. Your teacher will start the game
              from here shortly.
            </p>
            <button
              onClick={onClose}
              className="mt-6 w-full rounded-full bg-carissma-400 py-3.5 font-bold text-white hover:bg-carissma-500"
            >
              Done
            </button>
          </div>
        )}

        {result && !result.ok && (
          <div>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-carnation-50">
              <CloseIcon className="h-8 w-8 text-carnation-500" />
            </div>
            <StickerHeading as="h2" className="mt-4 text-xl">
              Invalid Code
            </StickerHeading>
            <p className="mt-2 text-sm text-espresso-600">That code doesn't match any school. Double check it and try again.</p>
            <button
              onClick={() => setResult(null)}
              className="mt-6 w-full rounded-full bg-carissma-400 py-3.5 font-bold text-white hover:bg-carissma-500"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SchoolDetailPage() {
  const { id } = useParams();
  const [school, setSchool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showJoinModal, setShowJoinModal] = useState(false);

  useEffect(() => {
    let cancelled = false;
    listSchools()
      .then((data) => {
        if (cancelled) return;
        const match = (data || []).find((s) => String(s.id) === String(id));
        setSchool(match || null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-4xl px-8 py-24 text-center text-espresso-500">Loading…</div>
      </SiteLayout>
    );
  }

  if (!school) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-4xl px-8 py-24 text-center">
          <h1 className="text-2xl font-semibold text-espresso-900">School not found</h1>
          <Link to="/education" className="mt-4 inline-block font-semibold text-carissma-600 hover:underline">
            ← Back to schools
          </Link>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      {showJoinModal && <JoinCodeModal onClose={() => setShowJoinModal(false)} />}

      <div className="mx-auto max-w-4xl px-6 py-10 sm:px-8">
        <Link to="/education" className="text-sm font-bold text-carissma-500 hover:underline">← Back to schools</Link>

        <div className="mt-6 flex flex-col items-center gap-4 text-center sm:flex-row sm:items-center sm:text-start">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-linen-100">
            {school.logoUrl ? (
              <img src={school.logoUrl} alt={school.nameEn} className="h-full w-full object-cover" />
            ) : (
              <span className="text-2xl font-extrabold text-carissma-300">{(school.nameEn || '?')[0]}</span>
            )}
          </div>
          <div>
            <StickerHeading as="h1" className="text-2xl">
              {school.nameEn}
            </StickerHeading>
          </div>
        </div>

        <div className="mt-10 rounded-2xl border border-carissma-100 bg-white/70 p-8 text-center">
          <p className="font-bold text-espresso-900">No live games right now</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-espresso-600">
            When a teacher at {school.nameEn} starts a game session, you'll be able to join it here with a code.
          </p>
          <button
            onClick={() => setShowJoinModal(true)}
            className="mt-6 rounded-full bg-carissma-400 px-8 py-3 font-bold text-white hover:bg-carissma-500"
          >
            Have A Game Code?
          </button>
        </div>
      </div>
    </SiteLayout>
  );
}
