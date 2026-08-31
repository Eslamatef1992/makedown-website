import { useEffect, useState } from 'react';
import { listMyGameHistory } from '../../../api/me.api';
import { PhoneIcon, StarIcon } from '../../../components/ui/icons';

const MODE_LABEL = { solo: 'Solo', team: 'Team', random: 'Random' };

function PlayerCard({ name, score, isWinner }) {
  return (
    <div className="relative rounded-2xl bg-carissma-50 p-4 text-start">
      {isWinner && (
        <span className="absolute -top-2 end-3 rounded-full bg-amber-400 px-2.5 py-0.5 text-[10px] font-extrabold text-white shadow">
          WIN!
        </span>
      )}
      <p className="truncate text-sm font-extrabold text-espresso-900">{name}</p>
      <p className="mt-3 text-xs font-bold text-espresso-500">Number Of Point</p>
      <div className="mt-1 flex items-center gap-1.5">
        <StarIcon className="h-4 w-4 text-amber-400" />
        <span className="text-lg font-extrabold text-espresso-900">{score}</span>
      </div>
    </div>
  );
}

function SessionCard({ session }) {
  const cards =
    session.mode === 'team'
      ? session.teams.map((t) => ({ id: t.id, name: t.name, score: t.score, isWinner: t.isWinner }))
      : session.participants.map((p) => ({ id: p.id, name: p.name, score: p.score, isWinner: p.isWinner }));
  const helpUsed = session.lifelinesUsed.includes('phone_a_friend');

  return (
    <div className="rounded-[2rem] border-4 border-carissma-300 bg-carissma-50/60 p-5 sm:p-6">
      <p className="text-xs font-bold text-carissma-500">
        Online Game <span className="mx-1 text-espresso-300">›</span>
        <span className="text-espresso-700">{MODE_LABEL[session.mode] || session.mode}</span>
      </p>

      <p className="mt-4 text-sm font-extrabold text-espresso-900">Game Name</p>
      <div className="mt-2 grid grid-cols-2 gap-3">
        {cards.map((c) => (
          <PlayerCard key={c.id} name={c.name} score={c.score} isWinner={c.isWinner} />
        ))}
      </div>

      {session.quizzes.length > 0 && (
        <>
          <p className="mt-5 text-sm font-extrabold text-carissma-500">Games</p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {session.quizzes.map((q) => (
              <span key={q.id} className="truncate rounded-full bg-carissma-100/80 px-3 py-2 text-center text-xs font-bold text-espresso-600">
                {q.titleEn || q.titleAr}
              </span>
            ))}
          </div>
        </>
      )}

      <p className="mt-5 text-sm font-extrabold text-carissma-500">Help Options</p>
      <div className={`mt-2 flex h-11 w-11 items-center justify-center rounded-full border-2 border-carissma-400 ${helpUsed ? 'bg-carissma-400 text-white' : 'bg-white text-carissma-400 opacity-60'}`}>
        <PhoneIcon className="h-5 w-5" />
      </div>
    </div>
  );
}

export default function GameHistoryTab() {
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

  if (state === 'loading') return <p className="text-center text-sm font-semibold text-espresso-500">Loading game history…</p>;
  if (state === 'error') return <p className="text-center text-sm font-semibold text-carnation-600">Couldn't load your game history right now.</p>;
  if (sessions.length === 0) return <p className="text-center text-sm font-semibold text-espresso-500">You haven't played any games yet.</p>;

  return (
    <div>
      <p className="text-xl font-extrabold text-carissma-500">Game History</p>
      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
        {sessions.map((session) => (
          <SessionCard key={session.sessionId} session={session} />
        ))}
      </div>
    </div>
  );
}
