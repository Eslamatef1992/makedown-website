import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PlayModalLayout, { PlayCard } from './components/PlayModalLayout';
import StickerHeading from '../../components/ui/StickerHeading';
import { CheckIcon } from '../../components/ui/icons';
import { scanQuestion } from '../../api/play.api';

// Target of the in-game "Scan QR Code To Start Playing" question — usually
// opened on a second device (the player's phone) by scanning the code shown
// on the live game screen. Confirms the scan; the main screen picks up the
// question reveal live over Socket.io.
export default function ScanConfirmPage() {
  const { sessionId, token } = useParams();
  const { t } = useTranslation();
  const [state, setState] = useState('scanning'); // 'scanning' | 'done' | 'error'

  useEffect(() => {
    scanQuestion(sessionId, token)
      .then(() => setState('done'))
      .catch(() => setState('error'));
  }, [sessionId, token]);

  return (
    <PlayModalLayout>
      <PlayCard>
        {state === 'done' ? (
          <>
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-carissma-500 text-white">
              <CheckIcon className="h-7 w-7" />
            </span>
            <StickerHeading as="h2" className="mt-4 text-2xl">
              {t('play.scanConfirm.scanned')}
            </StickerHeading>
            <p className="mt-2 text-sm font-medium text-espresso-700">{t('play.scanConfirm.scannedBody')}</p>
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
