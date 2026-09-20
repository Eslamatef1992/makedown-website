import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SiteLayout from '../../components/layout/SiteLayout';
import StickerHeading from '../../components/ui/StickerHeading';
import { getUserProfile } from '../../api/me.api';

export default function UserProfilePage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [state, setState] = useState('loading');

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
        </div>
      </div>
    </SiteLayout>
  );
}
