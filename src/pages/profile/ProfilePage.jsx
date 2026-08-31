import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import SiteLayout from '../../components/layout/SiteLayout';
import StickerHeading from '../../components/ui/StickerHeading';
import { useAuth } from '../../context/AuthContext';
import { getUserProfile, listMyPackages } from '../../api/me.api';
import { ChatBubbleIcon, PencilIcon, ShareIcon } from '../../components/ui/icons';

import PackagesTab from './tabs/PackagesTab';
import FollowListTab from './tabs/FollowListTab';
import MyOrdersTab from './tabs/MyOrdersTab';
import GameHistoryTab from './tabs/GameHistoryTab';

const TABS = [
  { key: 'packages', label: 'Packages' },
  { key: 'following', label: 'My Following' },
  { key: 'followers', label: 'My Followers' },
  { key: 'orders', label: 'My Orders' },
  { key: 'history', label: 'Game History' },
];

function Avatar({ user, size = 'h-24 w-24' }) {
  const initials = (user?.firstName?.[0] || user?.fullName?.[0] || '?').toUpperCase();
  return (
    <div className={`${size} shrink-0 overflow-hidden rounded-full border-4 border-white bg-carissma-100 shadow-md`}>
      {user?.avatarUrl ? (
        <img src={user.avatarUrl} alt={user.fullName || 'Profile photo'} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-3xl font-extrabold text-carissma-400">
          {initials}
        </div>
      )}
    </div>
  );
}

function StatButton({ label, value, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-xs font-bold transition ${
        active ? 'bg-carissma-400 text-white' : 'bg-white/80 text-espresso-700 hover:bg-carissma-50'
      }`}
    >
      {value !== undefined ? `${value} ` : ''}
      {label}
    </button>
  );
}

export default function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = TABS.some((t) => t.key === searchParams.get('tab')) ? searchParams.get('tab') : 'packages';

  const [profile, setProfile] = useState(null);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [shareCopied, setShareCopied] = useState(false);

  const loadSummary = useCallback(() => {
    if (!user) return;
    setLoading(true);
    Promise.all([getUserProfile(user.id), listMyPackages()])
      .then(([profileData, pkgRows]) => {
        setProfile(profileData);
        setPackages(Array.isArray(pkgRows) ? pkgRows : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  const setTab = (key) => setSearchParams(key === 'packages' ? {} : { tab: key });

  const currentPackage = packages.find((p) => p.status === 'active');

  const handleShare = async () => {
    const url = `${window.location.origin}/profile/users/${user?.id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: user?.fullName || 'My Make Down profile', url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    } catch {
      // user cancelled the share sheet, or clipboard isn't available — no-op
    }
  };

  if (!user) return null;

  return (
    <SiteLayout>
      <div className="mx-auto max-w-6xl px-6 py-10 sm:px-8">
        <div className="flex flex-col items-center rounded-3xl border-2 border-carissma-200 bg-white/70 p-6 text-center sm:p-8">
          <Avatar user={user} />
          <StickerHeading as="h1" className="mt-4 text-xl">
            {user.fullName || user.firstName}
          </StickerHeading>
          {profile?.bio && <p className="mt-1 max-w-md text-sm font-medium text-espresso-600">{profile.bio}</p>}

          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <StatButton label="Following" value={profile?.followingCount ?? 0} active={activeTab === 'following'} onClick={() => setTab('following')} />
            <StatButton label="Followers" value={profile?.followersCount ?? 0} active={activeTab === 'followers'} onClick={() => setTab('followers')} />
            <button
              type="button"
              onClick={() => navigate('/profile/chat')}
              className="flex items-center gap-1.5 rounded-full bg-white/80 px-4 py-2 text-xs font-bold text-espresso-700 hover:bg-carissma-50"
            >
              <ChatBubbleIcon className="h-4 w-4" /> Chats
            </button>
            <button
              type="button"
              onClick={() => navigate('/profile/edit')}
              className="flex items-center gap-1.5 rounded-full bg-white/80 px-4 py-2 text-xs font-bold text-espresso-700 hover:bg-carissma-50"
            >
              <PencilIcon className="h-4 w-4" /> Edit Profile
            </button>
            <button
              type="button"
              onClick={handleShare}
              className="flex items-center gap-1.5 rounded-full bg-white/80 px-4 py-2 text-xs font-bold text-espresso-700 hover:bg-carissma-50"
            >
              <ShareIcon className="h-4 w-4" /> {shareCopied ? 'Link Copied!' : 'Share Profile'}
            </button>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-4 rounded-3xl bg-carissma-400 p-6 text-white sm:flex-row sm:items-center sm:justify-between">
          {currentPackage ? (
            <>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-carissma-100">Current Package</p>
                <p className="mt-1 text-lg font-extrabold">{currentPackage.package_name_en}</p>
                <p className="text-sm font-semibold text-carissma-50">
                  {currentPackage.credits_remaining} Game{currentPackage.credits_remaining === 1 ? '' : 's'} Left
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setTab('packages')}
                  className="rounded-full bg-white px-6 py-2.5 text-sm font-bold text-carissma-500 hover:bg-carissma-50"
                >
                  Upgrade
                </button>
                <button
                  onClick={() => navigate('/play')}
                  className="rounded-full border-2 border-white px-6 py-2.5 text-sm font-bold text-white hover:bg-white/10"
                >
                  Continue Playing
                </button>
              </div>
            </>
          ) : (
            <>
              <div>
                <p className="text-sm font-bold">You don't have an active package yet.</p>
                <p className="text-xs font-semibold text-carissma-50">Grab a package to start playing games.</p>
              </div>
              <button
                onClick={() => setTab('packages')}
                className="w-fit rounded-full bg-white px-6 py-2.5 text-sm font-bold text-carissma-500 hover:bg-carissma-50"
              >
                Browse Packages
              </button>
            </>
          )}
        </div>

        <div className="mt-8 flex flex-wrap gap-2 border-b border-carissma-200 pb-4">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                activeTab === t.key ? 'bg-carissma-400 text-white' : 'bg-white/70 text-espresso-700 hover:bg-carissma-50'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="mt-6">
          {loading && <p className="text-center text-sm font-semibold text-espresso-500">Loading…</p>}
          {!loading && activeTab === 'packages' && <PackagesTab myPackages={packages} />}
          {!loading && activeTab === 'following' && <FollowListTab userId={user.id} type="following" onChanged={loadSummary} />}
          {!loading && activeTab === 'followers' && <FollowListTab userId={user.id} type="followers" onChanged={loadSummary} />}
          {!loading && activeTab === 'orders' && <MyOrdersTab />}
          {!loading && activeTab === 'history' && <GameHistoryTab />}
        </div>
      </div>
    </SiteLayout>
  );
}
