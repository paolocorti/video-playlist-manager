import { useState } from 'react';
import { Trash2, ExternalLink, CheckCircle2, Circle, FileText, X, Check, Clock } from 'lucide-react';

export default function VideoItem({
  video,
  playlistId,
  playlistName,
  onDelete,
  onToggleWatched,
  onUpdateNotes,
  onAddToWatchNext,
  isInWatchNext,
  editingNotes,
  setEditingNotes,
}) {
  const [localNotes, setLocalNotes] = useState(video.notes || '');
  const [notesChanged, setNotesChanged] = useState(false);

  const isEditing = editingNotes === video.id;

  const handleSaveNotes = () => {
    onUpdateNotes(video.id, localNotes);
    setNotesChanged(false);
  };

  const handleCancelNotes = () => {
    setLocalNotes(video.notes || '');
    setNotesChanged(false);
    setEditingNotes(null);
  };

  const handleAddToWatchNext = () => {
    if (onAddToWatchNext) {
      onAddToWatchNext(video, playlistId, playlistName);
    }
  };

  // Get YouTube thumbnail
  const getYoutubeThumbnail = (url) => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? `https://img.youtube.com/vi/${match[1]}/mqdefault.jpg` : null;
  };

  const thumbnail = getYoutubeThumbnail(video.url);

  return (
    <div
      className={`group bg-zinc-900 border rounded-xl p-4 transition-all ${
        video.watched
          ? 'border-gray-700 opacity-60'
          : 'border-zinc-800 hover:bg-zinc-800/50 hover:border-zinc-700'
      }`}
    >
      <div className="flex gap-4">
        {/* Thumbnail */}
        <div className="flex-shrink-0 w-32 h-20 rounded-lg overflow-hidden bg-zinc-800">
          {thumbnail ? (
            <img src={thumbnail} alt="Video thumbnail" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-600">
              <ExternalLink className="w-6 h-6" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1 min-w-0">
              {video.title ? (
                <h3 className={`font-medium truncate ${video.watched ? 'text-gray-500 line-through' : 'text-white'}`}>
                  {video.title}
                </h3>
              ) : (
                <a
                  href={video.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-400 hover:text-gray-300 truncate block"
                >
                  {video.url}
                </a>
              )}
            </div>

            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() => onToggleWatched(video)}
                className="p-1.5 rounded-lg hover:bg-zinc-800 transition-colors"
                title={video.watched ? 'Mark as unwatched' : 'Mark as watched'}
              >
                {video.watched ? (
                  <CheckCircle2 className="w-5 h-5 text-gray-400" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-500" />
                )}
              </button>
              <button
                onClick={handleAddToWatchNext}
                disabled={isInWatchNext}
                className={`p-1.5 rounded-lg transition-colors ${
                  isInWatchNext
                    ? 'bg-zinc-800 text-gray-500 cursor-default'
                    : 'hover:bg-zinc-800 text-gray-500'
                }`}
                title={isInWatchNext ? 'Already in Watch Next' : 'Add to Watch Next'}
              >
                <Clock className="w-5 h-5" />
              </button>
              <a
                href={video.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg hover:bg-zinc-800 transition-colors"
                title="Open video"
              >
                <ExternalLink className="w-5 h-5 text-gray-500" />
              </a>
              <button
                onClick={() => onDelete(video.id)}
                className="p-1.5 rounded-lg hover:bg-red-900/30 transition-colors"
                title="Delete video"
              >
                <Trash2 className="w-5 h-5 text-gray-500 hover:text-red-400" />
              </button>
            </div>
          </div>

          {/* Notes Section */}
          <div className="mt-2">
            {isEditing ? (
              <div className="space-y-2">
                <textarea
                  value={localNotes}
                  onChange={(e) => {
                    setLocalNotes(e.target.value);
                    setNotesChanged(e.target.value !== (video.notes || ''));
                  }}
                  placeholder="Add notes about this video..."
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-zinc-600 resize-none"
                  rows={3}
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveNotes}
                    disabled={!notesChanged}
                    className="flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-gray-200 disabled:bg-zinc-700 disabled:cursor-not-allowed text-black rounded-lg text-sm font-medium transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    Save
                  </button>
                  <button
                    onClick={handleCancelNotes}
                    className="flex items-center gap-1 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                {video.notes ? (
                  <div className="flex items-start gap-2">
                    <FileText className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-300 flex-1 whitespace-pre-wrap">{video.notes}</p>
                    <button
                      onClick={() => setEditingNotes(video.id)}
                      className="text-gray-500 hover:text-white text-sm flex-shrink-0"
                    >
                      Edit
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setEditingNotes(video.id)}
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    <FileText className="w-4 h-4" />
                    Add notes
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
