import { useEffect, useState } from 'react';
import { listMyGameHistory } from '../../../api/me.api';

const STATUS_LABEL = { waiting: 'Waiting', active: 'In Progress', finished: 'Finished', cancelled: 'Cancelled' };

export default function GameHistoryTab() {
  const [rows, setRows] = useState([]);
  const [state, setState] = useState('loading');

  useEffect(() => {
    listMyGameHistory()
      .then((result) => {
        setRows(result?.rows || []);
        setState('ready');
      })
      .catch(() => setState('error'));
  }, []);

  if (state === 'loading') return <p className="text-center text-sm font-semibold text-espresso-500">Loading game history…</p>;
  if (state === 'error') return <p className="text-center text-sm font-semibold text-carnation-600">Couldn't load your game history right now.</p>;
  if (rows.length === 0) return <p className="text-center text-sm font-semibold text-espresso-500">You haven't played any games yet.</p>;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {rows.map((row) => (
        <div key={row.participant_id} className="flex items-center gap-3 rounded-2xl border border-carissma-100 bg-white/70 p-3">
          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-linen-100">
            {row.cover_image_url ? (
              <img src={row.cover_image_url} alt={row.quiz_title_en} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-[10px] text-espresso-300">No image</div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-espresso-900">{row.quiz_title_en}</p>
            <p className="text-xs font-semibold text-espresso-500">
              {row.mode} · {STATUS_LABEL[row.status] || row.status} · {new Date(row.joined_at).toLocaleDateString()}
            </p>
          </div>
          <div className="shrink-0 text-end">
            <p className="text-lg font-extrabold text-carissma-500">{row.score ?? 0}</p>
            <p className="text-[10px] font-bold uppercase text-espresso-400">Score</p>
          </div>
        </div>
      ))}
    </div>
  );
}
