import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { listMyGameHistory } from '../../../api/me.api';
import { PhoneIcon, StarIcon } from '../../../components/ui/icons';

const MODE_LABEL_KEYS = { solo: 'profile.gameHistory.mode.solo', team: 'profile.gameHistory.mode.team', random: 'profile.gameHistory.mode.random' };

function PlayerCard({ name, score, isWinner, isTie }) {
  const { t } = useTranslation();
  return (
    <div className="relative rounded-2xl bg-carissma-50 p-4 text-start">
      {isWinner && isTie && (
        <span
          className="absolute -top-2 end-3 flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 text-xs shadow"
          role="img"
          aria-label={t('profile.gameHistory.tie')}
        >
          🏅
        </span>
      )}
      {isWinner && !isTie && (
        <span className="absolute -top-2 end-3 rounded-full bg-amber-400 px-2.5 py-0.5 text-[10px] font-extrabold text-white shadow">
          {t('profile.gameHistory.win')}
        </span>
      )}
      <p className="truncate text-sm font-extrabold text-espresso-900">{name}</p>
      <p className="mt-3 text-xs font-bold text-espresso-500">{t('profile.gameHistory.numberOfPoints')}</p>
      <div className="mt-1 flex items-center gap-1.5">
        <StarIcon className="h-4 w-4 text-amber-400" />
        <span className="text-lg font-extrabold text-espresso-900">{score}</span>
      </div>
    </div>
  );
}

function SessionCard({ session }) {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language?.startsWith('ar');
  const cards =
    session.mode === 'team'
      ? session.teams.map((t) => ({ id: t.id, name: t.name, score: t.score, isWinner: t.isWinner }))
      : session.participants.map((p) => ({ id: p.id, name: p.name, score: p.score, isWinner: p.isWinner }));
  const isTie = cards.filter((c) => c.isWinner).length > 1;
  const helpUsed = session.lifelinesUsed.includes('phone_a_friend');

  return (
    <div className="rounded-[2rem] border-4 border-carissma-300 bg-carissma-50/60 p-5 sm:p-6">
      <p className="text-xs font-bold text-carissma-500">
        {t('profile.gameHistory.onlineGame')} <span className="mx-1 text-espresso-300">›</span>
        <span className="text-espresso-700">{MODE_LABEL_KEYS[session.mode] ? t(MODE_LABEL_KEYS[session.mode]) : session.mode}</span>
      </p>

      <p className="mt-4 text-sm font-extrabold text-espresso-900">{t('profile.gameHistory.gameName')}</p>
      <div className="mt-2 grid grid-cols-2 gap-3">
        {cards.map((c) => (
          <PlayerCard key={c.id} name={c.name} score={c.score} isWinner={c.isWinner} isTie={isTie} />
        ))}
      </div>

      {session.quizzes.length > 0 && (
        <>
          <p className="mt-5 text-sm font-extrabold text-carissma-500">{t('profile.gameHistory.games')}</p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {session.quizzes.map((q) => (
              <span key={q.id} className="truncate rounded-full bg-carissma-100/80 px-3 py-2 text-center text-xs font-bold text-espresso-600">
                {(isAr && q.titleAr) || q.titleEn}
              </span>
            ))}
          </div>
        </>
      )}

      <p className="mt-5 text-sm font-extrabold text-carissma-500">{t('profile.gameHistory.helpOptions')}</p>
      <div className={`mt-2 flex h-11 w-11 items-center justify-center rounded-full border-2 border-carissma-400 ${helpUsed ? 'bg-carissma-400 text-white' : 'bg-white text-carissma-400 opacity-60'}`}>
        <PhoneIcon className="h-5 w-5" />
      </div>
    </div>
  );
}

export default function GameHistoryTab() {
  const { t } = useTranslation();
  const [sessions, setSessions] = useState([]);
  const [state, setState] = useState('loading');

  useEffect(() => {
    listMyGameHistory()
      .then((result) => {
        setSessions(result?.rows || []);
        setState('ready');
      })
      .catch(() => setState('error'));
  }, []);

  if (state === 'loading') return <p className="text-center text-sm font-semibold text-espresso-500">{t('profile.gameHistory.loading')}</p>;
  if (state === 'error') return <p className="text-center text-sm font-semibold text-carnation-600">{t('profile.gameHistory.loadError')}</p>;
  if (sessions.length === 0) return <p className="text-center text-sm font-semibold text-espresso-500">{t('profile.gameHistory.empty')}</p>;

  return (
    <div>
      <p className="text-xl font-extrabold text-carissma-500">{t('profile.gameHistory.title')}</p>
      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
        {sessions.map((session) => (
          <SessionCard key={session.sessionId} session={session} />
        ))}
      </div>
    </div>
  );
}
