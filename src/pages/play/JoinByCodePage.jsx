import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PlayModalLayout, { PlayCard } from './components/PlayModalLayout';
import StickerHeading from '../../components/ui/StickerHeading';
import Button from '../../components/ui/Button';
import { useTranslation } from 'react-i18next';
import TextField from '../../components/ui/TextField';
import FreeGameOverScreen from '../../components/play/FreeGameOverScreen';
import { joinGameByCode } from '../../api/play.api';

export default function JoinByCodePage() {
  const { mode } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [noFreeGame, setNoFreeGame] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;
    setError('');
    setLoading(true);
    try {
      const session = await joinGameByCode(code.trim());
      navigate(`/play/sessions/${session.id}/lobby`);
    } catch (err) {
      if (err.response?.status === 402) {
        setNoFreeGame(true);
      } else {
        setError(err.response?.data?.message || t('play.joinByCode.notFound'));
      }
    } finally {
      setLoading(false);
    }
  };

  if (noFreeGame) {
    return <FreeGameOverScreen onBack={() => setNoFreeGame(false)} />;
  }

  return (
    <PlayModalLayout backTo={`/play/mode/${mode}`} backLabel={t('common.back')} backStyle="button">
      <PlayCard border="border-4 border-carissma-300" radius="rounded-[2.5rem]">
        <StickerHeading as="h2" className="text-2xl">
          {t('play.joinByCode.title')}
        </StickerHeading>
        <form onSubmit={onSubmit} className="mt-6 space-y-4 text-start">
          <TextField
            label={t('play.joinByCode.codeLabel')}
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder={t('play.joinByCode.codePlaceholder')}
            error={error}
            className="text-center text-lg font-bold tracking-[0.3em]"
          />
          <Button type="submit" loading={loading}>
            {t('play.joinByCode.join')}
          </Button>
        </form>
      </PlayCard>
    </PlayModalLayout>
  );
}
