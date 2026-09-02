import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import SiteLayout from '../../components/layout/SiteLayout';
import { useAuth } from '../../context/AuthContext';
import { getUserProfile, listMyPackages, uploadMyAvatar } from '../../api/me.api';
import { ChatBubbleIcon, PencilIcon, ShareIcon } from '../../components/ui/icons';

import PackagesTab from './tabs/PackagesTab';
import FollowListTab from './tabs/FollowListTab';
import MyOrdersTab from './tabs/MyOrdersTab';
import GameHistoryTab from './tabs/GameHistoryTab';

// Matches PackageCard.jsx's sticker-style outline exactly, so the "Current
// Package" summary card's pink text reads consistently with the package
// tiles below it (Standard / Perineum / VIP).
const STICKER_SHADOW = {
  textShadow: '2px 0 0 #fff, -2px 0 0 #fff, 0 2px 0 #fff, 0 -2px 0 #fff, 2px 2px 0 #fff, -2px -2px 0 #fff, 2px -2px 0 #fff, -2px 2px 0 #fff',
};

const TABS = [
  { key: 'packages', label: 'Packages' },
  { key: 'following', label: 'My Following' },
  { key: 'followers', label: 'My Followers' },
  { key: 'orders', label: 'My Orders' },
  { key: 'history', label: 'Game History' },
];

function Avatar({ user, size = 'h-24 w-24', editable = false, onUploaded }) {
  const { refreshUser } = useAuth();
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);
  const initials = (user?.firstName?.[0] || user?.fullName?.[0] || '?').toUpperCase();

  const onPick = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploading(true);
    try {
      await uploadMyAvatar(file);
      await refreshUser();
      onUploaded?.();
    } catch {
      // Upload failed (bad format, network) — the photo just stays as-is.
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={`relative ${size} shrink-0`}>
      <div className="h-full w-full overflow-hidden rounded-full border-4 border-white bg-carissma-100 shadow-md">
        {user?.avatarUrl ? (
          <img src={user.avatarUrl} alt={user.fullName || 'Profile photo'} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-3xl font-extrabold text-carissma-400">
            {initials}
          </div>
        )}
      </div>
      {editable && (
        <label className="absolute bottom-0 end-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-carissma-500 text-white shadow-md hover:bg-carissma-600">
          <PencilIcon className="h-4 w-4" />
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            onChange={onPick}
            className="hidden"
            disabled={uploading}
          />
        </label>
      )}
      {uploading && (
        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/30 text-xs font-bold text-white">…</div>
      )}
    </div>
  );
}

function StatBox({ label, value, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-w-[6.5rem] flex-col items-center gap-1 rounded-2xl px-5 py-2.5 text-center shadow-sm transition ${
        active ? 'bg-white' : 'bg-white/70 hover:bg-white'
      }`}
    >
      <span className="text-sm font-bold text-espresso-900">{label}</span>
      <span className="text-2xl font-extrabold text-carissma-600">{value ?? 0}</span>
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
      <div className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 lg:px-10">
        <div className="flex flex-col gap-6 rounded-[2rem] bg-gradient-to-br from-carissma-50 via-carissma-50 to-carissma-200 p-6 shadow-sm sm:p-8 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
          <div className="flex items-center gap-4">
            <Avatar user={user} editable onUploaded={loadSummary} />
            <div className="min-w-0 text-start">
              <p className="truncate text-lg font-extrabold text-espresso-900">{user.fullName || user.firstName}</p>
              {profile?.bio && <p className="mt-0.5 max-w-xs truncate text-sm font-medium text-espresso-500">{profile.bio}</p>}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <StatBox label="Following" value={profile?.followingCount} active={activeTab === 'following'} onClick={() => setTab('following')} />
            <StatBox label="Followers" value={profile?.followersCount} active={activeTab === 'followers'} onClick={() => setTab('followers')} />
          </div>

          <div className="flex flex-col gap-2 sm:w-72">
            <button
              type="button"
              onClick={() => navigate('/profile/chat')}
              className="flex items-center justify-center gap-1.5 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-espresso-700 shadow-sm hover:bg-carissma-50"
            >
              <ChatBubbleIcon className="h-4 w-4 text-carissma-500" /> Chats
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => navigate('/profile/edit')}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-white px-4 py-2.5 text-xs font-bold text-espresso-700 shadow-sm hover:bg-carissma-50"
              >
                Edit Profile
              </button>
              <button
                type="button"
                onClick={handleShare}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-white px-4 py-2.5 text-xs font-bold text-espresso-700 shadow-sm hover:bg-carissma-50"
              >
                {shareCopied ? 'Link Copied!' : 'Share Profile'}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-[2rem] bg-gradient-to-br from-carissma-50 to-carissma-200 p-6 shadow-sm sm:p-8">
          {currentPackage ? (
            <>
              <p className="text-sm font-bold text-espresso-900">Current Package</p>
              <p className="mt-1 text-2xl font-extrabold text-carissma-400" style={STICKER_SHADOW}>
                {currentPackage.package_name_en}
              </p>
              <p className="mt-3 text-lg font-extrabold text-carissma-400" style={STICKER_SHADOW}>
                Games Left {currentPackage.credits_remaining} Game{currentPackage.credits_remaining === 1 ? '' : 's'}
              </p>
              <p className="mt-2 text-sm font-bold text-espresso-900">Keep Playing And Enjoy The Rest Of Your Package.</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={() => setTab('packages')}
                  className="rounded-full bg-white px-6 py-3 text-sm font-bold text-carissma-400 hover:bg-carissma-50"
                >
                  Upgrade Package
                </button>
                {currentPackage.credits_remaining > 0 ? (
                  <button
                    onClick={() => navigate('/play')}
                    className="rounded-full bg-carissma-400 px-6 py-3 text-sm font-bold text-white hover:bg-carissma-500"
                  >
                    Continue Playing
                  </button>
                ) : (
                  <button
                    onClick={() => navigate(`/profile/packages/${currentPackage.package_id}/purchase`)}
                    className="rounded-full bg-carissma-400 px-6 py-3 text-sm font-bold text-white hover:bg-carissma-500"
                  >
                    Renew
                  </button>
                )}
              </div>
            </>
          ) : (
            <>
              <p className="text-sm font-bold text-espresso-900">You don't have an active package yet.</p>
              <p className="mt-1 text-sm font-semibold text-espresso-600">Grab a package to start playing games.</p>
              <button
                onClick={() => setTab('packages')}
                className="mt-6 w-fit rounded-full bg-carissma-400 px-6 py-3 text-sm font-bold text-white hover:bg-carissma-500"
              >
                Browse Packages
              </button>
            </>
          )}
        </div>

        <div className="mt-8 flex flex-wrap gap-1 rounded-full bg-carissma-400 p-1.5">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`rounded-full px-4 py-2.5 text-sm font-bold transition ${
                activeTab === t.key ? 'bg-white text-carissma-600 shadow-sm' : 'text-white hover:bg-white/10'
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
