import React from 'react';
import { ListOrdered, Play, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { Track, ThemeSkin } from '../../types';

interface QueueScreenProps {
  queue: Track[];
  currentTrack: Track | null;
  theme: ThemeSkin;
  onPlayTrack: (track: Track) => void;
  onRemoveFromQueue: (index: number) => void;
  onClearQueue: () => void;
  onMoveQueueItem: (fromIdx: number, toIdx: number) => void;
}

export const QueueScreen: React.FC<QueueScreenProps> = ({
  queue,
  currentTrack,
  theme,
  onPlayTrack,
  onRemoveFromQueue,
  onClearQueue,
  onMoveQueueItem,
}) => {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="h-8 px-2.5 bg-black/10 flex items-center justify-between border-b border-black/10 text-[10px] shrink-0 font-medium">
        <div className="flex items-center gap-1.5">
          <ListOrdered className="w-3.5 h-3.5" />
          <span className="font-bold">Play Queue ({queue.length})</span>
        </div>

        {queue.length > 0 && (
          <button
            type="button"
            onClick={onClearQueue}
            className="px-2 py-0.5 rounded bg-black/15 hover:bg-black/25 text-[9px] font-pixel text-red-500"
          >
            CLEAR QUEUE
          </button>
        )}
      </div>

      {/* Queue List */}
      <div className="flex-1 overflow-y-auto divide-y divide-black/5">
        {queue.length === 0 ? (
          <div className="p-6 text-center">
            <p className="font-bold text-xs opacity-60">Queue is Empty</p>
          </div>
        ) : (
          queue.map((track, idx) => {
            const isCurrent = currentTrack?.id === track.id;

            return (
              <div
                key={`${track.id}-${idx}`}
                onClick={() => onPlayTrack(track)}
                className={`px-2 py-1.5 flex items-center justify-between hover:bg-black/5 cursor-pointer text-[11px] select-none ${
                  isCurrent ? 'bg-black/15 font-semibold' : ''
                }`}
              >
                <div className="flex items-center gap-2 truncate flex-1 min-w-0">
                  <span className="font-mono-lcd text-[9px] opacity-60 w-4 text-center">
                    {idx + 1}
                  </span>

                  <div className="w-6 h-6 rounded overflow-hidden shrink-0 bg-black/10">
                    <img src={track.albumArtUrl} alt="" className="w-full h-full object-cover" />
                  </div>

                  <div className="truncate">
                    <p className="truncate leading-tight">{track.title}</p>
                    <p className="text-[9px] opacity-70 truncate">{track.artist}</p>
                  </div>
                </div>

                <div
                  className="flex items-center gap-1 shrink-0 opacity-70"
                  onClick={(e) => e.stopPropagation()}
                >
                  {idx > 0 && (
                    <button
                      type="button"
                      onClick={() => onMoveQueueItem(idx, idx - 1)}
                      className="p-1 hover:bg-black/10 rounded"
                      title="Move Up"
                    >
                      <ArrowUp className="w-2.5 h-2.5" />
                    </button>
                  )}

                  {idx < queue.length - 1 && (
                    <button
                      type="button"
                      onClick={() => onMoveQueueItem(idx, idx + 1)}
                      className="p-1 hover:bg-black/10 rounded"
                      title="Move Down"
                    >
                      <ArrowDown className="w-2.5 h-2.5" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => onRemoveFromQueue(idx)}
                    className="p-1 hover:bg-black/10 rounded text-red-500"
                    title="Remove"
                  >
                    <Trash2 className="w-2.5 h-2.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
