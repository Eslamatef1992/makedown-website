import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PlayModalLayout, { PlayCard } from './components/PlayModalLayout';
import StickerHeading from '../../components/ui/StickerHeading';
import FreeGameOverScreen from '../../components/play/FreeGameOverScreen';
import { joinGameByCode } from '../../api/play.api';

// Target of a shared "Game Link" / join QR code: /play/join/:code
// (routed behind ProtectedRoute, so an unauthenticated visitor is bounced to
// /login first and lands back here via location.state.from on success)
export default function JoinLinkPage() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [noFreeGame, setNoFreeGame] = useState(false);

  useEffect(() => {
    joinGameByCode(code)
      .then((session) => navigate(`/play/sessions/${session.id}/lobby`, { replace: true }))
      .catch((err) => {
        if (err.response?.status === 402) {
          setNoFreeGame(true);
        } else {
          setError(err.response?.data?.message || 'This game link is no longer valid.');
        }
      });
  }, [code, navigate]);

  if (noFreeGame) {
    return <FreeGameOverScreen onBack={() => navigate('/play')} />;
  }

  return (
    <PlayModalLayout backTo="/play" backLabel="Back to Play" backStyle="button">
      <PlayCard>
        <StickerHeading as="h2" className="text-2xl">
          Joining…
        </StickerHeading>
        <p className="mt-4 text-sm font-medium text-espresso-700">{error || 'Hang tight, connecting you to the game.'}</p>
      </PlayCard>
    </PlayModalLayout>
  );
}
