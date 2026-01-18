import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Search, X, ExternalLink, CheckCircle2, Circle, Download, Loader2 } from 'lucide-react';
import { getPlaylists, updatePlaylist, deleteVideo, updateVideo, addVideo, reorderVideos, addToWatchNext, isInWatchNext, fetchMissingTitles } from '../utils/storage';
import VideoList from './VideoList';
import AddVideoModal from './AddVideoModal';

export default function PlaylistView({ playlist: initialPlaylist, onBack, onUpdate, onWatchNextChange }) {
  const [playlist, setPlaylist] = useState(initialPlaylist);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingNotes, setEditingNotes] = useState(null);
  const [isFetching, setIsFetching] = useState(false);
  const [fetchProgress, setFetchProgress] = useState({ current: 0, total: 0 });

  useEffect(() => {
    const playlists = getPlaylists();
    const updated = playlists.find(p => p.id === initialPlaylist.id);
    if (updated) setPlaylist(updated);
  }, [initialPlaylist.id]);

  const handleDeleteVideo = (videoId) => {
    deleteVideo(playlist.id, videoId);
    refreshPlaylist();
  };

  const handleToggleWatched = (video) => {
    updateVideo(playlist.id, video.id, { watched: !video.watched });
    refreshPlaylist();
  };

  const handleUpdateNotes = (videoId, notes) => {
    updateVideo(playlist.id, videoId, { notes });
    refreshPlaylist();
    setEditingNotes(null);
  };

  const handleAddVideo = (videoData) => {
    addVideo(playlist.id, videoData);
    refreshPlaylist();
  };

  const handleReorder = (videos) => {
    reorderVideos(playlist.id, videos);
    refreshPlaylist();
  };

  const handleAddToWatchNext = (video, playlistId, playlistName) => {
    const success = addToWatchNext(video, playlistId, playlistName);
    if (success) {
      onWatchNextChange?.();
    } else {
      // Check if it's already in the queue or if the queue is full
      if (isInWatchNext(video.id)) {
        alert('This video is already in your Watch Next queue');
      } else {
        alert('Watch Next queue is full (maximum 8 videos)');
      }
    }
  };

  const checkIsInWatchNext = (videoId) => {
    return isInWatchNext(videoId);
  };

  const refreshPlaylist = () => {
    const playlists = getPlaylists();
    const updated = playlists.find(p => p.id === playlist.id);
    if (updated) {
      setPlaylist(updated);
      onUpdate();
    }
  };

  const handleFetchTitles = async () => {
    const missingCount = playlist.videos?.filter(v => !v.title || v.title.trim() === '').length || 0;
    if (missingCount === 0) {
      alert('All videos have titles!');
      return;
    }

    setIsFetching(true);
    setFetchProgress({ current: 0, total: missingCount });

    try {
      await fetchMissingTitles(playlist.id, (current, total) => {
        setFetchProgress({ current, total });
      });
      refreshPlaylist();
      alert(`Successfully fetched ${missingCount} video title(s)!`);
    } catch (error) {
      alert('Failed to fetch some titles. Please try again.');
    } finally {
      setIsFetching(false);
      setFetchProgress({ current: 0, total: 0 });
    }
  };

  const filteredVideos = playlist.videos?.filter(v =>
    v.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.url?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.notes?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to playlists
        </button>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">{playlist.name}</h1>
          {playlist.topic && (
            <div className="text-gray-400 text-sm">{playlist.topic}</div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-white">{playlist.videos?.length || 0}</div>
            <div className="text-sm text-gray-400">Total Videos</div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-gray-300">
              {playlist.videos?.filter(v => v.watched).length || 0}
            </div>
            <div className="text-sm text-gray-400">Watched</div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-gray-500">
              {playlist.videos?.filter(v => !v.watched).length || 0}
            </div>
            <div className="text-sm text-gray-400">Remaining</div>
          </div>
        </div>

        {/* Search and Add */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
            <input
              type="text"
              placeholder="Search videos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-zinc-700"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-gray-200 text-black rounded-xl font-medium transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Video
          </button>
          <button
            onClick={handleFetchTitles}
            disabled={isFetching}
            className="flex items-center gap-2 px-4 py-3 bg-zinc-800 hover:bg-zinc-700 disabled:bg-zinc-800 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors"
            title="Fetch all missing video titles"
          >
            {isFetching ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {fetchProgress.total > 0 ? `${fetchProgress.current}/${fetchProgress.total}` : 'Fetching...'}
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                Fetch Titles
              </>
            )}
          </button>
        </div>

        {/* Video List */}
        <VideoList
          videos={filteredVideos}
          playlistId={playlist.id}
          playlistName={playlist.name}
          onDelete={handleDeleteVideo}
          onToggleWatched={handleToggleWatched}
          onUpdateNotes={handleUpdateNotes}
          onAddToWatchNext={handleAddToWatchNext}
          isInWatchNext={checkIsInWatchNext}
          onReorder={handleReorder}
          editingNotes={editingNotes}
          setEditingNotes={setEditingNotes}
        />

        {/* Empty State */}
        {filteredVideos.length === 0 && !searchQuery && (
          <div className="text-center py-16 bg-zinc-900 border border-zinc-800 rounded-xl">
            <Plus className="w-16 h-16 text-gray-700 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">
              No videos yet
            </h3>
            <p className="text-gray-600 mb-6">
              Add your first video to get started
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-gray-200 text-black rounded-xl font-medium transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Video
            </button>
          </div>
        )}

        {/* No search results */}
        {searchQuery && filteredVideos.length === 0 && (
          <div className="text-center py-16 bg-zinc-900 border border-zinc-800 rounded-xl">
            <Search className="w-16 h-16 text-gray-700 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">
              No videos found
            </h3>
            <p className="text-gray-600">
              Try adjusting your search query
            </p>
          </div>
        )}
      </div>

      {/* Add Video Modal */}
      {showAddModal && (
        <AddVideoModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddVideo}
        />
      )}
    </div>
  );
}
