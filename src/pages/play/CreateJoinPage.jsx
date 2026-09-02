import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PlayModalLayout, { PlayCard } from './components/PlayModalLayout';
import StickerHeading from '../../components/ui/StickerHeading';
import Button from '../../components/ui/Button';

export default function CreateJoinPage() {
  const { mode } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <PlayModalLayout backTo="/play" backLabel={t('common.back')} backStyle="button">
      <div className="flex flex-col gap-6 sm:flex-row">
        <PlayCard border="border-4 border-carissma-300" radius="rounded-[2.5rem]">
          <StickerHeading as="h2" className="text-2xl">
            {t('play.createJoin.create.title')}
          </StickerHeading>
          <p className="mt-4 text-sm font-medium text-espresso-700">
            {t('play.createJoin.create.description')}
          </p>
          <Button className="mt-6" onClick={() => navigate(`/play/mode/${mode}/create`)}>
            {t('play.createJoin.startNow')}
          </Button>
        </PlayCard>

        <PlayCard border="border-4 border-carissma-300" radius="rounded-[2.5rem]">
          <StickerHeading as="h2" className="text-2xl">
            {t('play.createJoin.join.title')}
          </StickerHeading>
          <p className="mt-4 text-sm font-medium text-espresso-700">
            {t('play.createJoin.join.description')}
          </p>
          <Button className="mt-6" onClick={() => navigate(`/play/mode/${mode}/join`)}>
            {t('play.createJoin.startNow')}
          </Button>
        </PlayCard>
      </div>
    </PlayModalLayout>
  );
}
