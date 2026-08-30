import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listUserFollowers, listUserFollowing, unfollowUser } from '../../../api/me.api';

function FollowRow({ person, isFollowingTab, onUnfollow, onOpen }) {
  const initials = (person.fullName?.[0] || '?').toUpperCase();
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-carissma-100 bg-white/70 p-3">
      <button onClick={() => onOpen(person.id)} className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-carissma-100">
        {person.avatarUrl ? (
          <img src={person.avatarUrl} alt={person.fullName} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm font-extrabold text-carissma-400">{initials}</div>
        )}
      </button>
      <button onClick={() => onOpen(person.id)} className="min-w-0 flex-1 text-start">
        <p className="truncate text-sm font-bold text-espresso-900">{person.fullName}</p>
        {person.bio && <p className="truncate text-xs font-medium text-espresso-500">{person.bio}</p>}
      </button>
      {isFollowingTab && (
        <button
          onClick={() => onUnfollow(person.id)}
          className="shrink-0 rounded-full border-2 border-carissma-300 px-4 py-1.5 text-xs font-bold text-carissma-500 hover:bg-carissma-50"
        >
          Unfollow
        </button>
      )}
    </div>
  );
}

export default function FollowListTab({ userId, type, onChanged }) {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [state, setState] = useState('loading');

  const load = () => {
    setState('loading');
    const fetcher = type === 'following' ? listUserFollowing : listUserFollowers;
    fetcher(userId)
      .then((result) => {
        setRows(result?.rows || []);
        setState('ready');
      })
      .catch(() => setState('error'));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, type]);

  const handleUnfollow = async (targetId) => {
    setRows((prev) => prev.filter((r) => r.id !== targetId));
    try {
      await unfollowUser(targetId);
      onChanged?.();
    } catch {
      load();
    }
  };

  if (state === 'loading') return <p className="text-center text-sm font-semibold text-espresso-500">Loading…</p>;
  if (state === 'error') return <p className="text-center text-sm font-semibold text-carnation-600">Couldn't load this list right now.</p>;
  if (rows.length === 0) {
    return (
      <p className="text-center text-sm font-semibold text-espresso-500">
        {type === 'following' ? "You're not following anyone yet." : 'No followers yet.'}
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {rows.map((person) => (
        <FollowRow
          key={person.id}
          person={person}
          isFollowingTab={type === 'following'}
          onUnfollow={handleUnfollow}
          onOpen={(id) => navigate(`/profile/users/${id}`)}
        />
      ))}
    </div>
  );
}
