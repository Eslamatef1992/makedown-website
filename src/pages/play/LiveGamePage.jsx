import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  RefreshIcon, PauseIcon, LiveCallIcon, LiveTapIcon, LiveShuffleIcon,
  UserIcon, PlusIcon, MinusIcon, SpeakerIcon, LiveChatIcon,
} from '../../components/ui/icons';
import {
  getGame, pickTile, submitAnswer, leaveGame,
  applyFiftyFifty, applySkip, callPhoneAFriend as phoneAFriendApi, respondPhoneAFriend, adjustScore,
} from '../../api/play.api';
import { joinGameRoom, onGameEvent } from '../../lib/gameSocket';
import { useAuth } from '../../context/AuthContext';
import gameTileDefault from '../../assets/game-tile-default.jpg';

// The play API's question/options payload ultimately comes from MySQL's
// JSON-typed options_json_en/options_json_ar columns, which the backend
// may hand back already deserialized into a real array — guard for a
// plain JSON string too so this never crashes either way.
const parseOptions = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return [];
    }
  }
  return [];
};

const LIFELINES = [
  { key: 'phone_a_friend', icon: LiveCallIcon, label: 'Phone a friend' },
  { key: 'fifty_fifty', icon: LiveTapIcon, label: '50 / 50' },
  { key: 'skip', icon: LiveShuffleIcon, label: 'Skip' },
];

function ScoreBlock({ participant, isMe, canAdjust, onAdjustScore }) {
  return (
    <div className="flex flex-col items-center">
      <p className="text-sm font-extrabold text-espresso-900">
        {participant.full_name}
        {isMe && ' (you)'}
      </p>
      <div className="mt-2 flex items-center gap-2">
        {canAdjust && (
          <button
            onClick={() => onAdjustScore(participant.id, 50)}
            className="flex h-6 w-6 items-center justify-center rounded-full bg-carissma-400 text-carissma-50 hover:bg-carissma-500"
          >
            <PlusIcon className="h-3 w-3" />
          </button>
        )}
        <span className="rounded-full bg-carissma-400 px-5 py-1.5 text-sm font-extrabold text-carissma-50">
          {participant.score}
        </span>
        {canAdjust && (
          <button
            onClick={() => onAdjustScore(participant.id, -50)}
            className="flex h-6 w-6 items-center justify-center rounded-full bg-carissma-400 text-carissma-50 hover:bg-carissma-500"
          >
            <MinusIcon className="h-3 w-3" />
          </button>
        )}
      </div>
    </div>
  );
}

function HelpOptionsBlock({ isMe, usedLifelines, canAct, onLifeline }) {
  return (
    <div className="flex flex-col items-center">
      <p
        className="text-sm font-extrabold text-carissma-400"
        style={{ textShadow: '1.5px 0 0 #fff, -1.5px 0 0 #fff, 0 1.5px 0 #fff, 0 -1.5px 0 #fff, 1.5px 1.5px 0 #fff, -1.5px -1.5px 0 #fff, 1.5px -1.5px 0 #fff, -1.5px 1.5px 0 #fff' }}
      >
        Help Options
      </p>

      <div className="mt-3 flex items-center gap-3">
        {LIFELINES.map(({ key, icon: Icon }) => {
          const used = usedLifelines.includes(key);
          const active = isMe && canAct && !used;
          return (
            <button
              key={key}
              disabled={!active}
              onClick={() => onLifeline(key)}
              className={`flex h-12 w-12 items-center justify-center rounded-full bg-carissma-400/[0.14] text-carissma-400 transition ${
                active ? 'border-4 border-carissma-500 hover:bg-carissma-400/20' : 'border border-carissma-50'
              } ${used ? 'opacity-40' : ''}`}
            >
              <Icon className="h-5 w-5" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ScorePill({ participant }) {
  return (
    <div className="flex h-12 items-center gap-1.5 rounded-full bg-carissma-400 px-6">
      <span className="text-base font-medium text-carissma-50">{participant.full_name}:</span>
      <span className="text-2xl font-semibold text-carissma-50">{participant.score}</span>
    </div>
  );
}

function QuestionSidebar({ participant, isMe, usedLifelines, canAct, onLifeline }) {
  return (
    <div className="flex w-44 flex-none flex-col items-center gap-4 rounded-[2rem] bg-carissma-100 px-6 py-8">
      <ScorePill participant={participant} />
      <HelpOptionsBlock isMe={isMe} usedLifelines={usedLifelines} canAct={canAct} onLifeline={onLifeline} />
    </div>
  );
}

function QuestionCard({ question, awaitingScan, scanQrDataUrl, scanUrl, selected, onSelect, hiddenOptions }) {
  const options = useMemo(() => parseOptions(question.options_json_en), [question]);
  const letters = ['A', 'B', 'C', 'D', 'E', 'F'];

  if (question.question_type === 'qr') {
    return (
      <div className="rounded-3xl bg-carissma-50 p-8 text-center">
        <p className="text-lg font-extrabold text-espresso-900">{question.question_text_en}</p>
        {awaitingScan ? (
          <>
            {scanQrDataUrl ? (
              <img src={scanQrDataUrl} alt="Scan to reveal" className="mx-auto mt-6 h-48 w-48 rounded-2xl border-4 border-white" />
            ) : (
              <p className="mt-6 text-sm text-espresso-500">Generating code…</p>
            )}
            <p className="mt-4 text-xs text-espresso-500">Scan with another device to start the timer.</p>
            {scanUrl && (
              <a href={scanUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block text-xs font-bold text-carissma-600 underline">
                Open scan link
              </a>
            )}
          </>
        ) : (
          <p className="mt-4 font-bold text-carissma-600">Scanned — answer below!</p>
        )}
      </div>
    );
  }

  return (
    <div className="relative pt-9 sm:pt-10">
      <div className="absolute start-1/2 top-0 z-10 flex h-9 max-w-[88%] -translate-x-1/2 items-center justify-center rounded-t-2xl bg-carissma-100 px-8 sm:h-10 sm:px-14">
        <p className="truncate text-center text-base font-extrabold text-espresso-900 sm:text-lg">{question.question_text_en}</p>
      </div>
      <div className="relative overflow-hidden rounded-[2rem] bg-carissma-100 p-6 pt-5 sm:p-8 sm:pt-6">
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              'repeating-linear-gradient(115deg, rgba(255,255,255,0.7) 0px, rgba(255,255,255,0.7) 36px, transparent 36px, transparent 80px)',
          }}
        />
        <div className="relative">

        {question.question_type === 'image' && question.media_url && (
          <img src={question.media_url} alt="" className="mx-auto mt-4 max-h-56 w-full rounded-2xl object-cover" />
        )}

        {question.question_type === 'audio' && question.media_url && (
          <div className="mx-auto mt-4 flex max-w-md items-center gap-3 rounded-full bg-white px-4 py-3">
            <SpeakerIcon className="h-5 w-5 flex-none text-espresso-700" />
            <audio controls src={question.media_url} className="h-9 w-full" />
          </div>
        )}

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {options.map((opt, i) => {
            if (hiddenOptions.includes(i)) return <div key={i} className="hidden sm:block" />;
            const isSelected = selected === i;
            return (
              <button
                key={i}
                onClick={() => onSelect(i)}
                className="flex items-center gap-2.5 rounded-full bg-carissma-50 px-4 py-2 text-start transition hover:bg-white"
              >
                <span className={`flex h-6 w-6 flex-none items-center justify-center rounded-full border-2 ${isSelected ? 'border-carissma-500' : 'border-carissma-300'}`}>
                  {isSelected && <span className="h-3 w-3 rounded-full bg-carissma-500" />}
                </span>
                <span className="text-sm font-medium capitalize text-carissma-400">{letters[i]}. {opt}</span>
              </button>
            );
          })}
        </div>
        </div>
      </div>
    </div>
  );
}

function GamesBoard({ board, onPick, canPick }) {
  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-3">
      {board.map((column) => {
        const sorted = [...column.questions].sort((a, b) => a.points - b.points);
        const mid = Math.ceil(sorted.length / 2);
        const left = sorted.slice(0, mid);
        const right = sorted.slice(mid);
        const pointButton = (q) => (
          <button
            key={q.id}
            disabled={q.used || !canPick}
            onClick={() => onPick(q.id)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-extrabold shadow-sm transition ${
              q.used ? 'bg-carissma-100 text-carissma-200' : 'bg-carissma-200 text-carissma-400 hover:bg-carissma-300 disabled:opacity-50'
            }`}
          >
            {q.points}
          </button>
        );
        return (
          <div key={column.id} className="relative pt-8">
            <div className="absolute start-1/2 top-0 z-20 flex h-8 -translate-x-1/2 items-center rounded-t-2xl bg-white px-5">
              <span dir="rtl" className="whitespace-nowrap text-xs font-extrabold text-carissma-400">
                {column.title_ar || column.title_en}
              </span>
            </div>
            <div className="rounded-[1.75rem] bg-carissma-100 pb-4 pt-6">
              <div className="flex items-center justify-center">
                <div className="z-0 -me-3 flex flex-col gap-2">{left.map(pointButton)}</div>
                <div className="relative z-10 aspect-[204/218] w-32 flex-none overflow-hidden rounded-[1.25rem] bg-[#CBE0F3] shadow-sm sm:w-36">
                  <img src={gameTileDefault} alt="" className="h-full w-full object-cover" />
                </div>
                <div className="z-0 -ms-3 flex flex-col gap-2">{right.map(pointButton)}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function LiveGamePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [session, setSession] = useState(null);
  const [awaitingScan, setAwaitingScan] = useState(false);
  const [scanQrDataUrl, setScanQrDataUrl] = useState(null);
  const [scanUrl, setScanUrl] = useState(null);
  const [selected, setSelected] = useState(null);
  const [hiddenOptions, setHiddenOptions] = useState([]);
  const [usedLifelines, setUsedLifelines] = useState([]);
  const [flash, setFlash] = useState(null); // { isCorrect }
  const [timeLeft, setTimeLeft] = useState(null);
  const [friendRequest, setFriendRequest] = useState(null);
  const [friendHint, setFriendHint] = useState(null);
  const [phonePickerFor, setPhonePickerFor] = useState(false);
  const tickRef = useRef(null);

  const refresh = useCallback(() => getGame(id).then(setSession).catch(() => {}), [id]);

  useEffect(() => {
    refresh();
    const token = localStorage.getItem('md_access_token');
    const leaveRoom = joinGameRoom(id, token);

    const offState = onGameEvent('game:state', (detail) => {
      if (detail.id === Number(id)) {
        setSession(detail);
        if (!detail.currentQuestion) {
          setSelected(null);
          setHiddenOptions([]);
          setAwaitingScan(false);
        }
      }
    });
    const offTile = onGameEvent('game:tile_picked', (payload) => {
      if (payload.sessionId !== Number(id)) return;
      setSelected(null);
      setHiddenOptions([]);
      setFlash(null);
      setAwaitingScan(payload.awaitingScan);
      setScanQrDataUrl(payload.scanQrDataUrl || null);
      setScanUrl(payload.scanUrl || null);
      refresh();
    });
    const offRevealed = onGameEvent('game:question_revealed', (payload) => {
      if (payload.sessionId !== Number(id)) return;
      setAwaitingScan(false);
      refresh();
    });
    const offResult = onGameEvent('game:answer_result', (payload) => {
      if (payload.sessionId !== Number(id)) return;
      setFlash({ isCorrect: payload.isCorrect });
      setTimeout(() => setFlash(null), 2500);
    });
    const offEnded = onGameEvent('game:ended', (payload) => {
      if (payload.sessionId === Number(id)) navigate(`/play/sessions/${id}/results`, { replace: true });
    });
    const offLifelineReq = onGameEvent('game:lifeline_request', (payload) => {
      if (payload.sessionId === Number(id)) setFriendRequest(payload);
    });
    const offLifelineRes = onGameEvent('game:lifeline_response', (payload) => {
      if (payload.sessionId === Number(id)) setFriendHint(payload.suggestedOptionIndex);
    });

    return () => {
      leaveRoom();
      offState(); offTile(); offRevealed(); offResult(); offEnded(); offLifelineReq(); offLifelineRes();
      clearInterval(tickRef.current);
    };
  }, [id, navigate, refresh]);

  // Client-side countdown ticking off the server's turn_ends_at.
  useEffect(() => {
    clearInterval(tickRef.current);
    if (!session?.turn_ends_at || awaitingScan) {
      setTimeLeft(null);
      return;
    }
    const tick = () => {
      const remaining = Math.max(0, Math.round((new Date(session.turn_ends_at).getTime() - Date.now()) / 1000));
      setTimeLeft(remaining);
    };
    tick();
    tickRef.current = setInterval(tick, 1000);
    return () => clearInterval(tickRef.current);
  }, [session?.turn_ends_at, awaitingScan]);

  const myParticipant = useMemo(
    () => session?.participants?.find((p) => p.user_id === user?.id),
    [session, user]
  );
  const currentCategory = useMemo(() => {
    if (!session?.currentQuestion || !session?.board) return null;
    return session.board.find((c) => (c.questions || []).some((q) => q.id === session.currentQuestion.id)) || null;
  }, [session]);
  const isHost = session && user && session.host_user_id === user.id;
  const isMyTurn = session && myParticipant && session.currentTurnParticipantId === myParticipant.id;
  const currentTurnParticipant = session?.participants?.find((p) => p.id === session.currentTurnParticipantId);

  const onPick = async (questionId) => {
    try {
      await pickTile(id, questionId);
    } catch {
      refresh();
    }
  };

  const onSubmit = async () => {
    if (selected === null || !session?.currentQuestion) return;
    try {
      await submitAnswer(id, session.currentQuestion.id, selected);
    } finally {
      setSelected(null);
    }
  };

  const onLifeline = async (key) => {
    if (!session?.currentQuestion) return;
    const questionId = session.currentQuestion.id;
    try {
      if (key === 'fifty_fifty') {
        const res = await applyFiftyFifty(id, questionId);
        setHiddenOptions(res.hideOptionIndexes || []);
      } else if (key === 'skip') {
        await applySkip(id, questionId);
      } else if (key === 'phone_a_friend') {
        setPhonePickerFor(questionId);
        return;
      }
      setUsedLifelines((l) => [...l, key]);
    } catch {
      refresh();
    }
  };

  const callFriend = async (targetParticipantId) => {
    if (!session?.currentQuestion) return;
    try {
      await phoneAFriendApi(id, session.currentQuestion.id, targetParticipantId);
      setUsedLifelines((l) => [...l, 'phone_a_friend']);
    } finally {
      setPhonePickerFor(false);
    }
  };

  const respondToFriend = async (index) => {
    if (!friendRequest) return;
    await respondPhoneAFriend(friendRequest.requestId, index);
    setFriendRequest(null);
  };

  const onAdjustScore = async (participantId, delta) => {
    try {
      await adjustScore(id, participantId, delta);
    } catch {
      refresh();
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
    return <div className="flex min-h-screen items-center justify-center text-espresso-500">Loading game…</div>;
  }

  return (
    <div className="min-h-screen bg-carissma-50/50 px-4 py-6">
      <div className="mx-auto max-w-[1400px] rounded-[1.5rem] border-[6px] border-carissma-400 bg-carissma-50 p-4 shadow-lg sm:p-6">
        {/* Header */}
        <div className="flex items-center justify-between rounded-3xl bg-gradient-to-r from-carissma-50 via-carissma-400 to-carissma-300 px-5 py-3">
          <img src="/logo-mark.png" alt="Make Down" className="h-12 w-12 flex-none object-contain" />
          <h1 className="text-lg font-extrabold text-white sm:text-xl">
            {session.title || 'Live Game'}
          </h1>
          <button onClick={onLeave} className="rounded-xl bg-carissma-100 px-5 py-2 text-xs font-extrabold text-carissma-400 hover:bg-carissma-200">
            Leave Game
          </button>
        </div>

        {/* Turn indicator + logo mark */}
        <div className="mt-4 flex items-center justify-between rounded-3xl bg-carissma-100 px-5 py-4">
          <span className="inline-flex items-center rounded-s-full rounded-se-[1.75rem] bg-carissma-400 px-6 py-2.5 text-sm font-bold text-white">
            {currentTurnParticipant ? (
              <>It&rsquo;s&nbsp;<span className="font-extrabold">{currentTurnParticipant.full_name}</span>&rsquo;s Turn To Play.</>
            ) : 'Waiting for the next turn…'}
          </span>
          <img src="/logo-mark.png" alt="Make Down" className="h-16 w-16 object-contain" />
          <span className="w-24" />
        </div>

        {flash && (
          <div className={`mt-3 rounded-2xl px-4 py-2 text-center text-sm font-extrabold ${flash.isCorrect ? 'bg-green-100 text-green-700' : 'bg-carnation-100 text-carnation-700'}`}>
            {flash.isCorrect ? 'Correct! 🎉' : 'Not quite — moving to the next turn.'}
          </div>
        )}
        {friendHint !== null && (
          <div className="mt-3 rounded-2xl bg-saffron-100 px-4 py-2 text-center text-sm font-bold text-saffron-700">
            Your friend suggests option {['A', 'B', 'C', 'D'][friendHint]}
            <button onClick={() => setFriendHint(null)} className="ms-3 underline">dismiss</button>
          </div>
        )}

        {/* Games content: a question in progress uses left/right participant
            sidebars flanking the question card; the board-select screen uses
            a single-column board with a full-width Help Options bar below. */}
        <div className="mt-6">
          {session.currentQuestion ? (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[176px_1fr_176px] lg:items-start">
              <div className="flex justify-center lg:justify-start">
                {session.participants?.[0] && (
                  <QuestionSidebar
                    participant={session.participants[0]}
                    isMe={myParticipant?.id === session.participants[0].id}
                    usedLifelines={myParticipant?.id === session.participants[0].id ? usedLifelines : []}
                    canAct={isMyTurn && Boolean(session.currentQuestion) && !awaitingScan}
                    onLifeline={onLifeline}
                  />
                )}
              </div>

              <div>
                <div>
                  <div className="text-center">
                    {currentCategory && (
                      <p dir="rtl" className="text-sm font-bold text-carissma-500">
                        {currentCategory.title_ar || currentCategory.title_en}
                      </p>
                    )}
                    {timeLeft !== null && (
                      <div className="mt-2">
                        <p className="text-sm font-bold text-espresso-800">Remaining Time:</p>
                        <span className="mt-1 inline-flex items-center gap-2 rounded-full bg-carissma-500 px-4 py-1.5 text-xs font-bold text-white">
                          <RefreshIcon className="h-4 w-4" /> {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')} S <PauseIcon className="h-4 w-4" />
                        </span>
                      </div>
                    )}
                  </div>
                  <p className="relative z-10 mt-3 flex items-center gap-1 text-sm font-bold text-espresso-900">
                    <span aria-hidden="true">⭐</span> {session.currentQuestion.points} Point
                  </p>
                </div>
                <QuestionCard
                  question={session.currentQuestion}
                  awaitingScan={awaitingScan}
                  scanQrDataUrl={scanQrDataUrl}
                  scanUrl={scanUrl}
                  selected={selected}
                  onSelect={isMyTurn ? setSelected : () => {}}
                  hiddenOptions={hiddenOptions}
                />
              </div>

              <div className="flex justify-center lg:justify-end">
                {session.participants?.[1] && (
                  <QuestionSidebar
                    participant={session.participants[1]}
                    isMe={myParticipant?.id === session.participants[1].id}
                    usedLifelines={myParticipant?.id === session.participants[1].id ? usedLifelines : []}
                    canAct={isMyTurn && Boolean(session.currentQuestion) && !awaitingScan}
                    onLifeline={onLifeline}
                  />
                )}
              </div>
            </div>
          ) : (
            <>
              <p
                className="mb-4 text-center text-xl font-extrabold text-carissma-400"
                style={{
                  textShadow:
                    '1.5px 0 0 #fff, -1.5px 0 0 #fff, 0 1.5px 0 #fff, 0 -1.5px 0 #fff, 1.5px 1.5px 0 #fff, -1.5px -1.5px 0 #fff, 1.5px -1.5px 0 #fff, -1.5px 1.5px 0 #fff',
                }}
              >
                Games
              </p>
              <GamesBoard board={session.board || []} onPick={onPick} canPick={isMyTurn && session.status === 'active'} />
            </>
          )}
        </div>

        {session.currentQuestion && isMyTurn && !awaitingScan && (
          <button
            onClick={onSubmit}
            disabled={selected === null}
            className="mt-4 w-full rounded-xl bg-carissma-400 py-3.5 text-base font-bold text-espresso-50 hover:bg-carissma-500 disabled:opacity-50"
          >
            Next
          </button>
        )}

        {/* Help Options bar: board-select screen only (the question screen uses
            the left/right sidebars above instead). Renders with just one
            participant too — the second cluster only appears once
            participants[1] exists. */}
        {!session.currentQuestion && session.participants?.length >= 1 && (
          <div className="mt-6 flex flex-col items-center gap-6 rounded-3xl bg-carissma-100 px-3 py-5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-x-10 sm:px-6">
            <div className="flex flex-wrap items-center justify-center gap-4 sm:flex-nowrap sm:gap-8">
              <ScoreBlock
                participant={session.participants[0]}
                isMe={myParticipant?.id === session.participants[0].id}
                canAdjust={isHost}
                onAdjustScore={onAdjustScore}
              />
              <HelpOptionsBlock
                isMe={myParticipant?.id === session.participants[0].id}
                usedLifelines={myParticipant?.id === session.participants[0].id ? usedLifelines : []}
                canAct={isMyTurn && Boolean(session.currentQuestion) && !awaitingScan}
                onLifeline={onLifeline}
              />
            </div>

            {session.participants[1] && (
              <div className="flex flex-wrap items-center justify-center gap-4 sm:flex-nowrap sm:gap-8">
                <HelpOptionsBlock
                  isMe={myParticipant?.id === session.participants[1].id}
                  usedLifelines={myParticipant?.id === session.participants[1].id ? usedLifelines : []}
                  canAct={isMyTurn && Boolean(session.currentQuestion) && !awaitingScan}
                  onLifeline={onLifeline}
                />
                <ScoreBlock
                  participant={session.participants[1]}
                  isMe={myParticipant?.id === session.participants[1].id}
                  canAdjust={isHost}
                  onAdjustScore={onAdjustScore}
                />
              </div>
            )}
          </div>
        )}

        {!session.currentQuestion && session.participants?.length > 2 && (
          <div className="mt-4 flex flex-wrap justify-center gap-4">
            {session.participants.slice(2).map((p) => (
              <div key={p.id} className="flex flex-wrap items-center justify-center gap-4 rounded-3xl bg-carissma-100 px-4 py-5 sm:flex-nowrap sm:gap-8 sm:px-6">
                <ScoreBlock
                  participant={p}
                  isMe={myParticipant?.id === p.id}
                  canAdjust={isHost}
                  onAdjustScore={onAdjustScore}
                />
                <HelpOptionsBlock
                  isMe={myParticipant?.id === p.id}
                  usedLifelines={myParticipant?.id === p.id ? usedLifelines : []}
                  canAct={isMyTurn && Boolean(session.currentQuestion) && !awaitingScan}
                  onLifeline={onLifeline}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Phone-a-friend: pick who to call */}
      {phonePickerFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 text-center">
            <h3 className="text-lg font-extrabold text-espresso-900">Phone a friend</h3>
            <p className="mt-1 text-sm text-espresso-600">Who do you want to ask?</p>
            <div className="mt-4 space-y-2">
              {session.participants.filter((p) => p.id !== myParticipant?.id).map((p) => (
                <button
                  key={p.id}
                  onClick={() => callFriend(p.id)}
                  className="flex w-full items-center gap-2 rounded-2xl bg-carissma-50 px-3 py-2 text-start text-sm font-bold text-espresso-900 hover:bg-carissma-100"
                >
                  <UserIcon className="h-4 w-4 text-carissma-500" /> {p.full_name}
                </button>
              ))}
            </div>
            <button onClick={() => setPhonePickerFor(false)} className="mt-4 text-sm font-bold text-carissma-600 underline">Cancel</button>
          </div>
        </div>
      )}

      {/* Incoming phone-a-friend request */}
      {friendRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 text-center">
            <h3 className="text-lg font-extrabold text-espresso-900">A friend needs your help!</h3>
            <p className="mt-2 text-sm font-bold text-espresso-900">{friendRequest.question.question_text_en}</p>
            <div className="mt-3 space-y-2">
              {parseOptions(friendRequest.question.options_json_en).map((opt, i) => (
                <button
                  key={i}
                  onClick={() => respondToFriend(i)}
                  className="flex w-full items-center gap-2 rounded-2xl bg-carissma-50 px-3 py-2 text-start text-sm font-bold text-espresso-900 hover:bg-carissma-100"
                >
                  {['A', 'B', 'C', 'D'][i]}. {opt}
                </button>
              ))}
            </div>
            <button onClick={() => setFriendRequest(null)} className="mt-4 text-sm font-bold text-carissma-600 underline">Ignore</button>
          </div>
        </div>
      )}

      <button className="fixed bottom-6 end-6 flex h-14 w-14 items-center justify-center rounded-full bg-white text-carissma-400 shadow-lg hover:bg-carissma-50">
        <LiveChatIcon className="h-7 w-7" />
      </button>
    </div>
  );
}
