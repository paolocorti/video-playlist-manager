import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { fetchVideoTitle } from '../utils/storage';

export default function AddVideoModal({ onClose, onAdd }) {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const [autoFetched, setAutoFetched] = useState(false);

  // Extract video ID from YouTube URL to get thumbnail
  const getYoutubeId = (url) => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const youtubeId = getYoutubeId(url);

  // Auto-fetch title when URL changes
  useEffect(() => {
    const fetchTitle = async () => {
      if (url && getYoutubeId(url) && !autoFetched) {
        setIsFetching(true);
        try {
          const fetchedTitle = await fetchVideoTitle(url);
          if (fetchedTitle && !title) {
            setTitle(fetchedTitle);
            setAutoFetched(true);
          }
        } catch (error) {
          console.error('Failed to fetch title:', error);
        } finally {
          setIsFetching(false);
        }
      }
    };

    const timeoutId = setTimeout(fetchTitle, 500);
    return () => clearTimeout(timeoutId);
  }, [url]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!url.trim()) return;

    onAdd({
      url: url.trim(),
      title: title.trim() || undefined,
    });

    setUrl('');
    setTitle('');
    setAutoFetched(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Add Video</h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Video URL *
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setAutoFetched(false);
              }}
              placeholder="https://youtube.com/watch?v=..."
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-zinc-600"
              autoFocus
              required
            />
            {youtubeId && (
              <div className="mt-3">
                <img
                  src={`https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`}
                  alt="Video thumbnail"
                  className="w-full rounded-lg opacity-80"
                />
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-400">
                Title (optional)
              </label>
              {isFetching && (
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Fetching...
                </div>
              )}
            </div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Auto-fetched from URL or enter manually"
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-zinc-600"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isFetching}
              className="flex-1 px-4 py-3 bg-white hover:bg-gray-200 disabled:bg-gray-600 disabled:cursor-not-allowed text-black rounded-xl font-medium transition-colors"
            >
              Add Video
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
