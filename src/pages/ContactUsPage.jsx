import { useEffect, useState } from 'react';
import SiteLayout from '../components/layout/SiteLayout';
import StickerHeading from '../components/ui/StickerHeading';
import TextField from '../components/ui/TextField';
import Button from '../components/ui/Button';
import { submitContactForm, getContactInfo, listSocialLinks } from '../api/content.api';

function InfoCard({ label, value, href }) {
  if (!value) return null;
  return (
    <div className="rounded-2xl border border-carissma-100 bg-white/70 p-5 text-center">
      <p className="text-xs font-bold uppercase tracking-wide text-carissma-400">{label}</p>
      {href ? (
        <a href={href} className="mt-1 block truncate text-sm font-bold text-espresso-900 hover:text-carissma-600">
          {value}
        </a>
      ) : (
        <p className="mt-1 truncate text-sm font-bold text-espresso-900">{value}</p>
      )}
    </div>
  );
}

export default function ContactUsPage() {
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
    if (!form.name || form.name.trim().length < 2) errs.name = 'Please enter your name.';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = 'Please enter a valid email.';
    if (!form.message || form.message.trim().length < 5) errs.message = 'Please enter a message.';
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
      setServerError('Something went wrong sending your message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SiteLayout>
      <div className="mx-auto max-w-3xl px-6 py-12 sm:px-8 sm:py-16">
        <div className="text-center">
          <StickerHeading as="h1" className="text-2xl sm:text-3xl">
            Contact Us
          </StickerHeading>
          <p className="mt-2 text-espresso-600">Questions, feedback, or partnership ideas — we'd love to hear from you.</p>
        </div>

        {(contactInfo?.companyEmail || contactInfo?.supportEmail || contactInfo?.phone) && (
          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <InfoCard label="Company Email" value={contactInfo?.companyEmail} href={contactInfo?.companyEmail ? `mailto:${contactInfo.companyEmail}` : undefined} />
            <InfoCard label="Support Email" value={contactInfo?.supportEmail} href={contactInfo?.supportEmail ? `mailto:${contactInfo.supportEmail}` : undefined} />
            <InfoCard label="Phone" value={contactInfo?.phone} href={contactInfo?.phone ? `tel:${contactInfo.phone}` : undefined} />
          </div>
        )}

        {socialLinks.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            {socialLinks.map((s) => (
              <a
                key={s.id}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-white/70 px-4 py-2 text-xs font-bold text-espresso-700 hover:text-carissma-600"
              >
                {s.platform}
              </a>
            ))}
          </div>
        )}

        {sent ? (
          <div className="mt-10 rounded-3xl border border-carissma-200 bg-carissma-50 p-8 text-center">
            <h2 className="text-xl font-bold text-carissma-700">Message sent!</h2>
            <p className="mt-2 text-espresso-600">Thanks for reaching out — our team will get back to you soon.</p>
            <button onClick={() => setSent(false)} className="mt-4 font-bold text-carissma-600 hover:underline">
              Send another message
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-10 space-y-5 rounded-3xl border border-carissma-100 bg-white/70 p-6 sm:p-8">
            <h2 className="text-lg font-extrabold text-espresso-900">Get In Touch</h2>
            <TextField label="Name" value={form.name} onChange={update('name')} error={errors.name} placeholder="Your name" />
            <TextField label="Email" type="email" value={form.email} onChange={update('email')} error={errors.email} placeholder="you@example.com" />
            <TextField label="Phone (optional)" value={form.phone} onChange={update('phone')} placeholder="+965 ..." />
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-espresso-900">Message</span>
              <textarea
                rows={5}
                value={form.message}
                onChange={update('message')}
                placeholder="How can we help?"
                className={`w-full rounded-2xl border bg-white px-4 py-3 text-espresso-900 placeholder:text-carissma-300
                  focus:outline-none focus:ring-2 focus:ring-carissma-400
                  ${errors.message ? 'border-carnation-500' : 'border-carissma-200'}`}
              />
              {errors.message && <span className="mt-1 block text-xs text-carnation-600">{errors.message}</span>}
            </label>

            {serverError && <p className="text-sm text-carnation-600">{serverError}</p>}

            <Button type="submit" loading={loading}>Send Message</Button>
          </form>
        )}
      </div>
    </SiteLayout>
  );
}
