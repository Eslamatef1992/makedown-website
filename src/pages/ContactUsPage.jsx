import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import SiteLayout from '../components/layout/SiteLayout';
import StickerHeading from '../components/ui/StickerHeading';
import TextField from '../components/ui/TextField';
import Button from '../components/ui/Button';
import { MailIcon, PhoneIcon } from '../components/ui/icons';
import { submitContactForm, getContactInfo, listSocialLinks } from '../api/content.api';

const SOCIAL_ICONS = {
  facebook: '/icons/social-facebook.svg',
  instagram: '/icons/social-instagram.svg',
  twitter: '/icons/social-twitter.svg',
  x: '/icons/social-twitter.svg',
};

function InfoRow({ icon, label, value, href }) {
  if (!value) return null;
  const Content = (
    <div className="flex items-center gap-3">
      <span className="flex h-12 w-12 flex-none items-center justify-center rounded-full bg-carissma-400 text-white">
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block text-xs font-bold text-carissma-400">{label}</span>
        <span className="block truncate text-sm font-extrabold text-espresso-900 sm:text-base">{value}</span>
      </span>
    </div>
  );
  return href ? (
    <a href={href} className="block hover:opacity-90">
      {Content}
    </a>
  ) : (
    Content
  );
}

export default function ContactUsPage() {
  const { t } = useTranslation();
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState('');

  const [contactInfo, setContactInfo] = useState(null);
  const [socialLinks, setSocialLinks] = useState([]);

  useEffect(() => {
    getContactInfo().then(setContactInfo).catch(() => {});
    listSocialLinks().then((rows) => setSocialLinks(rows || [])).catch(() => {});
  }, []);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.name || form.name.trim().length < 2) errs.name = t('contactUs.errors.name');
    if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = t('contactUs.errors.email');
    if (!form.message || form.message.trim().length < 5) errs.message = t('contactUs.errors.message');
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;
    setLoading(true);
    try {
      await submitContactForm(form);
      setSent(true);
      setForm({ name: '', email: '', phone: '', message: '' });
    } catch {
      setServerError(t('contactUs.errors.generic'));
    } finally {
      setLoading(false);
    }
  };

  const socials =
    socialLinks.length > 0
      ? socialLinks
      : [
          { id: 'fb', platform: 'facebook', url: '#' },
          { id: 'ig', platform: 'instagram', url: '#' },
          { id: 'tw', platform: 'twitter', url: '#' },
        ];

  return (
    <SiteLayout>
      <div className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 lg:px-10 sm:py-14">
        <div className="relative text-center">
          <span className="pointer-events-none absolute end-[18%] top-0 text-xl text-saffron-400" aria-hidden="true">✦</span>
          <StickerHeading as="h1" className="text-3xl sm:text-4xl">
            {t('contactUs.title')}
          </StickerHeading>
        </div>

        {/* Contact info card */}
        <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-center gap-3">
            <span className="h-px flex-1 bg-carissma-100" />
            <span className="text-xs font-bold uppercase tracking-wide text-carissma-400">{t('contactUs.sectionLabel')}</span>
            <span className="h-px flex-1 bg-carissma-100" />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-x-10 gap-y-6 sm:grid-cols-2">
            <InfoRow
              icon={<MailIcon className="h-5 w-5" />}
              label={t('contactUs.companyEmail')}
              value={contactInfo?.companyEmail}
              href={contactInfo?.companyEmail ? `mailto:${contactInfo.companyEmail}` : undefined}
            />
            <InfoRow
              icon={<PhoneIcon className="h-5 w-5" />}
              label={t('contactUs.phoneNumber')}
              value={contactInfo?.phone}
              href={contactInfo?.phone ? `tel:${contactInfo.phone}` : undefined}
            />
            <InfoRow
              icon={<MailIcon className="h-5 w-5" />}
              label={t('contactUs.supportEmail')}
              value={contactInfo?.supportEmail}
              href={contactInfo?.supportEmail ? `mailto:${contactInfo.supportEmail}` : undefined}
            />
            <div>
              <span className="block text-xs font-bold text-carissma-400">{t('contactUs.socialMediaLinks')}</span>
              <div className="mt-2 flex items-center gap-2.5">
                {socials.map((l) => (
                  <a
                    key={l.id}
                    href={l.url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={l.platform}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-carissma-50 hover:bg-carissma-100"
                  >
                    <img src={SOCIAL_ICONS[l.platform] || SOCIAL_ICONS.facebook} alt={l.platform} className="h-9 w-9" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Get in touch form card */}
        {sent ? (
          <div className="mt-6 rounded-3xl bg-white p-8 text-center shadow-sm sm:p-12">
            <h2 className="text-xl font-bold text-carissma-600">{t('contactUs.messageSent')}</h2>
            <p className="mt-2 text-espresso-600">{t('contactUs.messageSentBody')}</p>
            <button onClick={() => setSent(false)} className="mt-4 font-bold text-carissma-600 hover:underline">
              {t('contactUs.sendAnother')}
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-6 rounded-3xl bg-white p-6 shadow-sm sm:p-10">
            <StickerHeading as="h2" className="text-center text-2xl sm:text-3xl">
              {t('contactUs.getInTouch')}
            </StickerHeading>

            <div className="mx-auto mt-8 max-w-2xl space-y-5">
              <TextField
                label={t('contactUs.name')}
                value={form.name}
                onChange={update('name')}
                error={errors.name}
                placeholder={t('contactUs.namePlaceholder')}
              />
              <TextField
                label={t('contactUs.email')}
                type="email"
                value={form.email}
                onChange={update('email')}
                error={errors.email}
                placeholder={t('contactUs.emailPlaceholder')}
              />

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-espresso-900">{t('contactUs.phoneNumber')}</span>
                <div className="flex items-stretch overflow-hidden rounded-2xl border border-carissma-200 bg-white focus-within:ring-2 focus-within:ring-carissma-400">
                  <span className="flex flex-none items-center gap-1.5 bg-carissma-100 px-3.5 text-sm font-bold text-espresso-800">
                    🇰🇼 +965
                  </span>
                  <input
                    value={form.phone}
                    onChange={update('phone')}
                    placeholder={t('contactUs.phonePlaceholder')}
                    className="w-full border-0 bg-white px-4 py-3 text-espresso-900 placeholder:text-carissma-300 focus:outline-none"
                  />
                </div>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-espresso-900">{t('contactUs.message')}</span>
                <textarea
                  rows={5}
                  value={form.message}
                  onChange={update('message')}
                  placeholder={t('contactUs.messagePlaceholder')}
                  className={`w-full rounded-2xl border bg-white px-4 py-3 text-espresso-900 placeholder:text-carissma-300
                    focus:outline-none focus:ring-2 focus:ring-carissma-400
                    ${errors.message ? 'border-carnation-500' : 'border-carissma-200'}`}
                />
                {errors.message && <span className="mt-1 block text-xs text-carnation-600">{errors.message}</span>}
              </label>

              {serverError && <p className="text-sm text-carnation-600">{serverError}</p>}

              <Button type="submit" loading={loading}>
                {t('contactUs.submit')}
              </Button>
            </div>
          </form>
        )}
      </div>
    </SiteLayout>
  );
}
