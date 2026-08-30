import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
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
  { key: 'info', label: 'Change Info', icon: PencilIcon },
  { key: 'address', label: 'Change Address', icon: MapPinIcon },
  { key: 'password', label: 'Change Password', icon: LockIcon },
];

function InfoPanel() {
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
      setError('Could not upload that image. Please try a smaller PNG/JPG/WEBP.');
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
      setMessage('Profile updated!');
    } catch {
      setError('Could not save your changes. Please try again.');
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
          {uploading ? 'Uploading…' : 'Change Photo'}
          <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={onAvatarChange} className="hidden" disabled={uploading} />
        </label>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField label="First Name" value={form.firstName} onChange={update('firstName')} />
        <TextField label="Last Name" value={form.lastName} onChange={update('lastName')} />
      </div>
      <TextField label="Phone" value={form.phone} onChange={update('phone')} placeholder="+965 ..." />
      <label className="block">
        <span className="mb-2 block text-sm font-bold text-espresso-900">Bio</span>
        <textarea
          rows={3}
          value={form.bio}
          onChange={update('bio')}
          placeholder="Tell people a bit about yourself"
          className="w-full rounded-2xl border border-carissma-200 bg-white px-4 py-3 text-espresso-900 placeholder:text-carissma-300 focus:outline-none focus:ring-2 focus:ring-carissma-400"
        />
      </label>

      {message && <p className="text-sm font-semibold text-green-600">{message}</p>}
      {error && <p className="text-sm font-semibold text-carnation-600">{error}</p>}

      <Button type="submit" loading={saving}>
        Save Changes
      </Button>
    </form>
  );
}

const GOVERNORATES = ['Al Asimah', 'Hawalli', 'Farwaniya', 'Mubarak Al-Kabeer', 'Ahmadi', 'Jahra'];
const EMPTY_ADDRESS = { label: '', fullName: '', phone: '', city: GOVERNORATES[0], area: '', block: '', street: '', building: '', isDefault: false };

function AddressPanel() {
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
      setError('Could not save this address. Please check the required fields.');
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
      {state === 'loading' && <p className="text-sm font-semibold text-espresso-500">Loading addresses…</p>}
      {state === 'error' && <p className="text-sm font-semibold text-carnation-600">Couldn't load your addresses right now.</p>}

      {state === 'ready' &&
        addresses.map((address) => (
          <div key={address.id} className="flex items-start justify-between gap-3 rounded-2xl border border-carissma-100 bg-white/70 p-4">
            <div>
              <p className="text-sm font-bold text-espresso-900">
                {address.label || 'Address'} {address.is_default ? <span className="ms-1 text-xs font-bold text-carissma-500">(Default)</span> : null}
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
          + Add New Address
        </button>
      )}

      {showForm && (
        <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-carissma-200 bg-white p-6">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <TextField label="Label" value={form.label} onChange={update('label')} placeholder="Home, Work…" />
            <TextField label="Full Name" required value={form.fullName} onChange={update('fullName')} />
            <TextField label="Phone" required value={form.phone} onChange={update('phone')} />
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-espresso-900">Governorate</span>
              <select
                value={form.city}
                onChange={update('city')}
                className="w-full rounded-2xl border border-carissma-200 bg-white px-4 py-3 text-espresso-900 focus:outline-none focus:ring-2 focus:ring-carissma-400"
              >
                {GOVERNORATES.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </label>
            <TextField label="Area" value={form.area} onChange={update('area')} />
            <TextField label="Block" value={form.block} onChange={update('block')} />
            <TextField label="Street" value={form.street} onChange={update('street')} />
            <TextField label="Building" value={form.building} onChange={update('building')} />
          </div>
          <label className="flex items-center gap-2 text-sm font-semibold text-espresso-700">
            <input type="checkbox" checked={form.isDefault} onChange={(e) => setForm((f) => ({ ...f, isDefault: e.target.checked }))} className="h-4 w-4 accent-carissma-500" />
            Set as default address
          </label>

          {error && <p className="text-sm font-semibold text-carnation-600">{error}</p>}

          <div className="flex gap-3">
            <Button type="submit" loading={saving}>
              {editingId ? 'Save Address' : 'Add Address'}
            </Button>
            <button type="button" onClick={() => setShowForm(false)} className="shrink-0 rounded-full border-2 border-carissma-200 px-6 py-3.5 font-bold text-espresso-600 hover:bg-linen-50">
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function PasswordPanel() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    if (form.newPassword.length < 8) return setError('New password must be at least 8 characters.');
    if (form.newPassword !== form.confirmPassword) return setError("New passwords don't match.");
    setSaving(true);
    try {
      await changeMyPassword({ currentPassword: form.currentPassword, newPassword: form.newPassword });
      setMessage('Password changed!');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not change your password.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5 rounded-3xl border border-carissma-100 bg-white/70 p-6 sm:p-8">
      <TextField label="Current Password" type="password" required value={form.currentPassword} onChange={update('currentPassword')} />
      <TextField label="New Password" type="password" required value={form.newPassword} onChange={update('newPassword')} />
      <TextField label="Confirm New Password" type="password" required value={form.confirmPassword} onChange={update('confirmPassword')} />

      {message && <p className="text-sm font-semibold text-green-600">{message}</p>}
      {error && <p className="text-sm font-semibold text-carnation-600">{error}</p>}

      <Button type="submit" loading={saving}>
        Update Password
      </Button>
    </form>
  );
}

export default function EditProfilePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = SUB_TABS.some((t) => t.key === searchParams.get('section')) ? searchParams.get('section') : 'info';

  return (
    <SiteLayout>
      <div className="mx-auto max-w-2xl px-6 py-10 sm:px-8">
        <div className="flex items-center justify-between">
          <StickerHeading as="h1" className="text-2xl">
            Edit Profile
          </StickerHeading>
          <Link to="/profile" className="text-sm font-bold text-carissma-600 hover:underline">
            Back
          </Link>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {SUB_TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setSearchParams({ section: t.key })}
              className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold transition ${
                activeTab === t.key ? 'bg-carissma-400 text-white' : 'bg-white/70 text-espresso-700 hover:bg-carissma-50'
              }`}
            >
              <t.icon className="h-4 w-4" /> {t.label}
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
