import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import SiteLayout from '../../components/layout/SiteLayout';
import StickerHeading from '../../components/ui/StickerHeading';
import { listSchools, listSchoolGames } from '../../api/content.api';
import { joinGameByCode } from '../../api/play.api';
import { CloseIcon, CalendarIcon, UserIcon } from '../../components/ui/icons';

const AUDIENCE_LABELS = {
  girls: 'Only Girl',
  boys: 'Only Boy',
  mixed: 'Boy & Girl',
};

function formatDate(value) {
  if (!value) return null;
  const datePart = String(value).slice(0, 10);
  const d = new Date(`${datePart}T00:00:00`);
  if (Number.isNaN(d.getTime())) return datePart;
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatTime(value) {
  if (!value) return null;
  const timePart = String(value).slice(0, 5);
  const [h, m] = timePart.split(':').map(Number);
  if (Number.isNaN(h)) return timePart;
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = ((h + 11) % 12) + 1;
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
}

// Reused per game card. The join code is never sent to the browser as part
// of the games list (see schools.controller.js#publicGames) — a student
// types in the code their teacher gave them, same as any other Play game;
// the code alone determines which session they land in.
function GameCodeModal({ game, onClose }) {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code.trim() || checking) return;
    setChecking(true);
    setError('');
    try {
      const session = await joinGameByCode(code.trim());
      navigate(`/play/sessions/${session.id}/lobby`);
    } catch (err) {
      setError(err.response?.data?.message || "That code didn't work. Double check it and try again.");
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

        {!error && (
          <form onSubmit={handleSubmit}>
            <StickerHeading as="h2" className="text-xl">
              Game Code
            </StickerHeading>
            <p className="mt-2 text-sm text-espresso-600">
              Enter the code your teacher shared with you{game?.title ? ` for "${game.title}"` : ''}.
            </p>
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
              {checking ? 'Checking…' : 'Start Game'}
            </button>
          </form>
        )}

        {error && (
          <div>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-carnation-50">
              <CloseIcon className="h-8 w-8 text-carnation-500" />
            </div>
            <StickerHeading as="h2" className="mt-4 text-xl">
              Couldn't Join
            </StickerHeading>
            <p className="mt-2 text-sm text-espresso-600">{error}</p>
            <button
              onClick={() => setError('')}
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

function GameCard({ game, onJoin }) {
  const audienceLabel = AUDIENCE_LABELS[game.audience];
  const dateLabel = formatDate(game.scheduledDate);
  const timeLabel = formatTime(game.scheduledTime);

  return (
    <div className="rounded-2xl border border-carissma-100 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3 className="text-lg font-extrabold text-espresso-900">{game.title || 'Game'}</h3>
        {audienceLabel && (
          <span className="rounded-full bg-carissma-50 px-3 py-1 text-xs font-bold text-carissma-500">{audienceLabel}</span>
        )}
      </div>

      {(dateLabel || timeLabel) && (
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm font-medium text-espresso-600">
          <CalendarIcon className="h-4 w-4 text-carissma-400" />
          <span>
            {dateLabel}
            {dateLabel && timeLabel ? ' · ' : ''}
            {timeLabel}
          </span>
        </div>
      )}
      {timeLabel && <p className="mt-1 text-xs font-medium text-espresso-400">Join opens 10 minutes before start.</p>}

      {game.teams?.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2 text-sm font-bold text-espresso-800">
          <UserIcon className="h-4 w-4 text-carissma-400" />
          {game.teams.map((team, i) => (
            <span key={team.name || i}>
              {team.name || `Team ${i + 1}`}
              {team.capacity ? ` (${team.capacity} Players)` : ''}
              {i < game.teams.length - 1 ? ' Vs' : ''}
            </span>
          ))}
        </div>
      )}

      {game.categories?.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {game.categories.map((c, i) => (
            <span key={i} className="rounded-full bg-linen-100 px-3 py-1 text-xs font-bold text-espresso-600">
              {c.titleEn}
            </span>
          ))}
        </div>
      )}

      <button
        onClick={() => onJoin(game)}
        className="mt-5 w-full rounded-full bg-carissma-400 py-3 font-bold text-white transition hover:bg-carissma-500"
      >
        Join Game
      </button>
    </div>
  );
}

export default function SchoolDetailPage() {
  const { id } = useParams();
  const [school, setSchool] = useState(null);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joinGame, setJoinGame] = useState(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([listSchools(), listSchoolGames(id).catch(() => [])])
      .then(([schools, schoolGames]) => {
        if (cancelled) return;
        const match = (schools || []).find((s) => String(s.id) === String(id));
        setSchool(match || null);
        setGames(schoolGames || []);
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
      {joinGame && <GameCodeModal game={joinGame} onClose={() => setJoinGame(null)} />}

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
              {school.nameEn} Games
            </StickerHeading>
          </div>
        </div>

        {games.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-carissma-100 bg-white/70 p-8 text-center">
            <p className="font-bold text-espresso-900">No live games right now</p>
            <p className="mx-auto mt-2 max-w-md text-sm text-espresso-600">
              When a teacher at {school.nameEn} schedules a game session, it'll show up here.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            {games.map((game) => (
              <GameCard key={game.id} game={game} onJoin={setJoinGame} />
            ))}
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
