import { useState } from 'react';
import { X } from 'lucide-react';
import { addPlaylist, getPlaylists } from '../utils/storage';

export default function CreatePlaylistModal({ onClose, onSuccess }) {
  const [name, setName] = useState('');
  const [topic, setTopic] = useState('');
  const [customTopic, setCustomTopic] = useState('');

  // Get all unique topics
  const existingTopics = [...new Set(getPlaylists().map(p => p.topic).filter(Boolean))];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const finalTopic = customTopic.trim() || topic.trim();
    if (!finalTopic) {
      alert('Please select or enter a topic');
      return;
    }

    addPlaylist({
      name: name.trim(),
      topic: finalTopic,
    });

    onSuccess();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Create Playlist</h2>
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
              Playlist Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., React Advanced Concepts"
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-zinc-600"
              autoFocus
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Topic *
            </label>

            {existingTopics.length > 0 && !customTopic && (
              <div className="grid grid-cols-2 gap-2 mb-2">
                {existingTopics.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      setTopic(t);
                      setCustomTopic('');
                    }}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      topic === t
                        ? 'bg-white text-black'
                        : 'bg-zinc-800 text-gray-300 hover:bg-zinc-700'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <input
                type="text"
                value={customTopic || topic}
                onChange={(e) => {
                  setCustomTopic(e.target.value);
                  if (e.target.value) setTopic('');
                }}
                placeholder="Select above or enter new topic"
                className="flex-1 px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-zinc-600"
                required
              />
            </div>
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
              className="flex-1 px-4 py-3 bg-white hover:bg-gray-200 text-black rounded-xl font-medium transition-colors"
            >
              Create Playlist
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
