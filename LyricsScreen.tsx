import React, { useState } from 'react';
import { FileText, Edit2, Check, X } from 'lucide-react';
import { Track, ThemeSkin } from '../../types';

interface LyricsScreenProps {
  track: Track | null;
  theme: ThemeSkin;
  onSaveLyrics: (trackId: string, lyrics: string) => void;
}

export const LyricsScreen: React.FC<LyricsScreenProps> = ({
  track,
  theme,
  onSaveLyrics,
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [text, setText] = useState<string>(track?.lyrics || '');

  if (!track) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 text-center">
        <p className="text-xs opacity-70">No track playing</p>
      </div>
    );
  }

  const handleSave = () => {
    onSaveLyrics(track.id, text);
    setIsEditing(false);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="h-8 px-2.5 bg-black/10 flex items-center justify-between border-b border-black/10 text-[10px] shrink-0 font-medium">
        <div className="flex items-center gap-1.5 truncate">
          <FileText className="w-3.5 h-3.5" />
          <span className="font-bold truncate">Lyrics: {track.title}</span>
        </div>

        <div>
          {isEditing ? (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleSave}
                className="p-1 rounded bg-emerald-600 text-white"
                title="Save"
              >
                <Check className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setText(track.lyrics || '');
                  setIsEditing(false);
                }}
                className="p-1 rounded bg-black/20"
                title="Cancel"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setText(track.lyrics || '');
                setIsEditing(true);
              }}
              className="px-2 py-0.5 rounded bg-black/15 hover:bg-black/25 flex items-center gap-1 font-pixel text-[9px]"
            >
              <Edit2 className="w-2.5 h-2.5" />
              <span>EDIT</span>
            </button>
          )}
        </div>
      </div>

      {/* Lyrics Content */}
      <div className="flex-1 overflow-y-auto p-3 text-center">
        {isEditing ? (
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste or write lyrics here..."
            className="w-full h-full bg-black/10 text-[11px] p-2 rounded border border-black/15 font-mono-lcd focus:outline-none resize-none leading-relaxed"
          />
        ) : track.lyrics ? (
          <div className="space-y-2 py-2">
            {track.lyrics.split('\n').map((line, idx) => (
              <p key={idx} className="text-[11px] sm:text-[12px] font-medium leading-relaxed opacity-90">
                {line || '•'}
              </p>
            ))}
          </div>
        ) : (
          <div className="py-8">
            <FileText className="w-8 h-8 opacity-30 mx-auto mb-2" />
            <p className="font-bold text-xs">No Lyrics Embedded</p>
            <p className="text-[10px] opacity-70 mt-1 max-w-[200px] mx-auto">
              Tap &quot;EDIT&quot; above to add your own lyrics for this track.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
