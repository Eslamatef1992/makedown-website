import { useNavigate, useParams } from 'react-router-dom';
import PlayModalLayout, { PlayCard } from './components/PlayModalLayout';
import StickerHeading from '../../components/ui/StickerHeading';
import Button from '../../components/ui/Button';

export default function CreateJoinPage() {
  const { mode } = useParams();
  const navigate = useNavigate();

  return (
    <PlayModalLayout backTo="/play" backLabel="Back" backStyle="button">
      <div className="flex flex-col gap-6 sm:flex-row">
        <PlayCard>
          <StickerHeading as="h2" className="text-2xl">
            Create Game
          </StickerHeading>
          <p className="mt-4 text-sm font-medium text-espresso-700">
            Choose your game and invite a player with a link or get matched randomly.
          </p>
          <Button className="mt-6" onClick={() => navigate(`/play/mode/${mode}/create`)}>
            Start Now
          </Button>
        </PlayCard>

        <PlayCard>
          <StickerHeading as="h2" className="text-2xl">
            Join Game
          </StickerHeading>
          <p className="mt-4 text-sm font-medium text-espresso-700">
            Join a game through an invitation link or get matched with a random player.
          </p>
          <Button className="mt-6" onClick={() => navigate(`/play/mode/${mode}/join`)}>
            Start Now
          </Button>
        </PlayCard>
      </div>
    </PlayModalLayout>
  );
}
