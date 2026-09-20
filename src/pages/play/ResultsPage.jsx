import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SiteLayout from '../../components/layout/SiteLayout';
import StickerHeading from '../../components/ui/StickerHeading';
import Button from '../../components/ui/Button';
import { UserIcon } from '../../components/ui/icons';
import { getGame } from '../../api/play.api';
import { useAuth } from '../../context/AuthContext';

export default function ResultsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [session, setSession] = useState(null);

  useEffect(() => {
    getGame(id).then(setSession).catch(() => {});
  }, [id]);

  // Team games (the only kind the website creates now) are won by whichever
  // team's total score is higher, not by an individual's score — a tie
  // (most commonly 0-0, nobody answered a single question correctly) means
  // neither team won.
  const isTeamGame = Boolean(session?.teams?.length);
  const rankedTeams = isTeamGame ? [...session.teams].sort((a, b) => b.score - a.score) : [];
  const teamsTied = isTeamGame && rankedTeams.length > 1 && rankedTeams[0].score === rankedTeams[1].score;
  const winningTeam = isTeamGame && !teamsTied ? rankedTeams[0] : null;
  const myTeamId = session?.participants?.find((p) => p.user_id === user?.id)?.team_id;

  const ranked = [...(session?.participants || [])].sort((a, b) => b.score - a.score);
  const winner = ranked[0];

  return (
    <SiteLayout>
      <div className="mx-auto max-w-2xl px-6 py-14 text-center sm:px-8">
        <StickerHeading as="h1" className="text-3xl">
          {t('play.results.title')}
        </StickerHeading>

        {isTeamGame ? (
          <p className="mt-3 text-lg font-bold text-espresso-800">
            {teamsTied
              ? t('play.results.everyoneLost')
              : winningTeam.id === myTeamId
              ? t('play.results.youWon')
              : t('play.results.teamWins', { name: winningTeam.name })}
          </p>
        ) : (
          winner && (
            <p className="mt-3 text-lg font-bold text-espresso-800">
              🏆 {winner.full_name === user?.full_name ? t('play.results.youWon') : t('play.results.winnerWins', { name: winner.full_name })}
            </p>
          )
        )}

        {isTeamGame && (
          <div className="mt-8 space-y-2">
            {rankedTeams.map((team) => (
              <div
                key={team.id}
                className={`flex items-center gap-3 rounded-2xl p-4 shadow-sm ${
                  !teamsTied && team.id === winningTeam.id ? 'bg-carissma-400 text-white' : 'bg-white text-espresso-900'
                }`}
              >
                <span className="flex-1 text-start text-base font-extrabold">{team.name}</span>
                <span className="text-xl font-extrabold">{team.score}</span>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 space-y-2">
          {!isTeamGame &&
            ranked.map((p, i) => (
              <div key={p.id} className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm">
                <span className="w-6 text-sm font-extrabold text-carissma-400">#{i + 1}</span>
                {p.avatar_url ? (
                  <img src={p.avatar_url} alt="" className="h-10 w-10 rounded-full object-cover" />
                ) : (
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-carissma-100 text-carissma-500">
                    <UserIcon className="h-5 w-5" />
                  </span>
                )}
                <span className="flex-1 text-start text-sm font-bold text-espresso-900">{p.full_name}</span>
                <span className="text-lg font-extrabold text-carissma-600">{p.score}</span>
              </div>
            ))}
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button onClick={() => navigate('/play')}>{t('play.results.playAgain')}</Button>
          <Button variant="outline" onClick={() => navigate('/profile?tab=game-history')}>
            {t('play.results.viewGameHistory')}
          </Button>
        </div>
      </div>
    </SiteLayout>
  );
}
