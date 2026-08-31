import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PlayModalLayout, { PlayCard } from './components/PlayModalLayout';
import StickerHeading from '../../components/ui/StickerHeading';
import Button from '../../components/ui/Button';
import TextField from '../../components/ui/TextField';
import { joinGameByCode } from '../../api/play.api';

export default function JoinByCodePage() {
  const { mode } = useParams();
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;
    setError('');
    setLoading(true);
    try {
      const session = await joinGameByCode(code.trim());
      navigate(`/play/sessions/${session.id}/lobby`);
    } catch (err) {
      setError(err.response?.data?.message || 'No game found with that code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PlayModalLayout backTo={`/play/mode/${mode}`} backLabel="Back" backStyle="button">
      <PlayCard>
        <StickerHeading as="h2" className="text-2xl">
          Join Game
        </StickerHeading>
        <form onSubmit={onSubmit} className="mt-6 space-y-4 text-start">
          <TextField
            label="Join Code"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="e.g. 7F3KQ2"
            error={error}
            className="text-center text-lg font-bold tracking-[0.3em]"
          />
          <Button type="submit" loading={loading}>
            Join
          </Button>
        </form>
      </PlayCard>
    </PlayModalLayout>
  );
}
