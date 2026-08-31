import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SiteLayout from '../../components/layout/SiteLayout';
import StickerHeading from '../../components/ui/StickerHeading';
import Button from '../../components/ui/Button';
import TextField from '../../components/ui/TextField';
import FreeGameOverScreen from '../../components/play/FreeGameOverScreen';
import { useAuth } from '../../context/AuthContext';
import { listPlayableQuizzes, createGame } from '../../api/play.api';

export default function CategorySelectPage() {
  const { mode } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState([]);
  const [gameName, setGameName] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [noFreeGame, setNoFreeGame] = useState(false);

  useEffect(() => {
    listPlayableQuizzes(undefined, mode)
      .then(setQuizzes)
      .catch(() => setQuizzes([]))
      .finally(() => setLoading(false));
  }, [mode]);

  const grouped = useMemo(() => {
    const groups = new Map();
    for (const quiz of quizzes) {
      const key = quiz.category_name_en || 'Other';
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(quiz);
    }
    return [...groups.entries()];
  }, [quizzes]);

  const toggle = (id) => {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  };

  const clear = () => {
    setSelected([]);
    setGameName('');
  };

  const onContinue = async () => {
    if (!selected.length) {
      setError('Pick at least one category to build your board.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const session = await createGame({ mode, quizIds: selected, title: gameName || undefined });
      navigate(`/play/sessions/${session.id}/invite`);
    } catch (err) {
      if (err.response?.status === 402) {
        setNoFreeGame(true);
      } else {
        setError(err.response?.data?.message || 'Could not create the game.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (noFreeGame) {
    return <FreeGameOverScreen onBack={() => setNoFreeGame(false)} />;
  }

  return (
    <SiteLayout>
      <div className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 lg:px-10">
        <StickerHeading as="h1" className="text-2xl sm:text-3xl">
          Select Categories
        </StickerHeading>

        {loading ? (
          <p className="mt-8 text-espresso-500">Loading categories…</p>
        ) : grouped.length === 0 ? (
          <p className="mt-8 text-espresso-500">No categories are available to play yet — check back soon.</p>
        ) : (
          <div className="mt-8 space-y-6">
            {grouped.map(([category, items]) => (
              <div key={category} className="rounded-[2rem] border-4 border-carissma-300 bg-white p-5 shadow-sm sm:p-6">
                <div className="mb-4 flex justify-center">
                  <span className="rounded-full bg-carissma-100 px-4 py-1 text-xs font-bold text-carissma-600">{category}</span>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {items.map((quiz) => {
                    const isSelected = selected.includes(quiz.id);
                    return (
                      <button
                        key={quiz.id}
                        type="button"
                        onClick={() => toggle(quiz.id)}
                        className={`flex flex-col items-center gap-2 rounded-2xl border-2 p-3 text-center transition ${
                          isSelected ? 'border-carissma-500 bg-carissma-50' : 'border-linen-200 bg-linen-50 hover:border-carissma-200'
                        }`}
                      >
                        <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-white text-2xl">🎨</span>
                        <span className="text-xs font-bold text-carissma-600">{quiz.title_en}</span>
                        <span className="text-[11px] text-espresso-400">{quiz.question_count} questions</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 rounded-[2rem] border-4 border-carissma-300 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-lg font-extrabold text-espresso-900">Complete Game Information</h2>
          <div className="mt-4 space-y-4">
            <TextField label="Game Name (optional)" value={gameName} onChange={(e) => setGameName(e.target.value)} placeholder="Enter game name" />
            <p className="text-sm text-espresso-600">
              Playing as <span className="font-bold text-espresso-900">{user?.full_name || user?.first_name || 'you'}</span>
            </p>
          </div>

          {error && <p className="mt-4 text-sm font-medium text-carnation-600">{error}</p>}

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={clear}
              className="flex-1 rounded-full bg-carissma-100 py-3 text-sm font-bold text-carissma-600 hover:bg-carissma-200"
            >
              Clear
            </button>
            <div className="flex-[2]">
              <Button onClick={onContinue} loading={submitting}>
                Continue
              </Button>
            </div>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
