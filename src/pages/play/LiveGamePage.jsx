import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import StickerHeading from '../../components/ui/StickerHeading';
import {
  StarIcon, RefreshIcon, PauseIcon, PlayIcon, PhoneIcon, HandTapIcon, ShuffleIcon,
  UserIcon, LeaveIcon, PlusIcon, MinusIcon, SpeakerIcon, ChatBubbleIcon,
} from '../../components/ui/icons';
import {
  getGame, pickTile, submitAnswer, leaveGame,
  applyFiftyFifty, applySkip, callPhoneAFriend as phoneAFriendApi, respondPhoneAFriend, adjustScore,
} from '../../api/play.api';
import { joinGameRoom, onGameEvent } from '../../lib/gameSocket';
import { useAuth } from '../../context/AuthContext';

const LIFELINES = [
  { key: 'phone_a_friend', icon: PhoneIcon, label: 'Phone a friend' },
  { key: 'fifty_fifty', icon: HandTapIcon, label: '50 / 50' },
  { key: 'skip', icon: ShuffleIcon, label: 'Skip' },
];

function ParticipantPanel({ participant, isMe, isCurrentTurn, isHost, usedLifelines, canAct, onLifeline, onAdjustScore }) {
  return (
    <div className={`w-full max-w-[220px] rounded-3xl p-4 ${isCurrentTurn ? 'bg-carissma-100' : 'bg-carissma-50'}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-2 rounded-full bg-carissma-500 px-3 py-1 text-xs font-bold text-white">
          {participant.full_name}
          {isMe && ' (you)'}
        </span>
      </div>
      <div className="mt-2 flex items-center justify-center gap-2">
        {isHost && (
          <button onClick={() => onAdjustScore(participant.id, -50)} className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-carissma-500 hover:bg-carissma-100">
            <MinusIcon className="h-3.5 w-3.5" />
          </button>
        )}
        <span className="text-lg font-extrabold text-espresso-900">{participant.score}</span>
        {isHost && (
          <button onClick={() => onAdjustScore(participant.id, 50)} className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-carissma-500 hover:bg-carissma-100">
            <PlusIcon className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <p className="mt-3 text-center text-xs font-bold text-carissma-500">Help Options</p>
      <div className="mt-2 flex items-center justify-center gap-3">
        {LIFELINES.map(({ key, icon: Icon }) => {
          const used = usedLifelines.includes(key);
          const active = isMe && canAct && !used;
          return (
            <button
              key={key}
              disabled={!active}
              onClick={() => onLifeline(key)}
              className={`flex h-9 w-9 items-center justify-center rounded-full border-2 transition ${
                active ? 'border-carissma-500 text-carissma-600 hover:bg-carissma-100' : 'border-carissma-100 text-carissma-200'
              }`}
            >
              <Icon className="h-4 w-4" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

function QuestionCard({ question, awaitingScan, scanQrDataUrl, scanUrl, selected, onSelect, hiddenOptions }) {
  const options = useMemo(() => JSON.parse(question.options_json_en || '[]'), [question]);
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
    <div className="rounded-3xl bg-carissma-50 p-6 sm:p-8">
      <p className="text-center text-lg font-extrabold text-espresso-900">{question.question_text_en}</p>

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
              className={`flex items-center gap-3 rounded-2xl border-2 px-4 py-3 text-start transition ${
                isSelected ? 'border-carissma-500 bg-white' : 'border-carissma-100 bg-white/60 hover:border-carissma-300'
              }`}
            >
              <span className={`flex h-5 w-5 flex-none items-center justify-center rounded-full border-2 ${isSelected ? 'border-carissma-500' : 'border-carissma-200'}`}>
                {isSelected && <span className="h-2.5 w-2.5 rounded-full bg-carissma-500" />}
              </span>
              <span className="text-sm font-bold text-carissma-700">{letters[i]}. {opt}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function GamesBoard({ board, onPick, canPick }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {board.map((column) => (
        <div key={column.id} className="rounded-3xl bg-carissma-50 p-4 text-center">
          <span className="mb-2 inline-block rounded-full bg-carissma-100 px-3 py-1 text-xs font-bold text-carissma-600">
            {column.title_en}
          </span>
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white mx-auto text-2xl">🎨</div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {[...column.questions].sort((a, b) => a.points - b.points).map((q) => (
              <button
                key={q.id}
                disabled={q.used || !canPick}
                onClick={() => onPick(q.id)}
                className={`rounded-full px-3 py-1.5 text-xs font-extrabold transition ${
                  q.used ? 'bg-carissma-100 text-carissma-200' : 'bg-carissma-500 text-white hover:bg-carissma-600 disabled:opacity-50'
                }`}
              >
                {q.points}
              </button>
            ))}
          </div>
        </div>
      ))}
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
      <div className="mx-auto max-w-[1400px] rounded-[2.5rem] border-2 border-carissma-200 bg-white p-4 shadow-lg sm:p-6">
        {/* Header */}
        <div className="flex items-center justify-between rounded-3xl bg-gradient-to-r from-carissma-200 via-carissma-400 to-carissma-200 px-5 py-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-lg font-black text-carissma-500">MD</span>
          <StickerHeading as="h1" className="text-lg text-white sm:text-xl">
            {session.title || 'Live Game'}
          </StickerHeading>
          <button onClick={onLeave} className="flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-bold text-carissma-600 hover:bg-carissma-50">
            <LeaveIcon className="h-4 w-4" /> Leave Game
          </button>
        </div>

        {/* Turn indicator */}
        <div className="mt-4 flex items-center justify-center">
          <span className="rounded-full bg-carissma-500 px-5 py-2 text-sm font-bold text-white">
            {currentTurnParticipant ? `It's ${currentTurnParticipant.full_name}'s turn to play.` : 'Waiting for the next turn…'}
          </span>
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

        {/* Main area: side panels + center content */}
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[220px_1fr_220px]">
          <div className="flex justify-center lg:justify-start">
            {session.participants?.[0] && (
              <ParticipantPanel
                participant={session.participants[0]}
                isMe={myParticipant?.id === session.participants[0].id}
                isCurrentTurn={session.currentTurnParticipantId === session.participants[0].id}
                isHost={isHost}
                usedLifelines={myParticipant?.id === session.participants[0].id ? usedLifelines : []}
                canAct={isMyTurn && Boolean(session.currentQuestion) && !awaitingScan}
                onLifeline={onLifeline}
                onAdjustScore={onAdjustScore}
              />
            )}
          </div>

          <div>
            {session.currentQuestion ? (
              <>
                <div className="mb-3 flex items-center justify-between">
                  <span className="flex items-center gap-1 rounded-full bg-carissma-100 px-3 py-1 text-xs font-bold text-carissma-600">
                    <StarIcon className="h-4 w-4" /> {session.currentQuestion.points} Point
                  </span>
                  {timeLeft !== null && (
                    <span className="flex items-center gap-2 rounded-full bg-carissma-500 px-4 py-1.5 text-xs font-bold text-white">
                      <RefreshIcon className="h-4 w-4" /> Remaining Time: {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')} S <PauseIcon className="h-4 w-4" />
                    </span>
                  )}
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
                {isMyTurn && !awaitingScan && (
                  <button
                    onClick={onSubmit}
                    disabled={selected === null}
                    className="mt-4 w-full rounded-full bg-carissma-500 py-3 text-sm font-bold text-white hover:bg-carissma-600 disabled:opacity-50"
                  >
                    Next
                  </button>
                )}
              </>
            ) : (
              <>
                <StickerHeading as="h2" className="mb-4 text-center text-xl">
                  Games
                </StickerHeading>
                <GamesBoard board={session.board || []} onPick={onPick} canPick={isMyTurn && session.status === 'active'} />
              </>
            )}
          </div>

          <div className="flex justify-center lg:justify-end">
            {session.participants?.[1] && (
              <ParticipantPanel
                participant={session.participants[1]}
                isMe={myParticipant?.id === session.participants[1].id}
                isCurrentTurn={session.currentTurnParticipantId === session.participants[1].id}
                isHost={isHost}
                usedLifelines={myParticipant?.id === session.participants[1].id ? usedLifelines : []}
                canAct={isMyTurn && Boolean(session.currentQuestion) && !awaitingScan}
                onLifeline={onLifeline}
                onAdjustScore={onAdjustScore}
              />
            )}
          </div>
        </div>

        {session.participants?.length > 2 && (
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            {session.participants.slice(2).map((p) => (
              <ParticipantPanel
                key={p.id}
                participant={p}
                isMe={myParticipant?.id === p.id}
                isCurrentTurn={session.currentTurnParticipantId === p.id}
                isHost={isHost}
                usedLifelines={myParticipant?.id === p.id ? usedLifelines : []}
                canAct={isMyTurn && Boolean(session.currentQuestion) && !awaitingScan}
                onLifeline={onLifeline}
                onAdjustScore={onAdjustScore}
              />
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
              {JSON.parse(friendRequest.question.options_json_en || '[]').map((opt, i) => (
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

      <button className="fixed bottom-6 end-6 flex h-14 w-14 items-center justify-center rounded-full bg-carissma-500 text-white shadow-lg hover:bg-carissma-600">
        <ChatBubbleIcon className="h-6 w-6" />
      </button>
    </div>
  );
}
