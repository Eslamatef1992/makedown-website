import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SiteLayout from '../../components/layout/SiteLayout';
import StickerHeading from '../../components/ui/StickerHeading';
import { followUser, searchUsers, unfollowUser } from '../../api/me.api';
import { SearchIcon } from '../../components/ui/icons';

function PlayerRow({ person, onToggleFollow, busy }) {
  const { t } = useTranslation();
  const initials = (person.fullName?.[0] || '?').toUpperCase();
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <Link to={`/profile/users/${person.id}`} className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-carissma-100">
        {person.avatarUrl ? (
          <img src={person.avatarUrl} alt={person.fullName} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm font-extrabold text-carissma-400">{initials}</div>
        )}
      </Link>
      <Link to={`/profile/users/${person.id}`} className="min-w-0 flex-1 text-start">
        <p className="truncate text-sm font-bold text-espresso-900">{person.fullName}</p>
        {person.bio && <p className="truncate text-xs font-medium text-espresso-500">{person.bio}</p>}
      </Link>
      <button
        type="button"
        onClick={() => onToggleFollow(person)}
        disabled={busy}
        className={`shrink-0 rounded-full px-5 py-1.5 text-xs font-bold transition disabled:opacity-60 ${
          person.isFollowedByMe
            ? 'bg-white text-carissma-500 shadow-sm hover:bg-carissma-50'
            : 'bg-carissma-500 text-white hover:bg-carissma-600'
        }`}
      >
        {person.isFollowedByMe ? t('profile.follow.unfollow') : t('profile.follow.follow')}
      </button>
    </div>
  );
}

export default function DiscoverPlayersPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [rows, setRows] = useState([]);
  const [state, setState] = useState('loading');
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const handle = setTimeout(() => {
      if (cancelled) return;
      setState('loading');
      searchUsers({ search: query.trim() || undefined, pageSize: 40 })
        .then((result) => {
          if (cancelled) return;
          setRows(result?.rows || []);
          setState('ready');
        })
        .catch(() => {
          if (!cancelled) setState('error');
        });
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [query]);

  const toggleFollow = async (person) => {
    setBusyId(person.id);
    const wasFollowed = person.isFollowedByMe;
    setRows((prev) => prev.map((r) => (r.id === person.id ? { ...r, isFollowedByMe: !wasFollowed } : r)));
    try {
      if (wasFollowed) await unfollowUser(person.id);
      else await followUser(person.id);
    } catch (err) {
      setRows((prev) => prev.map((r) => (r.id === person.id ? { ...r, isFollowedByMe: wasFollowed } : r)));
      if (err.response?.status === 401) navigate('/login');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <SiteLayout>
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-10">
        <StickerHeading as="h1" className="text-2xl sm:text-3xl">
          {t('profile.discover.title')}
        </StickerHeading>
        <p className="mt-2 text-sm font-semibold text-espresso-600">{t('profile.discover.subtitle')}</p>

        <div className="relative mt-6">
          <SearchIcon className="pointer-events-none absolute inset-y-0 start-4 my-auto h-4 w-4 text-carissma-300" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('profile.discover.searchPlaceholder')}
            className="w-full rounded-full border border-carissma-100 bg-white py-3 ps-11 pe-4 text-sm text-espresso-900 placeholder:text-carissma-300 focus:outline-none focus:ring-2 focus:ring-carissma-400"
          />
        </div>

        <div className="mt-6 overflow-hidden rounded-[2rem] border-4 border-carissma-300 bg-carissma-50/60">
          {state === 'loading' && (
            <p className="p-8 text-center text-sm font-semibold text-espresso-500">{t('common.loading')}</p>
          )}
          {state === 'error' && (
            <p className="p-8 text-center text-sm font-semibold text-carnation-600">{t('profile.discover.loadError')}</p>
          )}
          {state === 'ready' && rows.length === 0 && (
            <p className="p-8 text-center text-sm font-semibold text-espresso-500">{t('profile.discover.empty')}</p>
          )}
          {state === 'ready' && rows.length > 0 && (
            <div className="divide-y divide-carissma-100">
              {rows.map((person) => (
                <PlayerRow key={person.id} person={person} onToggleFollow={toggleFollow} busy={busyId === person.id} />
              ))}
            </div>
          )}
        </div>
      </div>
    </SiteLayout>
  );
}
