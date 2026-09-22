import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SiteLayout from '../../components/layout/SiteLayout';
import StickerHeading from '../../components/ui/StickerHeading';
import { listSchools, listSchoolGames } from '../../api/content.api';
import { joinGameByCode } from '../../api/play.api';
import { CloseIcon } from '../../components/ui/icons';
import gameTileDefault from '../../assets/game-tile-default.jpg';

const AUDIENCE_LABEL_KEYS = {
  girls: 'education.schoolDetail.audience.girls',
  boys: 'education.schoolDetail.audience.boys',
  mixed: 'education.schoolDetail.audience.mixed',
};

// Schools carry nameEn/nameAr (camelCase), not the usual snake_case _en/_ar
// pair, so this picks the display name directly rather than through the
// shared pickLang() helper (same approach as SchoolsPage.jsx).
function schoolName(school, lang) {
  return (lang?.startsWith('ar') && school.nameAr) || school.nameEn;
}

function formatDate(value) {
  if (!value) return null;
  const datePart = String(value).slice(0, 10);
  const d = new Date(`${datePart}T00:00:00`);
  if (Number.isNaN(d.getTime())) return datePart;
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatTime(value, amLabel, pmLabel) {
  if (!value) return null;
  const timePart = String(value).slice(0, 5);
  const [h, m] = timePart.split(':').map(Number);
  if (Number.isNaN(h)) return timePart;
  const period = h >= 12 ? pmLabel : amLabel;
  const hour12 = ((h + 11) % 12) + 1;
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
}

// Reused per game card. The join code is never sent to the browser as part
// of the games list (see schools.controller.js#publicGames) — a student
// types in the code their teacher gave them, same as any other Play game;
// the code alone determines which session they land in.
function GameCodeModal({ game, onClose }) {
  const { t } = useTranslation();
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
      // There's no separate lobby step in this app any more (see App.jsx's
      // routing comment) — every other entry point goes straight to the
      // live game, so a school-code join does too.
      navigate(`/play/sessions/${session.id}/live`);
    } catch (err) {
      setError(err.response?.data?.message || t('education.schoolDetail.modal.genericError'));
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-espresso-900/40 px-4">
      <div className="relative w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-xl sm:p-8">
        <button
          onClick={onClose}
          className="absolute end-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-espresso-400 hover:bg-linen-100"
          aria-label={t('education.schoolDetail.modal.closeAriaLabel')}
        >
          <CloseIcon className="h-4 w-4" />
        </button>

        {!error && (
          <form onSubmit={handleSubmit}>
            <StickerHeading as="h2" className="text-xl">
              {t('education.schoolDetail.modal.title')}
            </StickerHeading>
            <p className="mt-2 text-sm text-espresso-600">
              {t('education.schoolDetail.modal.instructions', {
                suffix: game?.title ? t('education.schoolDetail.modal.forGameSuffix', { title: game.title }) : '',
              })}
            </p>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder={t('education.schoolDetail.modal.placeholder')}
              className="mt-6 w-full rounded-xl border border-carissma-200 bg-white px-4 py-3 text-center text-lg font-bold tracking-widest text-espresso-900 placeholder:text-carissma-300 focus:outline-none focus:ring-2 focus:ring-carissma-400"
            />
            <button
              type="submit"
              disabled={checking}
              className="mt-6 w-full rounded-full bg-carissma-400 py-3.5 font-bold text-white transition hover:bg-carissma-500 disabled:opacity-60"
            >
              {checking ? t('education.schoolDetail.modal.checking') : t('education.schoolDetail.modal.startGame')}
            </button>
          </form>
        )}

        {error && (
          <div>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-carnation-50">
              <CloseIcon className="h-8 w-8 text-carnation-500" />
            </div>
            <StickerHeading as="h2" className="mt-4 text-xl">
              {t('education.schoolDetail.modal.couldntJoin')}
            </StickerHeading>
            <p className="mt-2 text-sm text-espresso-600">{error}</p>
            <button
              onClick={() => setError('')}
              className="mt-6 w-full rounded-full bg-carissma-400 py-3.5 font-bold text-white hover:bg-carissma-500"
            >
              {t('education.schoolDetail.modal.tryAgain')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function GameCard({ game, onJoin }) {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language?.startsWith('ar');
  const audienceLabel = AUDIENCE_LABEL_KEYS[game.audience] ? t(AUDIENCE_LABEL_KEYS[game.audience]) : null;
  const dateLabel = formatDate(game.scheduledDate);
  const timeLabel = formatTime(game.scheduledTime, t('education.schoolDetail.am'), t('education.schoolDetail.pm'));
  // Up to 6 tiles, one per category/quiz bundled onto this session — each
  // tile's picture is that quiz's own "Game Image" (quizzes.cover_image_url,
  // set from the school admin panel's Edit game modal), falling back to the
  // shared placeholder when a quiz has none.
  const tiles = (game.categories || []).slice(0, 6);

  return (
    <div className="overflow-hidden rounded-2xl border border-carissma-100 bg-white shadow-sm">
      {tiles.length > 0 && (
        <div className="grid grid-cols-2 gap-1 bg-linen-100 p-1 sm:grid-cols-3">
          {tiles.map((c, i) => (
            <div key={i} className="relative overflow-hidden rounded-lg">
              <img
                src={c.coverImageUrl || gameTileDefault}
                alt={(isAr && c.titleAr) || c.titleEn || ''}
                className="h-16 w-full object-cover sm:h-20"
              />
              <span className="absolute bottom-1 end-1 rounded-full bg-carissma-500 px-2 py-0.5 text-[10px] font-extrabold text-white shadow">
                {t('education.schoolDetail.playLabel')} {isAr ? '←' : '→'}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h3 className="text-lg font-extrabold text-carissma-500">{game.title || t('education.schoolDetail.gameFallback')}</h3>
          {audienceLabel && (
            <span className="rounded-full bg-carissma-50 px-3 py-1 text-xs font-bold text-carissma-500">{audienceLabel}</span>
          )}
        </div>

        {dateLabel && (
          <p className="mt-3 text-sm font-medium text-espresso-600">
            <span className="font-extrabold text-espresso-800">{t('education.schoolDetail.gameDateLabel')} </span>
            {dateLabel}
          </p>
        )}
        {timeLabel && (
          <p className="mt-1 text-sm font-medium text-espresso-600">
            <span className="font-extrabold text-espresso-800">{t('education.schoolDetail.gameTimeLabel')} </span>
            {timeLabel}
          </p>
        )}
        {timeLabel && (
          <p className="mt-3 rounded-xl bg-linen-100 px-3 py-2 text-xs font-medium text-espresso-600">
            {t('education.schoolDetail.joinOpensNote')}
          </p>
        )}

        {game.teams?.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            {game.teams.map((team, i) => (
              <div key={team.name || i} className="flex items-center gap-2">
                <div className="-skew-x-12 rounded-md bg-carissma-400 px-4 py-1.5 shadow-sm">
                  <span className="block skew-x-12 whitespace-nowrap text-xs font-extrabold text-white">
                    {team.name || t('education.schoolDetail.teamFallback', { index: i + 1 })}
                    {team.capacity ? ` / ${t('education.schoolDetail.playersCount', { count: team.capacity })}` : ''}
                  </span>
                </div>
                {i < game.teams.length - 1 && (
                  <span className="text-sm font-extrabold text-carissma-500">{t('education.schoolDetail.vsLabel')}</span>
                )}
              </div>
            ))}
          </div>
        )}

        {game.categories?.length > 0 && (
          <div className="mt-4">
            <p className="mb-2 text-xs font-extrabold uppercase tracking-wide text-espresso-400">
              {t('education.schoolDetail.gamesLabel')}
            </p>
            <div className="flex flex-wrap gap-2">
              {game.categories.map((c, i) => (
                <span key={i} className="rounded-full border border-carissma-200 bg-linen-50 px-3 py-1 text-xs font-bold text-espresso-600">
                  {(isAr && c.titleAr) || c.titleEn}
                </span>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={() => onJoin(game)}
          className="mt-5 w-full rounded-full bg-carissma-400 py-3 font-bold text-white transition hover:bg-carissma-500"
        >
          {t('education.schoolDetail.joinGame')}
        </button>
      </div>
    </div>
  );
}

export default function SchoolDetailPage() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language?.startsWith('ar');
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
        <div className="mx-auto max-w-4xl px-8 py-24 text-center text-espresso-500">{t('common.loading')}</div>
      </SiteLayout>
    );
  }

  if (!school) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-4xl px-8 py-24 text-center">
          <h1 className="text-2xl font-semibold text-espresso-900">{t('education.schoolDetail.notFound')}</h1>
          <Link to="/education" className="mt-4 inline-block font-semibold text-carissma-600 hover:underline">
            {isAr ? '→' : '←'} {t('education.schoolDetail.backToSchools')}
          </Link>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      {joinGame && <GameCodeModal game={joinGame} onClose={() => setJoinGame(null)} />}

      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <Link to="/education" className="text-sm font-bold text-carissma-500 hover:underline">{isAr ? '→' : '←'} {t('education.schoolDetail.backToSchools')}</Link>

        <div className="mt-6 flex flex-col items-center gap-4 text-center sm:flex-row sm:items-center sm:text-start">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-linen-100 sm:h-20 sm:w-20">
            {school.logoUrl ? (
              <img src={school.logoUrl} alt={schoolName(school, i18n.language)} className="h-full w-full object-cover" />
            ) : (
              <span className="text-2xl font-extrabold text-carissma-300">{(schoolName(school, i18n.language) || '?')[0]}</span>
            )}
          </div>
          <div>
            <StickerHeading as="h1" className="text-xl sm:text-2xl">
              {t('education.schoolDetail.gamesHeading', { school: schoolName(school, i18n.language) })}
            </StickerHeading>
          </div>
        </div>

        {games.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-carissma-100 bg-white/70 p-6 text-center sm:p-8">
            <p className="font-bold text-espresso-900">{t('education.schoolDetail.noGames')}</p>
            <p className="mx-auto mt-2 max-w-md text-sm text-espresso-600">
              {t('education.schoolDetail.noGamesBody', { school: schoolName(school, i18n.language) })}
            </p>
          </div>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 sm:gap-5">
            {games.map((game) => (
              <GameCard key={game.id} game={game} onJoin={setJoinGame} />
            ))}
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
