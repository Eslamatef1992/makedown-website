import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PlayModalLayout, { PlayCard } from './components/PlayModalLayout';
import StickerHeading from '../../components/ui/StickerHeading';
import Button from '../../components/ui/Button';
import { CopyIcon, ChevronDownIcon, UserIcon } from '../../components/ui/icons';
import { getGame, matchRandomOpponent, searchInvitees, sendInvite } from '../../api/play.api';

export default function InvitePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [session, setSession] = useState(null);
  const [view, setView] = useState('start'); // 'start' | 'link'
  const [matching, setMatching] = useState(false);

  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [invited, setInvited] = useState([]);
  const [copied, setCopied] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    getGame(id).then(setSession).catch(() => {});
  }, [id]);

  const joinLink = session ? `${window.location.origin}/play/join/${session.join_code}` : '';

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(joinLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard may be unavailable (older browser/permissions) — the link is still visible to select manually.
    }
  };

  const onSearch = (value) => {
    setQuery(value);
    setDropdownOpen(true);
    clearTimeout(debounceRef.current);
    if (!value.trim()) {
      setResults([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      try {
        setResults(await searchInvitees(id, value.trim()));
      } catch {
        setResults([]);
      }
    }, 300);
  };

  const invite = async (userId) => {
    try {
      await sendInvite(id, userId);
      setInvited((s) => [...s, userId]);
    } catch {
      // Already invited or no longer available — ignore, the button already reflects the attempt.
    }
  };

  const onRandomUser = async () => {
    setMatching(true);
    try {
      const result = await matchRandomOpponent(id);
      navigate(`/play/sessions/${result.matchedSessionId}/lobby`);
    } finally {
      setMatching(false);
    }
  };

  const goToLobby = () => navigate(`/play/sessions/${id}/lobby`);

  return (
    <PlayModalLayout onBack={() => (view === 'link' ? setView('start') : navigate(-1))} backLabel={t('common.back')} backStyle="link">
      {view === 'start' ? (
        <div className="w-full max-w-2xl rounded-[2.5rem] border-4 border-carissma-300 bg-carissma-50/95 p-10 text-center shadow-lg">
          <StickerHeading as="h2" className="text-3xl">
            {t('play.invite.startPlayWith')}
          </StickerHeading>
          <div className="mt-12 flex gap-4">
            <button
              onClick={onRandomUser}
              disabled={matching}
              className="flex-1 rounded-full bg-carissma-100 py-5 text-base font-extrabold text-carissma-600 hover:bg-carissma-200 disabled:opacity-60"
            >
              {matching ? t('play.invite.matching') : t('play.invite.randomUser')}
            </button>
            <button
              onClick={() => setView('link')}
              className="flex-1 rounded-full bg-carissma-500 py-5 text-base font-extrabold text-white hover:bg-carissma-600"
            >
              {t('play.invite.sendInvitation')}
            </button>
          </div>
        </div>
      ) : (
        <PlayCard maxWidth="max-w-2xl" border="border-4 border-carissma-300" radius="rounded-[2.5rem]" className="text-start">
          <StickerHeading as="h2" className="text-center text-2xl">
            {t('play.invite.gameLink')}
          </StickerHeading>

          <div className="mt-6">
            <span className="mb-1.5 block text-sm font-bold text-espresso-900">{t('play.invite.shareGameLink')}</span>
            <div className="flex items-stretch gap-2">
              <input
                readOnly
                value={joinLink}
                className="w-full truncate rounded-2xl border border-carissma-200 bg-white px-4 py-2.5 text-sm text-carissma-500"
              />
              <button
                onClick={copyLink}
                className="flex flex-none items-center justify-center rounded-2xl bg-carissma-500 px-3 text-white hover:bg-carissma-600"
                aria-label={t('play.invite.copyLink')}
              >
                <CopyIcon className="h-5 w-5" />
              </button>
            </div>
            {copied && <span className="mt-1 block text-xs font-bold text-carissma-600">{t('play.invite.copied')}</span>}
          </div>

          <div className="my-5 flex items-center gap-3">
            <span className="h-px flex-1 bg-carissma-100" />
            <span className="text-xs font-bold text-carissma-400">{t('play.invite.or')}</span>
            <span className="h-px flex-1 bg-carissma-100" />
          </div>

          <div className="relative">
            <span className="mb-1.5 block text-sm font-bold text-espresso-900">{t('play.invite.userName')}</span>
            <div className="relative">
              <input
                value={query}
                onChange={(e) => onSearch(e.target.value)}
                onFocus={() => setDropdownOpen(true)}
                placeholder={t('play.invite.userNamePlaceholder')}
                className="w-full rounded-2xl border border-carissma-200 bg-white px-4 py-2.5 pe-10 text-sm text-espresso-900 placeholder:text-carissma-300"
              />
              <ChevronDownIcon className={`pointer-events-none absolute inset-y-0 end-3 my-auto h-4 w-4 text-carissma-400 transition ${dropdownOpen ? 'rotate-180' : ''}`} />
            </div>

            {dropdownOpen && results.length > 0 && (
              <div className="absolute z-10 mt-2 w-full space-y-2 rounded-2xl border border-carissma-100 bg-white p-3 shadow-lg">
                {results.map((u) => (
                  <div key={u.id} className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2">
                      {u.avatar_url ? (
                        <img src={u.avatar_url} alt="" className="h-8 w-8 rounded-full object-cover" />
                      ) : (
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-carissma-100 text-carissma-500">
                          <UserIcon className="h-4 w-4" />
                        </span>
                      )}
                      <span className="text-sm font-bold text-espresso-900">{u.full_name}</span>
                    </span>
                    <button
                      onClick={() => invite(u.id)}
                      disabled={invited.includes(u.id)}
                      className="rounded-full bg-carissma-100 px-3 py-1 text-xs font-bold text-carissma-600 hover:bg-carissma-200 disabled:opacity-60"
                    >
                      {invited.includes(u.id) ? t('play.invite.invited') : t('play.invite.add')}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button className="mt-6" onClick={goToLobby}>
            {t('play.invite.sendInvitation')}
          </Button>
        </PlayCard>
      )}
    </PlayModalLayout>
  );
}
