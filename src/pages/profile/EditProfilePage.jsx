import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SiteLayout from '../../components/layout/SiteLayout';
import StickerHeading from '../../components/ui/StickerHeading';
import TextField from '../../components/ui/TextField';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import {
  changeMyPassword,
  createMyAddress,
  deleteMyAddress,
  listMyAddresses,
  updateMyAddress,
  updateMyProfile,
  uploadMyAvatar,
} from '../../api/me.api';
import { MapPinIcon, LockIcon, PencilIcon, TrashIcon } from '../../components/ui/icons';

const SUB_TABS = [
  { key: 'info', labelKey: 'profile.editProfile.subTabs.info', icon: PencilIcon },
  { key: 'address', labelKey: 'profile.editProfile.subTabs.address', icon: MapPinIcon },
  { key: 'password', labelKey: 'profile.editProfile.subTabs.password', icon: LockIcon },
];

function InfoPanel() {
  const { t } = useTranslation();
  const { user, refreshUser } = useAuth();
  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '', bio: '' });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setForm({ firstName: user.firstName || '', lastName: user.lastName || '', phone: user.phone || '', bio: user.bio || '' });
    }
  }, [user]);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const onAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      await uploadMyAvatar(file);
      await refreshUser();
    } catch {
      setError(t('profile.editProfile.info.uploadError'));
    } finally {
      setUploading(false);
    }
  };

  const onSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');
    try {
      await updateMyProfile(form);
      await refreshUser();
      setMessage(t('profile.editProfile.info.saved'));
    } catch {
      setError(t('profile.editProfile.info.saveError'));
    } finally {
      setSaving(false);
    }
  };

  const initials = (user?.firstName?.[0] || user?.fullName?.[0] || '?').toUpperCase();

  return (
    <form onSubmit={onSave} className="space-y-5 rounded-3xl border border-carissma-100 bg-white/70 p-6 sm:p-8">
      <div className="flex items-center gap-4">
        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full bg-carissma-100">
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-2xl font-extrabold text-carissma-400">{initials}</div>
          )}
        </div>
        <label className="cursor-pointer rounded-full border-2 border-carissma-400 px-5 py-2 text-sm font-bold text-carissma-500 hover:bg-carissma-50">
          {uploading ? t('profile.editProfile.info.uploading') : t('profile.editProfile.info.changePhoto')}
          <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={onAvatarChange} className="hidden" disabled={uploading} />
        </label>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField label={t('profile.editProfile.info.firstName')} value={form.firstName} onChange={update('firstName')} />
        <TextField label={t('profile.editProfile.info.lastName')} value={form.lastName} onChange={update('lastName')} />
      </div>
      <TextField label={t('profile.editProfile.info.phone')} value={form.phone} onChange={update('phone')} placeholder={t('profile.editProfile.info.phonePlaceholder')} />
      <label className="block">
        <span className="mb-2 block text-sm font-bold text-espresso-900">{t('profile.editProfile.info.bio')}</span>
        <textarea
          rows={3}
          value={form.bio}
          onChange={update('bio')}
          placeholder={t('profile.editProfile.info.bioPlaceholder')}
          className="w-full rounded-2xl border border-carissma-200 bg-white px-4 py-3 text-espresso-900 placeholder:text-carissma-300 focus:outline-none focus:ring-2 focus:ring-carissma-400"
        />
      </label>

      {message && <p className="text-sm font-semibold text-green-600">{message}</p>}
      {error && <p className="text-sm font-semibold text-carnation-600">{error}</p>}

      <Button type="submit" loading={saving}>
        {t('profile.editProfile.info.saveChanges')}
      </Button>
    </form>
  );
}

const GOVERNORATES = ['Al Asimah', 'Hawalli', 'Farwaniya', 'Mubarak Al-Kabeer', 'Ahmadi', 'Jahra'];
// Same Arabic governorate names CheckoutPage.jsx uses for the Kuwait address
// form — the stored/submitted value stays this English name unchanged,
// only the displayed <option> label switches with the site language.
const GOVERNORATE_LABELS_AR = {
  'Al Asimah': 'العاصمة',
  Hawalli: 'حولي',
  Farwaniya: 'الفروانية',
  'Mubarak Al-Kabeer': 'مبارك الكبير',
  Ahmadi: 'الأحمدي',
  Jahra: 'الجهراء',
};
const EMPTY_ADDRESS = { label: '', fullName: '', phone: '', city: GOVERNORATES[0], area: '', block: '', street: '', building: '', isDefault: false };

function AddressPanel() {
  const { t, i18n } = useTranslation();
  const [addresses, setAddresses] = useState([]);
  const [state, setState] = useState('loading');
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_ADDRESS);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = () => {
    setState('loading');
    listMyAddresses()
      .then((rows) => {
        setAddresses(rows || []);
        setState('ready');
      })
      .catch(() => setState('error'));
  };

  useEffect(load, []);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const startNew = () => {
    setEditingId(null);
    setForm(EMPTY_ADDRESS);
    setShowForm(true);
  };

  const startEdit = (address) => {
    setEditingId(address.id);
    setForm({
      label: address.label || '',
      fullName: address.full_name || '',
      phone: address.phone || '',
      city: address.city || GOVERNORATES[0],
      area: address.area || '',
      block: address.block || '',
      street: address.street || '',
      building: address.building || '',
      isDefault: Boolean(address.is_default),
    });
    setShowForm(true);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editingId) {
        await updateMyAddress(editingId, form);
      } else {
        await createMyAddress(form);
      }
      setShowForm(false);
      load();
    } catch {
      setError(t('profile.editProfile.address.saveError'));
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (id) => {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
    try {
      await deleteMyAddress(id);
    } catch {
      load();
    }
  };

  return (
    <div className="space-y-4">
      {state === 'loading' && <p className="text-sm font-semibold text-espresso-500">{t('profile.editProfile.address.loading')}</p>}
      {state === 'error' && <p className="text-sm font-semibold text-carnation-600">{t('profile.editProfile.address.loadError')}</p>}

      {state === 'ready' &&
        addresses.map((address) => (
          <div key={address.id} className="flex items-start justify-between gap-3 rounded-2xl border border-carissma-100 bg-white/70 p-4">
            <div>
              <p className="text-sm font-bold text-espresso-900">
                {address.label || t('profile.editProfile.address.addressFallback')} {address.is_default ? <span className="ms-1 text-xs font-bold text-carissma-500">{t('profile.editProfile.address.defaultTag')}</span> : null}
              </p>
              <p className="mt-1 text-sm text-espresso-600">
                {[address.building, address.street, address.block, address.area, address.city].filter(Boolean).join(', ')}
              </p>
              <p className="text-xs font-semibold text-espresso-500">
                {address.full_name} · {address.phone}
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <button onClick={() => startEdit(address)} className="rounded-full p-2 text-espresso-500 hover:bg-carissma-50 hover:text-carissma-600">
                <PencilIcon className="h-4 w-4" />
              </button>
              <button onClick={() => onDelete(address.id)} className="rounded-full p-2 text-espresso-500 hover:bg-carnation-50 hover:text-carnation-600">
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}

      {!showForm && (
        <button onClick={startNew} className="w-full rounded-2xl border-2 border-dashed border-carissma-300 py-4 text-sm font-bold text-carissma-500 hover:bg-carissma-50">
          {t('profile.editProfile.address.addNew')}
        </button>
      )}

      {showForm && (
        <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-carissma-200 bg-white p-6">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <TextField label={t('profile.editProfile.address.label')} value={form.label} onChange={update('label')} placeholder={t('profile.editProfile.address.labelPlaceholder')} />
            <TextField label={t('profile.editProfile.address.fullName')} required value={form.fullName} onChange={update('fullName')} />
            <TextField label={t('profile.editProfile.address.phone')} required value={form.phone} onChange={update('phone')} />
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-espresso-900">{t('profile.editProfile.address.governorate')}</span>
              <select
                value={form.city}
                onChange={update('city')}
                className="w-full rounded-2xl border border-carissma-200 bg-white px-4 py-3 text-espresso-900 focus:outline-none focus:ring-2 focus:ring-carissma-400"
              >
                {GOVERNORATES.map((g) => (
                  <option key={g} value={g}>{(i18n.language?.startsWith('ar') && GOVERNORATE_LABELS_AR[g]) || g}</option>
                ))}
              </select>
            </label>
            <TextField label={t('profile.editProfile.address.area')} value={form.area} onChange={update('area')} />
            <TextField label={t('profile.editProfile.address.block')} value={form.block} onChange={update('block')} />
            <TextField label={t('profile.editProfile.address.street')} value={form.street} onChange={update('street')} />
            <TextField label={t('profile.editProfile.address.building')} value={form.building} onChange={update('building')} />
          </div>
          <label className="flex items-center gap-2 text-sm font-semibold text-espresso-700">
            <input type="checkbox" checked={form.isDefault} onChange={(e) => setForm((f) => ({ ...f, isDefault: e.target.checked }))} className="h-4 w-4 accent-carissma-500" />
            {t('profile.editProfile.address.setDefault')}
          </label>

          {error && <p className="text-sm font-semibold text-carnation-600">{error}</p>}

          <div className="flex gap-3">
            <Button type="submit" loading={saving}>
              {editingId ? t('profile.editProfile.address.saveAddress') : t('profile.editProfile.address.addAddress')}
            </Button>
            <button type="button" onClick={() => setShowForm(false)} className="shrink-0 rounded-full border-2 border-carissma-200 px-6 py-3.5 font-bold text-espresso-600 hover:bg-linen-50">
              {t('common.cancel')}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function PasswordPanel() {
  const { t } = useTranslation();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    if (form.newPassword.length < 8) return setError(t('profile.editProfile.password.tooShort'));
    if (form.newPassword !== form.confirmPassword) return setError(t('profile.editProfile.password.mismatch'));
    setSaving(true);
    try {
      await changeMyPassword({ currentPassword: form.currentPassword, newPassword: form.newPassword });
      setMessage(t('profile.editProfile.password.saved'));
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err?.response?.data?.message || t('profile.editProfile.password.genericError'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5 rounded-3xl border border-carissma-100 bg-white/70 p-6 sm:p-8">
      <TextField label={t('profile.editProfile.password.current')} type="password" required value={form.currentPassword} onChange={update('currentPassword')} />
      <TextField label={t('profile.editProfile.password.newPassword')} type="password" required value={form.newPassword} onChange={update('newPassword')} />
      <TextField label={t('profile.editProfile.password.confirm')} type="password" required value={form.confirmPassword} onChange={update('confirmPassword')} />

      {message && <p className="text-sm font-semibold text-green-600">{message}</p>}
      {error && <p className="text-sm font-semibold text-carnation-600">{error}</p>}

      <Button type="submit" loading={saving}>
        {t('profile.editProfile.password.update')}
      </Button>
    </form>
  );
}

export default function EditProfilePage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = SUB_TABS.some((tab) => tab.key === searchParams.get('section')) ? searchParams.get('section') : 'info';

  return (
    <SiteLayout>
      <div className="mx-auto max-w-4xl px-6 py-10 sm:px-8">
        <div className="flex items-center justify-between">
          <StickerHeading as="h1" className="text-2xl">
            {t('profile.editProfile.title')}
          </StickerHeading>
          <Link to="/profile" className="text-sm font-bold text-carissma-600 hover:underline">
            {t('common.back')}
          </Link>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {SUB_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSearchParams({ section: tab.key })}
              className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold transition ${
                activeTab === tab.key ? 'bg-carissma-400 text-white' : 'bg-white/70 text-espresso-700 hover:bg-carissma-50'
              }`}
            >
              <tab.icon className="h-4 w-4" /> {t(tab.labelKey)}
            </button>
          ))}
        </div>

        <div className="mt-6">
          {activeTab === 'info' && <InfoPanel />}
          {activeTab === 'address' && <AddressPanel />}
          {activeTab === 'password' && <PasswordPanel />}
        </div>
      </div>
    </SiteLayout>
  );
}
