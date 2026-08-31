import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import SiteLayout from '../../components/layout/SiteLayout';
import StickerHeading from '../../components/ui/StickerHeading';
import { useAuth } from '../../context/AuthContext';
import { listMyChatThreads, listThreadMessages, sendThreadMessage } from '../../api/me.api';
import { connectSocket, getSocket } from '../../lib/socket';
import { ChevronLeftIcon, SendIcon } from '../../components/ui/icons';

function ThreadRow({ thread, active, onClick }) {
  const initials = (thread.other_user_name?.[0] || '?').toUpperCase();
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-start transition ${active ? 'bg-carissma-100' : 'hover:bg-carissma-50'}`}
    >
      <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full bg-carissma-100">
        {thread.other_user_avatar ? (
          <img src={thread.other_user_avatar} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm font-extrabold text-carissma-400">{initials}</div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-espresso-900">{thread.other_user_name || 'Unknown'}</p>
        <p className="truncate text-xs font-medium text-espresso-500">{thread.last_message || 'Say hello!'}</p>
      </div>
      {thread.unread_count > 0 && (
        <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-carissma-400 px-1.5 text-[10px] font-bold text-white">
          {thread.unread_count}
        </span>
      )}
    </button>
  );
}

export default function ChatPage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeThreadId = searchParams.get('thread') ? Number(searchParams.get('thread')) : null;

  const [threads, setThreads] = useState([]);
  const [threadsState, setThreadsState] = useState('loading');
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  const loadThreads = () => {
    setThreadsState('loading');
    listMyChatThreads()
      .then((rows) => {
        setThreads(rows || []);
        setThreadsState('ready');
      })
      .catch(() => setThreadsState('error'));
  };

  useEffect(loadThreads, []);

  useEffect(() => {
    if (!activeThreadId) {
      setMessages([]);
      return;
    }
    setMessagesLoading(true);
    listThreadMessages(activeThreadId)
      .then((rows) => setMessages(rows || []))
      .catch(() => setMessages([]))
      .finally(() => setMessagesLoading(false));
  }, [activeThreadId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Live delivery: join the socket room for this user, listen for new
  // messages pushed by chat.controller.js, and merge them straight in.
  useEffect(() => {
    const token = localStorage.getItem('md_access_token');
    if (!token) return undefined;
    connectSocket(token);
    const socket = getSocket();

    const onMessage = (msg) => {
      if (msg.threadId === activeThreadId) {
        setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
      }
      loadThreads();
    };
    socket.on('chat:message', onMessage);
    return () => socket.off('chat:message', onMessage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeThreadId]);

  const activeThread = threads.find((t) => t.id === activeThreadId);

  const onSend = async (e) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text || !activeThreadId || sending) return;
    setSending(true);
    setDraft('');
    try {
      const saved = await sendThreadMessage(activeThreadId, text);
      setMessages((prev) => [...prev, saved]);
      loadThreads();
    } catch {
      setDraft(text);
    } finally {
      setSending(false);
    }
  };

  return (
    <SiteLayout>
      <div className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 lg:px-10">
        <div className="flex items-center gap-3">
          <Link to="/profile" className="text-espresso-500 hover:text-carissma-500">
            <ChevronLeftIcon />
          </Link>
          <StickerHeading as="h1" className="text-2xl">
            Chats
          </StickerHeading>
        </div>

        <div className="mt-6 grid grid-cols-1 overflow-hidden rounded-3xl border-2 border-carissma-200 bg-white/80 sm:grid-cols-[280px_1fr] sm:h-[560px]">
          <div className={`border-carissma-100 sm:border-e sm:block ${activeThreadId ? 'hidden' : 'block'}`}>
            <div className="h-full space-y-1 overflow-y-auto p-3">
              {threadsState === 'loading' && <p className="p-3 text-center text-xs font-semibold text-espresso-500">Loading…</p>}
              {threadsState === 'error' && <p className="p-3 text-center text-xs font-semibold text-carnation-600">Couldn't load your chats.</p>}
              {threadsState === 'ready' && threads.length === 0 && (
                <p className="p-3 text-center text-xs font-semibold text-espresso-500">
                  No conversations yet — start one from a follower's profile.
                </p>
              )}
              {threads.map((t) => (
                <ThreadRow key={t.id} thread={t} active={t.id === activeThreadId} onClick={() => setSearchParams({ thread: String(t.id) })} />
              ))}
            </div>
          </div>

          <div className={`flex flex-col ${activeThreadId ? 'flex' : 'hidden sm:flex'}`}>
            {!activeThreadId && <div className="flex flex-1 items-center justify-center text-sm font-semibold text-espresso-400">Select a conversation</div>}

            {activeThreadId && (
              <>
                <div className="flex items-center gap-2 border-b border-carissma-100 p-3">
                  <button onClick={() => setSearchParams({})} className="text-espresso-500 hover:text-carissma-500 sm:hidden">
                    <ChevronLeftIcon />
                  </button>
                  <p className="text-sm font-bold text-espresso-900">{activeThread?.other_user_name || 'Conversation'}</p>
                </div>

                <div className="flex-1 space-y-2 overflow-y-auto p-4">
                  {messagesLoading && <p className="text-center text-xs font-semibold text-espresso-500">Loading messages…</p>}
                  {!messagesLoading &&
                    messages.map((m) => {
                      const mine = m.sender_id === user?.id;
                      return (
                        <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                          <div
                            className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm font-medium ${
                              mine ? 'bg-carissma-400 text-white' : 'bg-linen-100 text-espresso-800'
                            }`}
                          >
                            {m.message}
                          </div>
                        </div>
                      );
                    })}
                  <div ref={bottomRef} />
                </div>

                <form onSubmit={onSend} className="flex items-center gap-2 border-t border-carissma-100 p-3">
                  <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Type a message…"
                    className="flex-1 rounded-full border border-carissma-200 bg-white px-4 py-2.5 text-sm text-espresso-900 placeholder:text-carissma-300 focus:outline-none focus:ring-2 focus:ring-carissma-400"
                  />
                  <button
                    type="submit"
                    disabled={!draft.trim() || sending}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-carissma-400 text-white hover:bg-carissma-500 disabled:opacity-60"
                  >
                    <SendIcon className="h-4 w-4" />
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
