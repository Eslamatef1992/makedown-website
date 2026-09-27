import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PlayModalLayout, { PlayCard } from './components/PlayModalLayout';
import StickerHeading from '../../components/ui/StickerHeading';
import { CheckIcon } from '../../components/ui/icons';
import { scanQuestion } from '../../api/play.api';

// The play API's question/options payload ultimately comes from MySQL's
// JSON-typed options_json_en/options_json_ar columns, which the backend
// may hand back already deserialized into a real array — guard for a
// plain JSON string too so this never crashes either way (same helper as
// LiveGamePage.jsx).
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

// Target of the in-game "Scan QR Code To Start Playing" question — opened on
// a second device (usually the player's own phone) by scanning the code
// shown on the shared host screen. Deliberately has NO login requirement:
// the scan token embedded in the URL/QR image is the only credential needed
// (see play.repository.js's scanQuestion and play.routes.js, where this
// route is registered ahead of requireAuth on purpose). Flow: scan ->
// question shows immediately (no separate "Scanned!" confirmation step) ->
// tapping Next reveals the single answer a QR-gated question carries (see
// quizzes.controller.js's addQuestion, where a qr question always has
// exactly one option: the answer title).
export default function ScanConfirmPage() {
  const { sessionId, token } = useParams();
  const { t, i18n } = useTranslation();
  const [state, setState] = useState('scanning'); // 'scanning' | 'question' | 'error'
  const [question, setQuestion] = useState(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    scanQuestion(sessionId, token)
      .then((result) => {
        setQuestion(result.question || null);
        setState('question');
      })
      .catch(() => setState('error'));
  }, [sessionId, token]);

  const isAr = i18n.language?.startsWith('ar');
  const questionText = question && ((isAr && question.question_text_ar) || question.question_text_en);
  const answerOptions = question ? parseOptions((isAr && question.options_json_ar) || question.options_json_en) : [];
  const answerText = answerOptions[0] || '';

  return (
    <PlayModalLayout>
      <PlayCard>
        {state === 'question' ? (
          <>
            <StickerHeading as="h2" className="text-2xl">
              {questionText}
            </StickerHeading>
            {revealed ? (
              <>
                <span className="mx-auto mt-4 flex h-14 w-14 items-center justify-center rounded-full bg-carissma-500 text-white">
                  <CheckIcon className="h-7 w-7" />
                </span>
                <p className="mt-3 rounded-2xl bg-carissma-50 px-4 py-3 text-base font-extrabold text-espresso-900">{answerText}</p>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setRevealed(true)}
                className="mt-5 w-full rounded-2xl bg-carissma-500 px-4 py-3 text-base font-extrabold text-white transition hover:bg-carissma-600"
              >
                {t('play.scanConfirm.next')}
              </button>
            )}
          </>
        ) : state === 'error' ? (
          <>
            <StickerHeading as="h2" className="text-2xl">
              {t('play.scanConfirm.errorTitle')}
            </StickerHeading>
            <p className="mt-2 text-sm font-medium text-espresso-700">{t('play.scanConfirm.errorBody')}</p>
          </>
        ) : (
          <StickerHeading as="h2" className="text-2xl">
            {t('play.scanConfirm.scanning')}
          </StickerHeading>
        )}
      </PlayCard>
    </PlayModalLayout>
  );
}
