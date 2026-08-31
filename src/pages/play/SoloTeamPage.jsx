import { useNavigate } from 'react-router-dom';
import PlayModalLayout, { PlayCard } from './components/PlayModalLayout';
import StickerHeading from '../../components/ui/StickerHeading';
import Button from '../../components/ui/Button';
import { SoloPlayerIcon, TeamPlayersIcon } from '../../components/ui/icons';

const OPTIONS = [
  {
    mode: 'solo',
    title: 'Solo',
    Icon: SoloPlayerIcon,
    description:
      "A single-player game where the player answers a series of questions individually and earns points based on their correct answers. At the end of the game, the player can view their final score and results.",
  },
  {
    mode: 'team',
    title: 'Team',
    Icon: TeamPlayersIcon,
    description:
      'A multiplayer game where players compete in teams by answering a series of questions. Each team earns points based on their correct answers, and the team with the highest score at the end of the game wins.',
  },
];

export default function SoloTeamPage() {
  const navigate = useNavigate();

  return (
    <PlayModalLayout backTo="/" backLabel="Back" backStyle="button">
      <div className="flex flex-col gap-6 sm:flex-row">
        {OPTIONS.map((opt) => (
          <PlayCard key={opt.mode}>
            <StickerHeading as="h2" className="text-2xl">
              {opt.title}
            </StickerHeading>
            <opt.Icon className="mx-auto mt-4 h-28 w-28" />
            <p className="mt-4 text-sm font-medium text-espresso-700">{opt.description}</p>
            <Button className="mt-6" onClick={() => navigate(`/play/mode/${opt.mode}`)}>
              Start Now
            </Button>
          </PlayCard>
        ))}
      </div>
    </PlayModalLayout>
  );
}
