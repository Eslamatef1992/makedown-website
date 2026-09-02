import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SiteLayout from '../../components/layout/SiteLayout';
import StickerHeading from '../../components/ui/StickerHeading';
import { useAuth } from '../../context/AuthContext';
import { followUser, getUserProfile, startChatThread, unfollowUser } from '../../api/me.api';
import { ChatBubbleIcon } from '../../components/ui/icons';
import FollowListTab from './tabs/FollowListTab';

export default function UserProfilePage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [profile, setProfile] = useState(null);
  const [state, setState] = useState('loading');
  const [followBusy, setFollowBusy] = useState(false);
  const [subTab, setSubTab] = useState('followers');

  const load = () => {
    setState('loading');
    getUserProfile(id)
      .then((data) => {
        setProfile(data);
        setState('ready');
      })
      .catch(() => setState('error'));
  };

  useEffect(load, [id]);

  const toggleFollow = async () => {
    if (!isAuthenticated) return navigate('/login');
    setFollowBusy(true);
    try {
      if (profile.isFollowedByMe) {
        await unfollowUser(id);
        setProfile((p) => ({ ...p, isFollowedByMe: false, followersCount: Math.max(0, p.followersCount - 1) }));
      } else {
        await followUser(id);
        setProfile((p) => ({ ...p, isFollowedByMe: true, followersCount: p.followersCount + 1 }));
      }
    } catch {
      // leave state as-is — the button just won't have visibly changed
    } finally {
      setFollowBusy(false);
    }
  };

  const handleMessage = async () => {
    try {
      const { threadId } = await startChatThread(id);
      navigate(`/profile/chat?thread=${threadId}`);
    } catch {
      // no-op — chat may be briefly unavailable
    }
  };

  if (state === 'loading') {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-lg px-6 py-24 text-center sm:px-8">
          <p className="text-sm font-semibold text-espresso-500">{t('common.loading')}</p>
        </div>
      </SiteLayout>
    );
  }

  if (state === 'error' || !profile) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-lg px-6 py-24 text-center sm:px-8">
          <StickerHeading as="h1" className="text-xl">
            {t('profile.userProfile.notFound')}
          </StickerHeading>
          <Link to="/" className="mt-6 inline-block font-bold text-carissma-600 hover:underline">
            {t('profile.userProfile.backHome')}
          </Link>
        </div>
      </SiteLayout>
    );
  }

  if (profile.isMe) {
    navigate('/profile', { replace: true });
    return null;
  }

  const initials = (profile.fullName?.[0] || '?').toUpperCase();

  return (
    <SiteLayout>
      <div className="mx-auto max-w-5xl px-6 py-10 sm:px-8">
        <div className="flex flex-col items-center rounded-3xl border-2 border-carissma-200 bg-white/70 p-6 text-center sm:p-8">
          <div className="h-24 w-24 shrink-0 overflow-hidden rounded-full border-4 border-white bg-carissma-100 shadow-md">
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt={profile.fullName} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-3xl font-extrabold text-carissma-400">{initials}</div>
            )}
          </div>
          <StickerHeading as="h1" className="mt-4 text-xl">
            {profile.fullName}
          </StickerHeading>
          {profile.bio && <p className="mt-1 max-w-md text-sm font-medium text-espresso-600">{profile.bio}</p>}

          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={() => setSubTab('following')}
              className={`rounded-full px-4 py-2 text-xs font-bold ${subTab === 'following' ? 'bg-carissma-400 text-white' : 'bg-white/80 text-espresso-700 hover:bg-carissma-50'}`}
            >
              {t('profile.userProfile.followingCount', { count: profile.followingCount })}
            </button>
            <button
              onClick={() => setSubTab('followers')}
              className={`rounded-full px-4 py-2 text-xs font-bold ${subTab === 'followers' ? 'bg-carissma-400 text-white' : 'bg-white/80 text-espresso-700 hover:bg-carissma-50'}`}
            >
              {t('profile.userProfile.followersCount', { count: profile.followersCount })}
            </button>
            <button
              onClick={toggleFollow}
              disabled={followBusy}
              className={`rounded-full px-5 py-2 text-xs font-bold transition disabled:opacity-60 ${
                profile.isFollowedByMe ? 'border-2 border-carissma-300 text-carissma-500 hover:bg-carissma-50' : 'bg-carissma-400 text-white hover:bg-carissma-500'
              }`}
            >
              {profile.isFollowedByMe ? t('profile.follow.unfollow') : t('profile.follow.follow')}
            </button>
            {isAuthenticated && (
              <button onClick={handleMessage} className="flex items-center gap-1.5 rounded-full bg-white/80 px-4 py-2 text-xs font-bold text-espresso-700 hover:bg-carissma-50">
                <ChatBubbleIcon className="h-4 w-4" /> {t('profile.follow.message')}
              </button>
            )}
          </div>
        </div>

        <div className="mt-8">
          <FollowListTab userId={id} type={subTab} onChanged={load} />
        </div>
      </div>
    </SiteLayout>
  );
}
