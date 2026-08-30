import { useState } from 'react';
import SiteLayout from '../components/layout/SiteLayout';
import TextField from '../components/ui/TextField';
import Button from '../components/ui/Button';
import { submitContactForm } from '../api/content.api';

export default function ContactUsPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState('');

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
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch {
      setServerError('Something went wrong sending your message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SiteLayout>
      <div className="mx-auto max-w-2xl px-8 py-16">
        <h1 className="text-3xl font-bold text-espresso-900">Get in touch</h1>
        <p className="mt-2 text-espresso-500">Questions, feedback, or partnership ideas — we'd love to hear from you.</p>

        {sent ? (
          <div className="mt-10 rounded-3xl border border-carissma-200 bg-carissma-50 p-8 text-center">
            <h2 className="text-xl font-semibold text-carissma-700">Message sent!</h2>
            <p className="mt-2 text-espresso-600">Thanks for reaching out — our team will get back to you soon.</p>
            <button onClick={() => setSent(false)} className="mt-4 font-semibold text-carissma-600 hover:underline">
              Send another message
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-10 space-y-5">
            <TextField label="Name" value={form.name} onChange={update('name')} error={errors.name} placeholder="Your name" />
            <TextField label="Email" type="email" value={form.email} onChange={update('email')} error={errors.email} placeholder="you@example.com" />
            <TextField label="Phone (optional)" value={form.phone} onChange={update('phone')} placeholder="+965 ..." />
            <TextField label="Subject (optional)" value={form.subject} onChange={update('subject')} placeholder="What's this about?" />
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-espresso-800">Message</span>
              <textarea
                rows={5}
                value={form.message}
                onChange={update('message')}
                placeholder="How can we help?"
                className={`w-full rounded-2xl border px-4 py-3 text-espresso-900 placeholder:text-espresso-400
                  focus:outline-none focus:ring-2 focus:ring-carissma-500
                  ${errors.message ? 'border-carnation-500' : 'border-linen-300'}`}
              />
              {errors.message && <span className="mt-1 block text-xs text-carnation-600">{errors.message}</span>}
            </label>

            {serverError && <p className="text-sm text-carnation-600">{serverError}</p>}

            <Button type="submit" loading={loading}>Send message</Button>
          </form>
        )}
      </div>
    </SiteLayout>
  );
}
