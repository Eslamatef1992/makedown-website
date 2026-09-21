import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SiteLayout from '../../components/layout/SiteLayout';
import StickerHeading from '../../components/ui/StickerHeading';
import Button from '../../components/ui/Button';
import TextField from '../../components/ui/TextField';
import FreeGameOverScreen from '../../components/play/FreeGameOverScreen';
import { pickLang } from '../../utils/bilingual';
import { listPlayableQuizzes, createGame, startGame } from '../../api/play.api';
import { listGameCategories } from '../../api/content.api';

// Direct-play entry point: there is no invite code or lobby any more —
// picking categories and completing the team form creates the game and
// drops every player straight into it. Every website game is a two-team
// game (fixed at two teams; each team can be just the host or the host
// plus optional named teammates) — there's no separate solo mode any more.
const MODE = 'team';

// A game board is always 6 categories — Start Game stays disabled and
// tiles beyond the 6th can't be picked until one is deselected.
const REQUIRED_QUIZ_COUNT = 6;

// Safety cap on how many teammates can be pre-named (as guests — no
// account needed) per team, in case someone types an unreasonable
// number into "Number Of Players". The actual number of name fields
// shown always follows whatever count was entered for that team.
const MAX_NAMED_PLAYERS = 10;

export default function CategorySelectPage() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  const [categories, setCategories] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState([]);
  const [gameName, setGameName] = useState('');
  const [team1Name, setTeam1Name] = useState('');
  const [team2Name, setTeam2Name] = useState('');
  const [team1Count, setTeam1Count] = useState('');
  const [team2Count, setTeam2Count] = useState('');
  // Number of name fields shown per team always tracks that team's
  // "Number Of Players" value, so these start empty (no count yet).
  const [team1Players, setTeam1Players] = useState([]);
  const [team2Players, setTeam2Players] = useState([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [noFreeGame, setNoFreeGame] = useState(false);
  // Which card's "how to play" tooltip is open — tap-to-open on touch
  // devices, in addition to the plain CSS hover used on desktop.
  const [openInfo, setOpenInfo] = useState(null);

  useEffect(() => {
    Promise.all([
      listGameCategories().catch(() => []),
      listPlayableQuizzes(undefined, MODE).catch(() => []),
    ])
      .then(([cats, qs]) => {
        setCategories(cats || []);
        setQuizzes(qs || []);
      })
      .finally(() => setLoading(false));
  }, []);

  // Every active category gets its own panel, even ones with no games yet
  // (rendered as a "No Game Added" placeholder below) — not just the
  // categories that happen to already have a playable quiz, so schools/
  // admins see the category exists and knows it still needs games added.
  // Grouped by category id (not the English name) so an Arabic-only or
  // renamed category still merges correctly into a single section.
  const grouped = useMemo(() => {
    const activeIds = new Set(categories.map((c) => c.id));
    const itemsByCategoryId = new Map();
    const orphanGroups = new Map();

    for (const quiz of quizzes) {
      if (activeIds.has(quiz.category_id)) {
        if (!itemsByCategoryId.has(quiz.category_id)) itemsByCategoryId.set(quiz.category_id, []);
        itemsByCategoryId.get(quiz.category_id).push(quiz);
      } else {
        // A quiz tagged to a category that's since been deactivated/deleted,
        // or with no category at all — still needs somewhere to show up.
        const key = quiz.category_id ?? 'other';
        if (!orphanGroups.has(key)) {
          orphanGroups.set(key, {
            key: `orphan-${key}`,
            nameEn: quiz.category_name_en || 'Other',
            nameAr: quiz.category_name_ar || quiz.category_name_en || 'أخرى',
            items: [],
          });
        }
        orphanGroups.get(key).items.push(quiz);
      }
    }

    const activeGroups = categories.map((cat) => ({
      key: `cat-${cat.id}`,
      nameEn: cat.name_en,
      nameAr: cat.name_ar,
      items: itemsByCategoryId.get(cat.id) || [],
    }));

    return [...activeGroups, ...orphanGroups.values()];
  }, [categories, quizzes]);

  const toggle = (id) => {
    setSelected((s) => {
      if (s.includes(id)) return s.filter((x) => x !== id);
      if (s.length >= REQUIRED_QUIZ_COUNT) return s;
      return [...s, id];
    });
  };

  const clear = () => {
    setSelected([]);
    setGameName('');
    setTeam1Name('');
    setTeam2Name('');
    setTeam1Count('');
    setTeam2Count('');
    setTeam1Players([]);
    setTeam2Players([]);
  };

  const setPlayerName = (team, index, value) => {
    const setter = team === 1 ? setTeam1Players : setTeam2Players;
    setter((names) => names.map((n, i) => (i === index ? value : n)));
  };

  // Keeps the "Number Of Players" field and the list of name inputs for
  // that team in sync: typing "2" shows exactly two name rows, existing
  // names already typed are kept, and the count is clamped to a sane
  // range so a stray huge number can't blow up the form.
  const setTeamCount = (team, value) => {
    const setCount = team === 1 ? setTeam1Count : setTeam2Count;
    const setPlayers = team === 1 ? setTeam1Players : setTeam2Players;
    setCount(value);
    const n = Math.max(0, Math.min(MAX_NAMED_PLAYERS, Number(value) || 0));
    setPlayers((names) => {
      const next = names.slice(0, n);
      while (next.length < n) next.push('');
      return next;
    });
  };

  const canStart =
    selected.length === REQUIRED_QUIZ_COUNT && gameName.trim() && team1Name.trim() && team2Name.trim();

  const onContinue = async () => {
    if (selected.length !== REQUIRED_QUIZ_COUNT) {
      setError(t('play.categorySelect.pickCategoryError', { count: REQUIRED_QUIZ_COUNT }));
      return;
    }
    if (!gameName.trim() || !team1Name.trim() || !team2Name.trim()) {
      setError(t('play.categorySelect.fillRequiredError'));
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const session = await createGame({
        mode: MODE,
        quizIds: selected,
        title: gameName.trim(),
        team1Name: team1Name.trim(),
        team2Name: team2Name.trim(),
        team1Capacity: team1Count ? Number(team1Count) : undefined,
        team2Capacity: team2Count ? Number(team2Count) : undefined,
        team1Players: team1Players.map((n) => n.trim()).filter(Boolean),
        team2Players: team2Players.map((n) => n.trim()).filter(Boolean),
      });
      await startGame(session.id);
      navigate(`/play/sessions/${session.id}/live`);
    } catch (err) {
      if (err.response?.status === 402) {
        setNoFreeGame(true);
      } else {
        setError(err.response?.data?.message || t('play.categorySelect.createGameError'));
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
          {t('play.categorySelect.title')}
        </StickerHeading>

        {loading ? (
          <p className="mt-8 text-espresso-500">{t('play.categorySelect.loading')}</p>
        ) : grouped.length === 0 ? (
          <p className="mt-8 text-espresso-500">{t('play.categorySelect.empty')}</p>
        ) : (
          <div className="relative z-10 mt-8 space-y-10">
            {grouped.map((group) => (
              <div key={group.key} className="relative mt-6 first:mt-0">
                <div className="absolute start-1/2 top-0 z-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-carissma-50 px-6 py-1.5 sm:px-8 sm:py-2">
                  <StickerHeading as="h2" className="whitespace-nowrap text-lg sm:text-xl">
                    {lang === 'ar' ? group.nameAr : group.nameEn}
                  </StickerHeading>
                </div>
                {group.items.length === 0 ? (
                  <div className="rounded-[2rem] bg-carissma-50/60 py-7 pt-9 text-center sm:py-8 sm:pt-10">
                    <p className="text-sm font-bold text-carissma-300 sm:text-base">
                      {t('play.categorySelect.noGamesInCategory')}
                    </p>
                  </div>
                ) : (
                <div className="rounded-[2rem] bg-carissma-50 p-4 pt-8 sm:p-6 sm:pt-9">
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {group.items.map((quiz) => {
                    const isSelected = selected.includes(quiz.id);
                    const atCap = !isSelected && selected.length >= REQUIRED_QUIZ_COUNT;
                    const title = pickLang(quiz, 'title', lang);
                    const howToPlay = pickLang(quiz, 'description', lang);
                    const infoOpen = openInfo === quiz.id;
                    return (
                      <div
                        key={quiz.id}
                        role="button"
                        tabIndex={atCap ? -1 : 0}
                        aria-disabled={atCap}
                        onClick={() => !atCap && toggle(quiz.id)}
                        onKeyDown={(e) => {
                          if (atCap) return;
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            toggle(quiz.id);
                          }
                        }}
                        className={`group relative flex aspect-square w-full flex-col rounded-3xl border-2 bg-white p-1.5 text-center transition ${
                          isSelected
                            ? 'cursor-pointer border-carissma-500'
                            : atCap
                            ? 'cursor-not-allowed border-carissma-100 opacity-40'
                            : 'cursor-pointer border-carissma-100 hover:border-carissma-300'
                        }`}
                      >
                        {howToPlay && (
                          <>
                            <button
                              type="button"
                              aria-label={t('play.categorySelect.howToPlay')}
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenInfo((cur) => (cur === quiz.id ? null : quiz.id));
                              }}
                              className="absolute start-2.5 top-2.5 z-10 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-carissma-500 text-xs font-extrabold text-white shadow-sm hover:bg-carissma-600 sm:h-8 sm:w-8 sm:text-sm"
                            >
                              i
                            </button>
                            <div
                              className={`absolute start-2.5 top-11 z-20 w-40 max-w-[calc(100vw-2.5rem)] rounded-2xl border border-carissma-100 bg-white p-3 text-start text-[11px] font-semibold leading-snug text-carissma-600 shadow-lg transition sm:w-56 sm:p-3.5 sm:text-xs ${
                                infoOpen ? 'opacity-100' : 'pointer-events-none opacity-0 group-hover:pointer-events-auto group-hover:opacity-100'
                              }`}
                            >
                              {howToPlay}
                            </div>
                          </>
                        )}

                        <span className="relative min-h-0 flex-1 overflow-hidden rounded-2xl bg-linen-50">
                          {quiz.cover_image_url ? (
                            <img src={quiz.cover_image_url} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <span className="flex h-full w-full items-center justify-center text-4xl">🎨</span>
                          )}
                        </span>
                        <span className="shrink-0 truncate px-1 pt-1.5 text-xs font-bold text-carissma-600 sm:text-sm">{title}</span>
                      </div>
                    );
                  })}
                  </div>
                </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="relative z-0 mt-8">
          <div className="flex flex-wrap items-center justify-between gap-2 px-1">
            <StickerHeading as="h2" className="text-xl sm:text-2xl">
              {t('play.categorySelect.completeGameInfo')}
            </StickerHeading>
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold ${
                selected.length === REQUIRED_QUIZ_COUNT ? 'bg-carissma-500 text-white' : 'bg-carissma-100 text-carissma-600'
              }`}
            >
              {t('play.categorySelect.selectedCount', { count: selected.length, total: REQUIRED_QUIZ_COUNT })}
            </span>
          </div>

          <div className="mt-3 rounded-[2rem] border-4 border-carissma-300 bg-carissma-50/70 p-6 shadow-sm sm:p-8">
            <TextField
              label={t('play.categorySelect.gameNameLabel')}
              required
              value={gameName}
              onChange={(e) => setGameName(e.target.value)}
              placeholder={t('play.categorySelect.gameNamePlaceholder')}
            />

            <div className="mt-5 border-t border-carissma-200 pt-5">
              <div className="grid gap-6 sm:grid-cols-2">
                {[1, 2].map((team) => {
                  const teamName = team === 1 ? team1Name : team2Name;
                  const setTeamName = team === 1 ? setTeam1Name : setTeam2Name;
                  const teamCount = team === 1 ? team1Count : team2Count;
                  const teamPlayers = team === 1 ? team1Players : team2Players;
                  return (
                    <div key={team} className="space-y-4">
                      <TextField
                        label={t('play.categorySelect.teamNameLabel', { number: team })}
                        required
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                        placeholder={t('play.categorySelect.teamNamePlaceholder', { number: team })}
                      />
                      <TextField
                        label={
                          <>
                            {t('play.categorySelect.numberOfPlayers')}{' '}
                            <span className="font-medium text-carissma-300">({t('common.optional')})</span>
                          </>
                        }
                        type="number"
                        min="0"
                        value={teamCount}
                        onChange={(e) => setTeamCount(team, e.target.value)}
                        placeholder="3"
                      />
                      {teamPlayers.map((name, i) => (
                        <TextField
                          key={i}
                          label={
                            i === 0 ? (
                              <>
                                {t('play.categorySelect.playerName')}{' '}
                                <span className="font-medium text-carissma-300">({t('common.optional')})</span>
                              </>
                            ) : undefined
                          }
                          value={name}
                          onChange={(e) => setPlayerName(team, i, e.target.value)}
                          placeholder={t('play.categorySelect.playerNamePlaceholder')}
                        />
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>

            {error && <p className="mt-4 text-sm font-medium text-carnation-600">{error}</p>}

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={clear}
                className="flex-1 rounded-full bg-carissma-100 py-3 text-sm font-bold text-carissma-600 hover:bg-carissma-200"
              >
                {t('play.categorySelect.clear')}
              </button>
              <div className="flex-[2]">
                <Button onClick={onContinue} loading={submitting} disabled={!canStart}>
                  {t('play.categorySelect.startGame')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
