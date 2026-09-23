import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  RefreshIcon, PauseIcon, LiveCallIcon, LiveTapIcon, LiveShuffleIcon,
  UserIcon, PlusIcon, MinusIcon, SpeakerIcon, StarIcon, SparkleIcon,
} from '../../components/ui/icons';
import {
  getGame, pickTile, submitAnswer, submitQrAnswer, revealQuestion as revealQuestionApi, leaveGame,
  applyFiftyFifty, applySkip, callPhoneAFriend as phoneAFriendApi, respondPhoneAFriend, adjustScore,
} from '../../api/play.api';
import { useTranslation } from 'react-i18next';
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
  { key: 'phone_a_friend', icon: LiveCallIcon, labelKey: 'play.live.lifelinePhoneAFriend' },
  { key: 'fifty_fifty', icon: LiveTapIcon, labelKey: 'play.live.lifelineFiftyFifty' },
  { key: 'skip', icon: LiveShuffleIcon, labelKey: 'play.live.lifelineSkip' },
];

function ScoreBlock({ participant, isMe, canAdjust, onAdjustScore, t }) {
  return (
    <div className="flex flex-col items-center">
      <p className="text-sm font-extrabold text-espresso-900">
        {participant.full_name}
        {isMe && ` (${t('play.live.you')})`}
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

function HelpOptionsBlock({ isMe, usedLifelines, canAct, onLifeline, layout = 'row', t }) {
  return (
    <div className="flex flex-col items-center">
      <p
        className="text-sm font-extrabold text-carissma-400"
        style={{ textShadow: '1.5px 0 0 #fff, -1.5px 0 0 #fff, 0 1.5px 0 #fff, 0 -1.5px 0 #fff, 1.5px 1.5px 0 #fff, -1.5px -1.5px 0 #fff, 1.5px -1.5px 0 #fff, -1.5px 1.5px 0 #fff' }}
      >
        {t('play.live.helpOptions')}
      </p>

      <div className={`mt-3 flex items-center gap-3 ${layout === 'column' ? 'flex-col gap-4' : ''}`}>
        {LIFELINES.map(({ key, icon: Icon, labelKey }) => {
          const used = usedLifelines.includes(key);
          const active = isMe && canAct && !used;
          return (
            <button
              key={key}
              disabled={!active}
              onClick={() => onLifeline(key)}
              aria-label={t(labelKey)}
              title={t(labelKey)}
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
    <div className="flex h-12 w-full max-w-full items-center gap-1.5 rounded-full bg-carissma-400 px-4">
      <span className="min-w-0 flex-1 truncate text-base font-medium text-carissma-50">{participant.full_name}:</span>
      <span className="flex-none text-2xl font-semibold text-carissma-50">{participant.score}</span>
    </div>
  );
}

function QuestionSidebar({ participant, isMe, usedLifelines, canAct, onLifeline, t }) {
  return (
    <div className="flex w-[177px] flex-none flex-col items-center gap-4 rounded-[2rem] bg-carissma-100 px-6 py-8 lg:h-[418px]">
      <ScorePill participant={participant} />
      <HelpOptionsBlock isMe={isMe} usedLifelines={usedLifelines} canAct={canAct} onLifeline={onLifeline} layout="column" t={t} />
    </div>
  );
}

function QuestionCard({
  question, awaitingScan, scanQrDataUrl, scanUrl, selected, onSelect, hiddenOptions,
  audioEnded, onAudioEnded, onReveal, submitting, t, i18n,
}) {
  // Question bank content is bilingual per-row (question_text_en/_ar,
  // options_json_en/_ar) — show the row's Arabic content when the site is
  // in Arabic, falling back to English if a question has no Arabic text yet.
  const isAr = i18n.language?.startsWith('ar');
  const questionText = (isAr && question.question_text_ar) || question.question_text_en;
  const options = useMemo(
    () => parseOptions((isAr && question.options_json_ar) || question.options_json_en),
    [question, isAr]
  );
  const letters = ['A', 'B', 'C', 'D', 'E', 'F'];

  if (question.question_type === 'qr') {
    return (
      <div className="rounded-3xl bg-carissma-50 p-8 text-center">
        {awaitingScan ? (
          <>
            {/* The actual question text stays hidden on this screen until the
                code is scanned — before that, this is just a "scan to
                reveal" prompt, not the question itself. */}
            <p className="text-lg font-extrabold text-espresso-900">{t('play.live.scanQrCodeLabel')}</p>
            {scanQrDataUrl ? (
              <img src={scanQrDataUrl} alt={t('play.live.scanToReveal')} className="mx-auto mt-6 h-48 w-48 rounded-2xl border-4 border-white" />
            ) : (
              <p className="mt-6 text-sm text-espresso-500">{t('play.live.generatingCode')}</p>
            )}
            <p className="mt-4 text-xs text-espresso-500">{t('play.live.scanHint')}</p>
            {/* No second device handy (or just testing)? This confirms the
                same scan token the QR code itself carries — it can be
                clicked as many times as needed for this same question
                (scanQuestion has no single-use guard), it just opens in a
                new tab so the host's own screen stays put and picks up the
                reveal live over the socket, same as a real scan would. */}
            {scanUrl && (
              <a
                href={scanUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-block w-full max-w-xs rounded-xl bg-carissma-400 py-3 text-base font-bold text-espresso-50 hover:bg-carissma-500"
              >
                {t('play.live.openScanLink')}
              </a>
            )}
          </>
        ) : (
          // No multiple-choice options for this type — just the question
          // text and the one answer title the admin entered, both revealed
          // together once scanned. The host judges the player's real answer
          // against it in person and picks the winner via the "Who Is
          // Answer?" step that appears below after tapping Next.
          <>
            <p className="text-lg font-extrabold text-espresso-900">{questionText}</p>
            {options[0] && (
              <div className="mx-auto mt-6 max-w-sm rounded-2xl bg-white px-6 py-4">
                <p className="text-base font-extrabold text-carissma-600">{options[0]}</p>
              </div>
            )}
            <p className="mt-4 text-xs text-espresso-500">{t('play.live.qrScannedHint')}</p>
          </>
        )}
      </div>
    );
  }

  // Audio questions are gated the same way QR ones are (see the backend's
  // GATED_QUESTION_TYPES) — but there's no code to scan, so while
  // awaitingScan is true this shows just the clip, not the question text or
  // any options. Next only appears once the clip has actually finished
  // playing, and tapping it (onReveal) is what reveals the question/options
  // and starts the timer.
  if (question.question_type === 'audio' && awaitingScan) {
    return (
      <div className="rounded-3xl bg-carissma-50 p-8 text-center">
        <p className="text-lg font-extrabold text-espresso-900">{t('play.live.listenPrompt')}</p>
        <div className="mx-auto mt-6 flex max-w-md items-center gap-3 rounded-full bg-white px-4 py-3">
          <SpeakerIcon className="h-5 w-5 flex-none text-espresso-700" />
          <audio controls src={question.media_url} className="h-9 w-full" onEnded={onAudioEnded} />
        </div>
        {audioEnded && (
          <button
            onClick={onReveal}
            disabled={submitting}
            className="mx-auto mt-6 block w-full max-w-xs rounded-xl bg-carissma-400 py-3 text-base font-bold text-espresso-50 hover:bg-carissma-500 disabled:opacity-50"
          >
            {t('play.live.next')}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="relative pt-9 sm:pt-10">
      <div className="absolute start-1/2 top-0 z-10 flex h-9 max-w-[88%] -translate-x-1/2 items-center justify-center rounded-t-2xl bg-carissma-100 px-8 sm:h-10 sm:px-14">
        <p className="truncate text-center text-base font-extrabold text-espresso-900 sm:text-lg">{questionText}</p>
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

        {/* Audio has no player here — this branch only renders for an audio
            question once it's already been revealed, and the clip was
            already played in full during the pre-reveal listening step
            above. Showing it again here would look like a second, unplayed
            clip alongside the question/answers, which isn't the flow: the
            player listens once, then answers from memory. */}

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

// QR-gated questions have no options at all — once the QR code is scanned
// and the host taps Next, this replaces the (nonexistent) answer choices:
// the host picks whichever participant actually answered correctly in
// person, or "No one", and that single judgment settles the tile. `value`
// is a participant id, the string 'none', or undefined (nothing chosen yet).
function WhoAnsweredPanel({ participants, value, onChange, onConfirm, submitting, t }) {
  const active = (participants || []).filter((p) => !p.left_at);
  return (
    <div className="mt-4 rounded-3xl bg-carissma-50 p-6 text-center">
      <p className="mb-3 text-base font-extrabold text-espresso-900">{t('play.live.whoAnswered')}</p>
      <div className="mx-auto flex max-w-xs flex-col gap-2">
        {active.map((p) => (
          <label key={p.id} className="flex cursor-pointer items-center gap-2.5 rounded-full bg-white px-4 py-2.5 text-start">
            <input type="radio" name="qrWinner" checked={value === p.id} onChange={() => onChange(p.id)} className="h-4 w-4 accent-carissma-500" />
            <span className="text-sm font-bold text-espresso-800">{p.full_name || p.guest_name || t('play.live.player')}</span>
          </label>
        ))}
        <label className="flex cursor-pointer items-center gap-2.5 rounded-full bg-white px-4 py-2.5 text-start">
          <input type="radio" name="qrWinner" checked={value === 'none'} onChange={() => onChange('none')} className="h-4 w-4 accent-carissma-500" />
          <span className="text-sm font-bold text-espresso-800">{t('play.live.noOneAnswered')}</span>
        </label>
      </div>
      <button
        onClick={onConfirm}
        disabled={value === undefined || submitting}
        className="mt-4 w-full rounded-xl bg-carissma-400 py-3.5 text-base font-bold text-espresso-50 hover:bg-carissma-500 disabled:opacity-50"
      >
        {t('play.live.confirm')}
      </button>
    </div>
  );
}

// Matches the reference card exactly: a rounded card whose top edge has a
// notch cut into it (the category title sits directly in that notch, no
// separate label box) and two columns of bordered, overlapping point pills
// flanking a center image square. Traced from the supplied Figma export
// (viewBox 379x302) rather than approximated, so the notch curve and pill
// proportions match pixel-for-pixel; colors are the exact values sampled
// from that file, which turned out to already be this app's own carissma
// palette (50/100/200/400) end to end.
const CATEGORY_CARD_PATH =
  'M111.138 3H266.554C277.962 3.00007 288.311 9.68938 292.996 20.0918L303.773 44.0225C305.55 47.9682 309.475 50.5058 313.803 50.5059H347C363.016 50.5059 376 63.4896 376 79.5059V270C376 286.016 363.016 299 347 299H32C15.9837 299 3 286.016 3 270V79.5059C3 63.4896 15.9837 50.5059 32 50.5059H66.2139C70.9026 50.5059 75.0762 47.5336 76.6094 43.1025L83.7314 22.5176C87.7734 10.8357 98.7763 3 111.138 3Z';

const TITLE_TEXT_SHADOW =
  '1.5px 0 0 #fff, -1.5px 0 0 #fff, 0 1.5px 0 #fff, 0 -1.5px 0 #fff, 1.5px 1.5px 0 #fff, -1.5px -1.5px 0 #fff, 1.5px -1.5px 0 #fff, -1.5px 1.5px 0 #fff';

// Exact pill geometry traced from the same Figma export, as percentages of
// the 379x302 card. Each pill is a "D" shape — rounded only on the outer
// edge, flat on the inner edge where it tucks behind the image box — not a
// full stadium/pill, and each row is slightly wider than the one above it
// (bleeding further outward) with a small vertical overlap between rows.
// Left/right are mirror images of each other, both anchored so their inner
// (flat) edge sits flush against the image box.
const POINT_PILL_ROWS = [
  { top: 24.5, height: 23.18, width: 17.15 }, // 200
  { top: 44.37, height: 23.18, width: 18.47 }, // 400
  { top: 64.24, height: 23.18, width: 20.58 }, // 600
];
const PILL_INNER_EDGE = 24.01; // % from card left (right column mirrors from card right)
const IMAGE_BOX = { left: 24.01, top: 24.5, width: 51.19, height: 62.91 };

function CategoryCard({ column, onPick, canPick }) {
  const { i18n } = useTranslation();
  // Category/quiz titles are bilingual per-row (title_en/title_ar) — show
  // the site's current language, falling back to English if a category has
  // no Arabic title yet. Previously this always preferred Arabic when both
  // were present, so an English-language session still showed Arabic
  // titles for every bilingual category.
  const isAr = i18n.language?.startsWith('ar');
  const title = (isAr && column.title_ar) || column.title_en;
  const sorted = [...column.questions].sort((a, b) => a.points - b.points);
  // Each game shows exactly 6 tiles — 2 at 200, 2 at 400, 2 at 600 — and each
  // point pair is split one-left/one-right, so both columns read
  // 200 → 400 → 600 top to bottom and mirror each other (rather than an
  // arbitrary first-half/second-half split).
  const left = [];
  const right = [];
  for (let i = 0; i < sorted.length; i += 2) {
    left.push(sorted[i]);
    if (sorted[i + 1]) right.push(sorted[i + 1]);
  }
  const pointPill = (q, i, side) => {
    const row = POINT_PILL_ROWS[i];
    const style =
      side === 'left'
        ? { left: `${PILL_INNER_EDGE - row.width}%`, top: `${row.top}%`, width: `${row.width}%`, height: `${row.height}%`, borderRadius: '9999px 0 0 9999px', textShadow: TITLE_TEXT_SHADOW }
        : { right: `${PILL_INNER_EDGE - row.width}%`, top: `${row.top}%`, width: `${row.width}%`, height: `${row.height}%`, borderRadius: '0 9999px 9999px 0', textShadow: TITLE_TEXT_SHADOW };
    return (
      <button
        key={q.id}
        disabled={q.used || !canPick}
        onClick={() => onPick(q.id)}
        style={style}
        className={`absolute z-0 flex items-center justify-center border-[3px] border-carissma-50 text-sm font-extrabold shadow-sm transition sm:text-base ${
          side === 'left' ? 'justify-start pl-3 sm:pl-4' : 'justify-end pr-3 sm:pr-4'
        } ${q.used ? 'bg-carissma-100 text-carissma-200' : 'bg-carissma-200 text-carissma-400 hover:bg-carissma-300 disabled:opacity-50'}`}
      >
        {q.points}
      </button>
    );
  };

  return (
    <div className="relative w-full" style={{ aspectRatio: '379 / 302' }}>
      <svg viewBox="0 0 379 302" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <path d={CATEGORY_CARD_PATH} fill="#F794B5" fillOpacity="0.08" stroke="#FDEBF0" strokeWidth="6" />
      </svg>

      <div className="absolute inset-x-0 top-0 flex justify-center pt-[3%]">
        <span
          dir={isAr ? 'rtl' : 'ltr'}
          className="max-w-[58%] truncate text-center text-sm font-extrabold text-carissma-400 sm:text-base"
          style={{ textShadow: TITLE_TEXT_SHADOW }}
        >
          {title}
        </span>
      </div>

      {left.map((q, i) => pointPill(q, i, 'left'))}
      {right.map((q, i) => pointPill(q, i, 'right'))}

      <div
        className="absolute z-10 overflow-hidden rounded-2xl border-[3px] border-carissma-50 bg-[#CBE0F3] shadow-sm"
        style={{ left: `${IMAGE_BOX.left}%`, top: `${IMAGE_BOX.top}%`, width: `${IMAGE_BOX.width}%`, height: `${IMAGE_BOX.height}%` }}
      >
        <img src={column.cover_image_url || gameTileDefault} alt="" className="h-full w-full object-cover" />
      </div>
    </div>
  );
}

function GamesBoard({ board, onPick, canPick }) {
  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-3">
      {board.map((column) => (
        <CategoryCard key={column.id} column={column} onPick={onPick} canPick={canPick} />
      ))}
    </div>
  );
}

// Team mode: shown once a tile is fully settled — either one team answered
// it correctly first (a winner, +points) or neither team did ("Everyone
// Lost", +0). Stays up until the host taps Continue, same as the reference
// design's win/lose cards.
function RoundResultModal({ result, onContinue, t }) {
  if (!result) return null;
  const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
  // A QR-gated question has no stored options at all (see resolveQrAnswer),
  // so the server sends correctOptionIndex: null for it — there's no letter
  // to reveal, so skip that line entirely instead of showing a stray "-".
  const hasCorrectOption = result.correctOptionIndex !== null && result.correctOptionIndex !== undefined;
  const letter = letters[result.correctOptionIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="relative w-full max-w-sm overflow-hidden rounded-[2rem] border-[5px] border-carissma-300 bg-white px-6 py-8 text-center shadow-xl">
        <SparkleIcon className="absolute start-6 top-16 h-6 w-6 text-saffron-300" />
        <SparkleIcon className="absolute end-6 top-40 h-5 w-5 text-saffron-300" />

        {result.isWinner ? (
          <>
            <div className="relative mx-auto flex h-20 w-20 items-center justify-center">
              <StarIcon className="absolute -top-3 h-7 w-7 text-saffron-400" />
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-b from-[#8FD8E8] to-[#2E86AB] text-3xl">
                🏆
              </span>
            </div>
            <h2 className="mt-4 text-2xl font-extrabold text-carissma-300">
              {t('play.live.isWinner', { name: result.winnerName })}
            </h2>
          </>
        ) : (
          <h2 className="mt-6 text-2xl font-extrabold text-carissma-300">{t('play.live.everyoneLost')}</h2>
        )}

        {hasCorrectOption && (
          <p className="mt-3 text-base font-bold text-green-600">
            {t('play.live.correctAnswerLabel')} {letter}
          </p>
        )}

        {result.isWinner && (
          <span className="mt-4 inline-block rounded-full bg-gradient-to-r from-saffron-300 to-carnation-400 px-6 py-1.5 text-sm font-extrabold text-white shadow">
            {t('play.live.winBadge')}
          </span>
        )}

        <p className="mt-4 text-sm font-bold text-carissma-300">{t('play.live.pointsLabel')}</p>
        <p className={`mt-1 text-3xl font-extrabold ${result.isWinner ? 'text-carissma-500' : 'text-carissma-300'}`}>
          {result.isWinner ? `+ ${result.points}` : 0}
        </p>

        <button
          onClick={onContinue}
          className="mt-6 w-full rounded-2xl bg-carissma-300 py-3 text-sm font-extrabold text-white hover:bg-carissma-400"
        >
          {t('play.live.continueGame')}
        </button>
      </div>
    </div>
  );
}

export default function LiveGamePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, i18n } = useTranslation();

  const [session, setSession] = useState(null);
  const [awaitingScan, setAwaitingScan] = useState(false);
  const [scanQrDataUrl, setScanQrDataUrl] = useState(null);
  const [scanUrl, setScanUrl] = useState(null);
  const [selected, setSelected] = useState(null);
  const [hiddenOptions, setHiddenOptions] = useState([]);
  // QR-gated questions only: whether the "Who Is Answer?" panel is showing
  // (after Next, in place of the nonexistent multiple-choice options), and
  // who's currently picked in it — a participant id, 'none', or undefined
  // (nothing chosen yet).
  const [qrGrading, setQrGrading] = useState(false);
  const [qrWinner, setQrWinner] = useState(undefined);
  // Audio questions only: whether the clip has finished playing yet — the
  // Next button (which reveals the question/options and starts the timer)
  // only appears once this is true.
  const [audioEnded, setAudioEnded] = useState(false);
  const [usedLifelines, setUsedLifelines] = useState([]);
  const [flash, setFlash] = useState(null); // { isCorrect }
  // Surfaces why a tap on "Next" (or a lifeline) was rejected by the server
  // instead of silently doing nothing — a rejected submit used to just
  // reset the selection with no visible feedback, which looked exactly
  // like the option picker was broken.
  const [actionError, setActionError] = useState('');
  // Team mode only: set once a tile is fully settled (both teams have had
  // their answer) — { isWinner, winnerName, correctOptionIndex, points }.
  const [roundResult, setRoundResult] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [friendRequest, setFriendRequest] = useState(null);
  const [friendHint, setFriendHint] = useState(null);
  const [phonePickerFor, setPhonePickerFor] = useState(false);
  // The question the turn just resolved on (timeout or a real answer) —
  // kept on screen for the same ~2.5s the result flash shows, instead of
  // instantly snapping to the board the moment the counter hits zero /
  // the server clears currentQuestion. See offResult below.
  const [lockedQuestion, setLockedQuestion] = useState(null);
  // Guards every turn-ending action (submit answer, audio reveal, QR grade)
  // against a rapid double-tap firing the request twice before the first
  // one's response comes back — on a shared touchscreen device a fast
  // second tap was reaching the server while the first was still in
  // flight, and in team mode the second copy of the same answer looked to
  // the backend like the *other* team's turn, settling the tile on the
  // spot instead of handing it off (see resolveTurn's priorAnswer check).
  const [submitting, setSubmitting] = useState(false);
  const tickRef = useRef(null);
  const sessionRef = useRef(null);

  const refresh = useCallback(() => getGame(id).then(setSession).catch(() => {}), [id]);

  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

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
          setQrGrading(false);
          setQrWinner(undefined);
          setAudioEnded(false);
          setSubmitting(false);
        }
      }
    });
    const offTile = onGameEvent('game:tile_picked', (payload) => {
      if (payload.sessionId !== Number(id)) return;
      setSelected(null);
      setHiddenOptions([]);
      setUsedLifelines([]);
      setFlash(null);
      setActionError('');
      setRoundResult(null);
      setLockedQuestion(null);
      setAwaitingScan(payload.awaitingScan);
      setScanQrDataUrl(payload.scanQrDataUrl || null);
      setScanUrl(payload.scanUrl || null);
      setQrGrading(false);
      setQrWinner(undefined);
      setAudioEnded(false);
      setSubmitting(false);
      refresh();
    });
    const offRevealed = onGameEvent('game:question_revealed', (payload) => {
      if (payload.sessionId !== Number(id)) return;
      setAwaitingScan(false);
      refresh();
    });
    // Team mode: the same question just got handed to the other team
    // instead of the tile ending — reset the answer UI (including per-turn
    // lifeline availability, since it's a different participant's own
    // budget) without touching the board/flash flow.
    const offNextTeam = onGameEvent('game:next_team_turn', (payload) => {
      if (payload.sessionId !== Number(id)) return;
      setSelected(null);
      setHiddenOptions([]);
      setUsedLifelines([]);
      setFlash(null);
      setActionError('');
      setLockedQuestion(null);
      setAwaitingScan(payload.awaitingScan);
      setScanQrDataUrl(payload.scanQrDataUrl || null);
      setScanUrl(payload.scanUrl || null);
      setQrGrading(false);
      setQrWinner(undefined);
      setAudioEnded(false);
      setSubmitting(false);
      refresh();
    });
    const offResult = onGameEvent('game:answer_result', (payload) => {
      if (payload.sessionId !== Number(id)) return;
      const isTeam = sessionRef.current?.mode === 'team';
      // Team mode's first-team answer isn't the tile's outcome yet — the
      // same question is on its way to the other team (game:next_team_turn
      // handles that transition), so there's nothing to reveal here.
      if (isTeam && payload.roundComplete === false) return;

      // Freeze the question that was just resolved on screen — this event
      // fires right before game:state clears session.currentQuestion, so
      // sessionRef still holds the outgoing question at this instant. This
      // covers both a real submit and a server-side timeout (counter
      // hitting zero), so the board never yanks into view mid-reveal.
      setLockedQuestion(sessionRef.current?.currentQuestion || null);

      if (isTeam) {
        setRoundResult({
          isWinner: Boolean(payload.winnerParticipantId),
          winnerName: payload.winnerName,
          correctOptionIndex: payload.correctOptionIndex,
          points: payload.points,
        });
        return;
      }

      setFlash({ isCorrect: payload.isCorrect });
      setTimeout(() => {
        setFlash(null);
        setLockedQuestion(null);
      }, 2500);
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
    // Keeps a +/- score adjustment in sync even if it happened from another
    // tab/device on the same session — the host's own tap already triggers
    // its own refresh() in onAdjustScore, but nothing was listening for this
    // event at all before, so a second connected client would never see it.
    const offScoreAdjusted = onGameEvent('game:score_adjusted', (payload) => {
      if (payload.sessionId === Number(id)) refresh();
    });

    return () => {
      leaveRoom();
      offState(); offTile(); offRevealed(); offNextTeam(); offResult(); offEnded(); offLifelineReq(); offLifelineRes(); offScoreAdjusted();
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
  // Falls back to the just-resolved (locked) question so the category label
  // stays put during the brief reveal window instead of blanking out.
  const displayedQuestion = session?.currentQuestion || lockedQuestion;
  const currentCategory = useMemo(() => {
    if (!displayedQuestion || !session?.board) return null;
    return session.board.find((c) => (c.questions || []).some((q) => q.id === displayedQuestion.id)) || null;
  }, [session, displayedQuestion]);
  const isHost = session && user && session.host_user_id === user.id;
  const isMyTurn = session && myParticipant && session.currentTurnParticipantId === myParticipant.id;
  // Every website game is played pass-the-device style: only the host logs
  // in, and runs this one shared screen on behalf of every named teammate
  // (who has no account of their own) — mirrors the backend's
  // resolveActingParticipant. Without this, nobody but the host could ever
  // take a turn: picking a tile, answering, or using a lifeline would be
  // silently rejected the moment it became a teammate's or the other
  // team's turn, since their id never matches the logged-in host's.
  const canAct = Boolean(isMyTurn || isHost) && session?.status === 'active';
  const currentTurnParticipant = session?.participants?.find((p) => p.id === session.currentTurnParticipantId);

  const onPick = async (questionId) => {
    try {
      await pickTile(id, questionId);
    } catch {
      refresh();
    }
  };

  const onSubmit = async () => {
    if (selected === null || !session?.currentQuestion || submitting) return;
    setActionError('');
    setSubmitting(true);
    try {
      await submitAnswer(id, session.currentQuestion.id, selected);
    } catch (err) {
      setActionError(err.response?.data?.message || t('common.somethingWentWrong'));
      refresh();
    } finally {
      setSelected(null);
      setSubmitting(false);
    }
  };

  // QR-gated questions: the host has picked who answered correctly (or
  // "No one") in the WhoAnsweredPanel — award it directly instead of
  // comparing a selected option to a correct-answer index (there isn't one).
  const onQrSubmit = async () => {
    if (qrWinner === undefined || !session?.currentQuestion || submitting) return;
    setActionError('');
    setSubmitting(true);
    try {
      await submitQrAnswer(id, session.currentQuestion.id, qrWinner === 'none' ? null : qrWinner);
    } catch (err) {
      setActionError(err.response?.data?.message || t('common.somethingWentWrong'));
      refresh();
    } finally {
      setQrGrading(false);
      setQrWinner(undefined);
      setSubmitting(false);
    }
  };

  // Audio questions: the clip finished and the host tapped Next — reveal the
  // question/options and start the timer. The socket's game:question_revealed
  // handler (offRevealed, shared with the QR scan flow) is what actually
  // flips awaitingScan off once the server confirms it.
  const onAudioReveal = async () => {
    if (!session?.currentQuestion || submitting) return;
    setActionError('');
    setSubmitting(true);
    try {
      await revealQuestionApi(id);
    } catch (err) {
      setActionError(err.response?.data?.message || t('common.somethingWentWrong'));
      refresh();
    } finally {
      setSubmitting(false);
    }
  };

  const onLifeline = async (key) => {
    if (!session?.currentQuestion) return;
    const questionId = session.currentQuestion.id;
    setActionError('');
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
    } catch (err) {
      setActionError(err.response?.data?.message || t('common.somethingWentWrong'));
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
    setActionError('');
    try {
      await adjustScore(id, participantId, delta);
      // The score genuinely does change on the server here — but unlike
      // every other action on this page, nothing ever re-fetched the
      // session after a successful call (no local update, and no
      // game:score_adjusted socket listener either), so the +/- buttons
      // looked completely dead even though they were working. This is what
      // was actually missing.
      refresh();
    } catch (err) {
      setActionError(err.response?.data?.message || t('common.somethingWentWrong'));
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
    return <div className="flex min-h-screen items-center justify-center text-espresso-500">{t('play.live.loading')}</div>;
  }

  // Every website game is two teams (see CategorySelectPage) and game_teams
  // always has exactly two rows for a team session from the moment it's
  // created — regardless of whether any guest has actually joined a team
  // yet. The left/right panels below must always reflect those two teams
  // (their real name and running score), not just the first two people who
  // happen to be in game_participants, or a team with no players yet
  // silently disappears from the screen instead of showing 0 points.
  const isTeamMode = session.mode === 'team' && (session.teams?.length || 0) >= 2;
  const leftTeam = isTeamMode ? session.teams[0] : null;
  const rightTeam = isTeamMode ? session.teams[1] : null;
  const leftTeamMembers = isTeamMode ? session.participants.filter((p) => p.team_id === leftTeam.id) : [];
  const rightTeamMembers = isTeamMode ? session.participants.filter((p) => p.team_id === rightTeam.id) : [];

  // A representative member is only needed to attribute a host score
  // adjustment (adjustScore acts on a participant row) — the name/score
  // shown always comes from the team itself, not from that member.
  const leftEntity = isTeamMode
    ? { id: leftTeamMembers[0]?.id ?? null, full_name: leftTeam.name, score: leftTeam.score }
    : session.participants?.[0] || null;
  const rightEntity = isTeamMode
    ? { id: rightTeamMembers[0]?.id ?? null, full_name: rightTeam.name, score: rightTeam.score }
    : session.participants?.[1] || null;

  // leftIsMe/rightIsMe: which side the logged-in host's own account sits on
  // (always the left/team1 side) — used only for the cosmetic "(you)" label.
  const leftIsMe = isTeamMode
    ? myParticipant?.team_id === leftTeam.id
    : myParticipant?.id === session.participants?.[0]?.id;
  const rightIsMe = isTeamMode
    ? myParticipant?.team_id === rightTeam.id
    : myParticipant?.id === session.participants?.[1]?.id;

  // leftTurnActive/rightTurnActive: which side's turn it actually is right
  // now — this, not host identity, is what should light up a side's Help
  // Options. Team 2 never has the host's own identity, so gating lifeline
  // buttons on leftIsMe/rightIsMe would leave team 2's buttons permanently
  // disabled even on their own turn.
  const leftTurnActive = isTeamMode
    ? leftTeamMembers.some((p) => p.id === session.currentTurnParticipantId)
    : session.participants?.[0]?.id === session.currentTurnParticipantId;
  const rightTurnActive = isTeamMode
    ? rightTeamMembers.some((p) => p.id === session.currentTurnParticipantId)
    : session.participants?.[1]?.id === session.currentTurnParticipantId;

  // The turn banner announces whichever TEAM currently holds the turn, not
  // the individual teammate acting it out — "It's Lina's turn" reads like
  // a specific person is expected to respond, when really it's whoever's
  // sitting at the shared screen for that team's turn.
  const turnDisplayName = isTeamMode
    ? (leftTurnActive && leftTeam.name) || (rightTurnActive && rightTeam.name) || currentTurnParticipant?.full_name
    : currentTurnParticipant?.full_name;

  return (
    <div className="min-h-screen bg-carissma-50/50 px-4 py-6">
      <div className="mx-auto max-w-[1400px] rounded-[1.5rem] border-[6px] border-carissma-400 bg-carissma-50 p-4 shadow-lg sm:p-6">
        {/* Header */}
        <div className="flex items-center justify-between rounded-3xl bg-gradient-to-r from-carissma-50 via-carissma-400 to-carissma-300 px-5 py-3">
          <img src="/logo-mark.png" alt="Make Down" className="h-12 w-12 flex-none object-contain" />
          <h1 className="text-lg font-extrabold text-white sm:text-xl">
            {session.title || t('play.live.liveGame')}
          </h1>
          <button onClick={onLeave} className="rounded-xl bg-carissma-100 px-5 py-2 text-xs font-extrabold text-carissma-400 hover:bg-carissma-200">
            {t('play.live.leaveGame')}
          </button>
        </div>

        {/* Turn indicator + logo mark */}
        <div className="mt-4 flex items-center justify-between rounded-3xl bg-carissma-100 px-5 py-4">
          <span className="inline-flex min-w-0 max-w-[60%] items-center truncate rounded-s-full rounded-se-[1.75rem] bg-carissma-400 px-6 py-2.5 text-sm font-bold text-white sm:max-w-[70%]">
            {turnDisplayName ? (
              <>{t('play.live.turnPrefix')}&nbsp;<span className="font-extrabold">{turnDisplayName}</span>{t('play.live.turnSuffix')}</>
            ) : t('play.live.waitingForNextTurn')}
          </span>
          <img src="/logo-mark.png" alt="Make Down" className="h-16 w-16 object-contain" />
          <span className="w-24" />
        </div>

        {flash && (
          <div className={`mt-3 rounded-2xl px-4 py-2 text-center text-sm font-extrabold ${flash.isCorrect ? 'bg-green-100 text-green-700' : 'bg-carnation-100 text-carnation-700'}`}>
            {flash.isCorrect ? t('play.live.correct') : t('play.live.notQuite')}
          </div>
        )}
        {actionError && (
          <div className="mt-3 rounded-2xl bg-carnation-100 px-4 py-2 text-center text-sm font-extrabold text-carnation-700">
            {actionError}
            <button onClick={() => setActionError('')} className="ms-3 underline">{t('play.live.dismiss')}</button>
          </div>
        )}
        {friendHint !== null && (
          <div className="mt-3 rounded-2xl bg-saffron-100 px-4 py-2 text-center text-sm font-bold text-saffron-700">
            {t('play.live.friendSuggests', { letter: ['A', 'B', 'C', 'D'][friendHint] })}
            <button onClick={() => setFriendHint(null)} className="ms-3 underline">{t('play.live.dismiss')}</button>
          </div>
        )}

        {/* Games content: a question in progress uses left/right participant
            sidebars flanking the question card; the board-select screen uses
            a single-column board with a full-width Help Options bar below. */}
        <div className="mt-6">
          {displayedQuestion ? (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[176px_1fr_176px] lg:items-start">
              <div className="flex justify-center lg:justify-start">
                {leftEntity && (
                  <QuestionSidebar
                    participant={leftEntity}
                    isMe={leftTurnActive}
                    usedLifelines={leftTurnActive ? usedLifelines : []}
                    canAct={canAct && Boolean(session.currentQuestion) && !awaitingScan}
                    onLifeline={onLifeline}
                    t={t}
                  />
                )}
              </div>

              <div>
                <div>
                  <div className="text-center">
                    {currentCategory && (
                      <p
                        dir={i18n.language?.startsWith('ar') ? 'rtl' : 'ltr'}
                        className="text-sm font-bold text-carissma-500"
                      >
                        {(i18n.language?.startsWith('ar') && currentCategory.title_ar) || currentCategory.title_en}
                      </p>
                    )}
                    {timeLeft !== null && (
                      <div className="mt-2">
                        <p className="text-sm font-bold text-espresso-800">{t('play.live.remainingTime')}</p>
                        <span className="mt-1 inline-flex items-center gap-2 rounded-full bg-carissma-500 px-4 py-1.5 text-xs font-bold text-white">
                          <RefreshIcon className="h-4 w-4" /> {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')} S <PauseIcon className="h-4 w-4" />
                        </span>
                      </div>
                    )}
                  </div>
                  <p className="relative z-10 mt-3 flex items-center gap-1 text-sm font-bold text-espresso-900">
                    <span aria-hidden="true">⭐</span> {displayedQuestion.points} {t('play.live.pointsSuffix')}
                  </p>
                </div>
                <QuestionCard
                  question={displayedQuestion}
                  awaitingScan={awaitingScan}
                  scanQrDataUrl={scanQrDataUrl}
                  scanUrl={scanUrl}
                  selected={selected}
                  onSelect={session.currentQuestion && canAct ? setSelected : () => {}}
                  hiddenOptions={hiddenOptions}
                  audioEnded={audioEnded}
                  onAudioEnded={() => setAudioEnded(true)}
                  onReveal={canAct ? onAudioReveal : () => {}}
                  submitting={submitting}
                  t={t}
                  i18n={i18n}
                />
              </div>

              <div className="flex justify-center lg:justify-end">
                {rightEntity && (
                  <QuestionSidebar
                    participant={rightEntity}
                    isMe={rightTurnActive}
                    usedLifelines={rightTurnActive ? usedLifelines : []}
                    canAct={canAct && Boolean(session.currentQuestion) && !awaitingScan}
                    onLifeline={onLifeline}
                    t={t}
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
                {t('play.live.games')}
              </p>
              <GamesBoard board={session.board || []} onPick={onPick} canPick={canAct} />
            </>
          )}
        </div>

        {session.currentQuestion && canAct && !awaitingScan && (
          session.currentQuestion.question_type === 'qr' ? (
            qrGrading ? (
              <WhoAnsweredPanel
                participants={session.participants}
                value={qrWinner}
                onChange={setQrWinner}
                onConfirm={onQrSubmit}
                submitting={submitting}
                t={t}
              />
            ) : (
              <button
                onClick={() => setQrGrading(true)}
                className="mt-4 w-full rounded-xl bg-carissma-400 py-3.5 text-base font-bold text-espresso-50 hover:bg-carissma-500"
              >
                {t('play.live.next')}
              </button>
            )
          ) : (
            <button
              onClick={onSubmit}
              disabled={selected === null || submitting}
              className="mt-4 w-full rounded-xl bg-carissma-400 py-3.5 text-base font-bold text-espresso-50 hover:bg-carissma-500 disabled:opacity-50"
            >
              {t('play.live.next')}
            </button>
          )
        )}

        {/* Help Options bar: board-select screen only (the question screen uses
            the left/right sidebars above instead). In team mode both sides
            always render — a team's name and score come from game_teams,
            not from whether anyone has joined it yet — so the second team
            is never silently missing. Score adjustment is only offered when
            there's an actual player on that team to attribute it to. */}
        {!displayedQuestion && (isTeamMode || (session.participants?.length >= 1)) && (
          <div className="mt-6 flex flex-col items-center gap-6 rounded-3xl bg-carissma-100 px-3 py-5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-x-10 sm:px-6">
            {leftEntity && (
              <div className="flex flex-wrap items-center justify-center gap-4 sm:flex-nowrap sm:gap-8">
                <ScoreBlock
                  participant={leftEntity}
                  isMe={leftIsMe}
                  canAdjust={isHost && Boolean(leftEntity.id)}
                  onAdjustScore={onAdjustScore}
                  t={t}
                />
                <HelpOptionsBlock
                  isMe={leftIsMe}
                  usedLifelines={leftIsMe ? usedLifelines : []}
                  canAct={canAct && Boolean(session.currentQuestion) && !awaitingScan}
                  onLifeline={onLifeline}
                  t={t}
                />
              </div>
            )}

            {rightEntity && (
              <div className="flex flex-wrap items-center justify-center gap-4 sm:flex-nowrap sm:gap-8">
                <HelpOptionsBlock
                  isMe={rightIsMe}
                  usedLifelines={rightIsMe ? usedLifelines : []}
                  canAct={canAct && Boolean(session.currentQuestion) && !awaitingScan}
                  onLifeline={onLifeline}
                  t={t}
                />
                <ScoreBlock
                  participant={rightEntity}
                  isMe={rightIsMe}
                  canAdjust={isHost && Boolean(rightEntity.id)}
                  onAdjustScore={onAdjustScore}
                  t={t}
                />
              </div>
            )}
          </div>
        )}

        {/* Extra (3rd+) individual panels only apply outside team mode —
            in team mode every participant is already represented inside
            their team's single panel above. */}
        {!isTeamMode && !displayedQuestion && session.participants?.length > 2 && (
          <div className="mt-4 flex flex-wrap justify-center gap-4">
            {session.participants.slice(2).map((p) => (
              <div key={p.id} className="flex flex-wrap items-center justify-center gap-4 rounded-3xl bg-carissma-100 px-4 py-5 sm:flex-nowrap sm:gap-8 sm:px-6">
                <ScoreBlock
                  participant={p}
                  isMe={myParticipant?.id === p.id}
                  canAdjust={isHost}
                  onAdjustScore={onAdjustScore}
                  t={t}
                />
                <HelpOptionsBlock
                  isMe={myParticipant?.id === p.id}
                  usedLifelines={myParticipant?.id === p.id ? usedLifelines : []}
                  canAct={canAct && Boolean(session.currentQuestion) && !awaitingScan}
                  onLifeline={onLifeline}
                  t={t}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <RoundResultModal
        result={roundResult}
        onContinue={() => {
          setRoundResult(null);
          // The resolved tile's question was kept on screen behind the modal
          // (see offResult's setLockedQuestion) so the reveal didn't yank
          // straight to the board mid-popup — but nothing ever cleared it
          // for team mode once the modal closed, since a real submit's
          // flash/lockedQuestion reset only runs for solo/random. Without
          // this, "Continue Game" just hid the popup and left the same old
          // question card on screen instead of returning to tile selection.
          setLockedQuestion(null);
        }}
        t={t}
      />

      {/* Phone-a-friend: pick who to call */}
      {phonePickerFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 text-center">
            <h3 className="text-lg font-extrabold text-espresso-900">{t('play.live.phoneAFriendTitle')}</h3>
            <p className="mt-1 text-sm text-espresso-600">{t('play.live.phoneAFriendBody')}</p>
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
            <button onClick={() => setPhonePickerFor(false)} className="mt-4 text-sm font-bold text-carissma-600 underline">{t('common.cancel')}</button>
          </div>
        </div>
      )}

      {/* Incoming phone-a-friend request */}
      {friendRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 text-center">
            <h3 className="text-lg font-extrabold text-espresso-900">{t('play.live.friendNeedsHelp')}</h3>
            <p className="mt-2 text-sm font-bold text-espresso-900">
              {(i18n.language?.startsWith('ar') && friendRequest.question.question_text_ar) || friendRequest.question.question_text_en}
            </p>
            <div className="mt-3 space-y-2">
              {parseOptions((i18n.language?.startsWith('ar') && friendRequest.question.options_json_ar) || friendRequest.question.options_json_en).map((opt, i) => (
                <button
                  key={i}
                  onClick={() => respondToFriend(i)}
                  className="flex w-full items-center gap-2 rounded-2xl bg-carissma-50 px-3 py-2 text-start text-sm font-bold text-espresso-900 hover:bg-carissma-100"
                >
                  {['A', 'B', 'C', 'D'][i]}. {opt}
                </button>
              ))}
            </div>
            <button onClick={() => setFriendRequest(null)} className="mt-4 text-sm font-bold text-carissma-600 underline">{t('play.live.ignore')}</button>
          </div>
        </div>
      )}
    </div>
  );
}
