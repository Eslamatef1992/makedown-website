import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SiteLayout from '../../components/layout/SiteLayout';
import StickerHeading from '../../components/ui/StickerHeading';
import Button from '../../components/ui/Button';
import TextField from '../../components/ui/TextField';
import FreeGameOverScreen from '../../components/play/FreeGameOverScreen';
import { useAuth } from '../../context/AuthContext';
import { pickLang } from '../../utils/bilingual';
import { listPlayableQuizzes, createGame } from '../../api/play.api';

export default function CategorySelectPage() {
  const { mode } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { i18n } = useTranslation();
  const lang = i18n.language;

  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState([]);
  const [gameName, setGameName] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [noFreeGame, setNoFreeGame] = useState(false);
  // Which card's "how to play" tooltip is open — tap-to-open on touch
  // devices, in addition to the plain CSS hover used on desktop.
  const [openInfo, setOpenInfo] = useState(null);

  useEffect(() => {
    listPlayableQuizzes(undefined, mode)
      .then(setQuizzes)
      .catch(() => setQuizzes([]))
      .finally(() => setLoading(false));
  }, [mode]);

  // Grouped by category_id (not the English name) so an Arabic-only or
  // renamed category still merges correctly into a single section.
  const grouped = useMemo(() => {
    const groups = new Map();
    for (const quiz of quizzes) {
      const key = quiz.category_id ?? 'other';
      if (!groups.has(key)) {
        groups.set(key, {
          nameEn: quiz.category_name_en || 'Other',
          nameAr: quiz.category_name_ar || quiz.category_name_en || 'أخرى',
          items: [],
        });
      }
      groups.get(key).items.push(quiz);
    }
    return [...groups.values()];
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
          <div className="relative z-10 mt-8 space-y-10">
            {grouped.map((group) => (
              <div key={group.nameEn}>
                <div className="mb-5 flex justify-center">
                  <StickerHeading as="h2" className="text-xl sm:text-2xl">
                    {lang === 'ar' ? group.nameAr : group.nameEn}
                  </StickerHeading>
                </div>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {group.items.map((quiz) => {
                    const isSelected = selected.includes(quiz.id);
                    const title = pickLang(quiz, 'title', lang);
                    const howToPlay = pickLang(quiz, 'description', lang);
                    const infoOpen = openInfo === quiz.id;
                    return (
                      <div
                        key={quiz.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => toggle(quiz.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            toggle(quiz.id);
                          }
                        }}
                        className={`group relative flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 p-3 text-center transition ${
                          isSelected ? 'border-carissma-500 bg-carissma-50' : 'border-linen-200 bg-white hover:border-carissma-200'
                        }`}
                      >
                        {howToPlay && (
                          <>
                            <button
                              type="button"
                              aria-label="How to play"
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenInfo((cur) => (cur === quiz.id ? null : quiz.id));
                              }}
                              className="absolute start-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-carissma-500 text-[11px] font-extrabold text-white shadow-sm hover:bg-carissma-600"
                            >
                              i
                            </button>
                            <div
                              className={`absolute start-2 top-9 z-20 w-40 rounded-2xl border border-carissma-100 bg-white p-3 text-start text-[11px] font-semibold leading-snug text-carissma-600 shadow-lg transition ${
                                infoOpen ? 'opacity-100' : 'pointer-events-none opacity-0 group-hover:pointer-events-auto group-hover:opacity-100'
                              }`}
                            >
                              {howToPlay}
                            </div>
                          </>
                        )}

                        <span className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl bg-linen-50">
                          {quiz.cover_image_url ? (
                            <img src={quiz.cover_image_url} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <span className="text-2xl">🎨</span>
                          )}
                        </span>
                        <span className="text-xs font-bold text-carissma-600">{title}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="relative z-0 mt-8 rounded-[2rem] border-4 border-carissma-300 bg-white p-6 shadow-sm sm:p-8">
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
