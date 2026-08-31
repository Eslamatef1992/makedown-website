import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PlayModalLayout, { PlayCard } from './components/PlayModalLayout';
import StickerHeading from '../../components/ui/StickerHeading';
import Button from '../../components/ui/Button';
import { UserIcon } from '../../components/ui/icons';
import { getGame, startGame, leaveGame } from '../../api/play.api';
import { joinGameRoom, onGameEvent } from '../../lib/gameSocket';
import { useAuth } from '../../context/AuthContext';

export default function LobbyPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [session, setSession] = useState(null);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    getGame(id).then((s) => mounted && setSession(s));

    const token = localStorage.getItem('md_access_token');
    const leaveRoom = joinGameRoom(id, token);
    const offState = onGameEvent('game:state', (detail) => mounted && detail.id === Number(id) && setSession(detail));
    const offStarted = onGameEvent('game:started', (detail) => {
      if (mounted && detail.id === Number(id)) navigate(`/play/sessions/${id}/live`, { replace: true });
    });

    return () => {
      mounted = false;
      leaveRoom();
      offState();
      offStarted();
    };
  }, [id, navigate]);

  const isHost = session && user && session.host_user_id === user.id;

  const onStart = async () => {
    setError('');
    setStarting(true);
    try {
      await startGame(id);
      navigate(`/play/sessions/${id}/live`);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not start the game yet.');
    } finally {
      setStarting(false);
    }
  };

  const onLeave = async () => {
    try {
      await leaveGame(id);
    } finally {
      navigate('/play');
    }
  };

  if (!session) {
    return (
      <PlayModalLayout backTo="/play" backLabel="Back" backStyle="link">
        <PlayCard maxWidth="max-w-2xl" border="border-4 border-carissma-300" radius="rounded-[2.5rem]" className="py-16">
          <StickerHeading as="h2" className="text-3xl">
            Waiting……
          </StickerHeading>
          <div className="mt-10 flex items-center justify-center gap-2">
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-carissma-200" />
            <span className="h-3.5 w-3.5 animate-pulse rounded-full bg-carissma-500" style={{ animationDelay: '150ms' }} />
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-carissma-200" style={{ animationDelay: '300ms' }} />
          </div>
        </PlayCard>
      </PlayModalLayout>
    );
  }

  return (
    <PlayModalLayout onBack={onLeave} backLabel="Back" backStyle="link">
      <PlayCard maxWidth="max-w-2xl" border="border-4 border-carissma-300" radius="rounded-[2.5rem]">
        <StickerHeading as="h2" className="text-2xl">
          {session.status === 'waiting' ? 'Waiting……' : session.title || 'Game Lobby'}
        </StickerHeading>

        {session.status === 'waiting' && (
          <div className="mt-6 flex items-center justify-center gap-1.5">
            <span className="h-2 w-2 animate-pulse rounded-full bg-carissma-200" />
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-carissma-500" style={{ animationDelay: '150ms' }} />
            <span className="h-2 w-2 animate-pulse rounded-full bg-carissma-200" style={{ animationDelay: '300ms' }} />
          </div>
        )}

        <p className="mt-4 text-xs font-bold uppercase tracking-wide text-carissma-400">Join code</p>
        <p className="text-2xl font-extrabold tracking-[0.3em] text-carissma-600">{session.join_code}</p>

        <div className="mt-6 space-y-2 text-start">
          {(session.participants || []).map((p) => (
            <div key={p.id} className="flex items-center gap-2 rounded-2xl bg-white/70 px-3 py-2">
              {p.avatar_url ? (
                <img src={p.avatar_url} alt="" className="h-8 w-8 rounded-full object-cover" />
              ) : (
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-carissma-100 text-carissma-500">
                  <UserIcon className="h-4 w-4" />
                </span>
              )}
              <span className="text-sm font-bold text-espresso-900">{p.full_name}</span>
              {p.team_name && <span className="ms-auto text-xs font-bold text-carissma-500">{p.team_name}</span>}
              {p.user_id === session.host_user_id && <span className="ms-auto text-xs font-bold text-carissma-400">Host</span>}
            </div>
          ))}
        </div>

        {error && <p className="mt-4 text-sm font-medium text-carnation-600">{error}</p>}

        {isHost && session.status === 'waiting' && (
          <Button className="mt-6" onClick={onStart} loading={starting}>
            Start Game
          </Button>
        )}
        {!isHost && session.status === 'waiting' && (
          <p className="mt-6 text-sm font-medium text-espresso-600">Waiting for the host to start the game…</p>
        )}
      </PlayCard>
    </PlayModalLayout>
  );
}
