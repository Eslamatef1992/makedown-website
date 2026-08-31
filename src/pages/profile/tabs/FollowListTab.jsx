import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChatBubbleIcon } from '../../../components/ui/icons';
import { followUser, listUserFollowers, listUserFollowing, removeFollower, startChatThread, unfollowUser } from '../../../api/me.api';

function FollowRow({ person, isFollowingTab, onUnfollow, onRemove, onFollowBack, onOpen, onChat }) {
  const initials = (person.fullName?.[0] || '?').toUpperCase();
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
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

      {isFollowingTab ? (
        <button
          onClick={() => onUnfollow(person.id)}
          className="shrink-0 rounded-full bg-white px-4 py-1.5 text-xs font-bold text-carissma-500 shadow-sm hover:bg-carissma-50"
        >
          Unfollow
        </button>
      ) : person.isFollowedByMe ? (
        <>
          <button
            onClick={() => onRemove(person.id)}
            className="shrink-0 rounded-full bg-white px-4 py-1.5 text-xs font-bold text-espresso-700 shadow-sm hover:bg-carissma-50"
          >
            Remove
          </button>
          <button
            onClick={() => onChat(person.id)}
            aria-label="Message"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-carissma-100 text-carissma-500 hover:bg-carissma-200"
          >
            <ChatBubbleIcon className="h-4 w-4" />
          </button>
        </>
      ) : (
        <button
          onClick={() => onFollowBack(person.id)}
          className="shrink-0 rounded-full bg-carissma-500 px-5 py-1.5 text-xs font-bold text-white hover:bg-carissma-600"
        >
          Follow
        </button>
      )}
    </div>
  );
}

export default function FollowListTab({ userId, type, onChanged }) {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [state, setState] = useState('loading');
  const isFollowingTab = type === 'following';

  const load = () => {
    setState('loading');
    const fetcher = isFollowingTab ? listUserFollowing : listUserFollowers;
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

  const handleRemove = async (followerId) => {
    setRows((prev) => prev.filter((r) => r.id !== followerId));
    try {
      await removeFollower(followerId);
      onChanged?.();
    } catch {
      load();
    }
  };

  const handleFollowBack = async (targetId) => {
    setRows((prev) => prev.map((r) => (r.id === targetId ? { ...r, isFollowedByMe: true } : r)));
    try {
      await followUser(targetId);
      onChanged?.();
    } catch {
      load();
    }
  };

  const handleChat = async (targetId) => {
    try {
      const { threadId } = await startChatThread(targetId);
      navigate(`/profile/chat?thread=${threadId}`);
    } catch {
      // no-op — chat may be briefly unavailable
    }
  };

  const title = isFollowingTab ? 'My Following' : 'My Followers';

  if (state === 'loading') return <p className="text-center text-sm font-semibold text-espresso-500">Loading…</p>;
  if (state === 'error') return <p className="text-center text-sm font-semibold text-carnation-600">Couldn't load this list right now.</p>;

  return (
    <div>
      <p className="mb-3 text-base font-extrabold text-carissma-500">{title}</p>
      {rows.length === 0 ? (
        <p className="rounded-[2rem] border-4 border-carissma-200 bg-white/70 p-8 text-center text-sm font-semibold text-espresso-500">
          {isFollowingTab ? "You're not following anyone yet." : 'No followers yet.'}
        </p>
      ) : (
        <div className="divide-y divide-carissma-100 overflow-hidden rounded-[2rem] border-4 border-carissma-300 bg-carissma-50/60">
          {rows.map((person) => (
            <FollowRow
              key={person.id}
              person={person}
              isFollowingTab={isFollowingTab}
              onUnfollow={handleUnfollow}
              onRemove={handleRemove}
              onFollowBack={handleFollowBack}
              onOpen={(id) => navigate(`/profile/users/${id}`)}
              onChat={handleChat}
            />
          ))}
        </div>
      )}
    </div>
  );
}
