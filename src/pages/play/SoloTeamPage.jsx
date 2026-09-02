import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PlayModalLayout, { PlayCard } from './components/PlayModalLayout';
import StickerHeading from '../../components/ui/StickerHeading';
import Button from '../../components/ui/Button';
import { SoloPlayerIcon, TeamPlayersIcon } from '../../components/ui/icons';

const OPTIONS = [
  { mode: 'solo', key: 'solo', Icon: SoloPlayerIcon },
  { mode: 'team', key: 'team', Icon: TeamPlayersIcon },
];

export default function SoloTeamPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <PlayModalLayout backTo="/" backLabel={t('common.back')} backStyle="button">
      <div className="flex flex-col gap-6 sm:flex-row">
        {OPTIONS.map((opt) => (
          <PlayCard key={opt.mode} border="border-4 border-carissma-300" radius="rounded-[2.5rem]">
            <StickerHeading as="h2" className="text-2xl">
              {t(`play.soloTeam.${opt.key}.title`)}
            </StickerHeading>
            <opt.Icon className="mx-auto mt-4 h-28 w-28" />
            <p className="mt-4 text-sm font-medium text-espresso-700">{t(`play.soloTeam.${opt.key}.description`)}</p>
            <Button className="mt-6" onClick={() => navigate(`/play/mode/${opt.mode}`)}>
              {t('play.soloTeam.startNow')}
            </Button>
          </PlayCard>
        ))}
      </div>
    </PlayModalLayout>
  );
}
