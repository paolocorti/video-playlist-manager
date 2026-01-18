import { useState, useEffect } from 'react';
import {
  getPlaylists,
  deletePlaylist,
  getWatchNext,
  removeFromWatchNext,
  reorderWatchNext,
  markWatchedInQueue,
  renameTopic,
  deleteTopicAndPlaylists,
  downloadBackup,
} from './utils/storage';
import {
  Plus,
  Trash2,
  FolderOpen,
  Search,
  X,
  Clock,
  Settings,
  Edit2,
  Check,
  Pencil,
  Download,
  Upload,
} from 'lucide-react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import CreatePlaylistModal from './components/CreatePlaylistModal';
import PlaylistView from './components/PlaylistView';
import WatchNextItem from './components/WatchNextItem';
import ImportModal from './components/ImportModal';

function App() {
  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [watchNext, setWatchNext] = useState([]);
  const [isEditingTopics, setIsEditingTopics] = useState(false);
  const [editingTopic, setEditingTopic] = useState(null);
  const [newTopicName, setNewTopicName] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    loadPlaylists();
    loadWatchNext();
  }, []);

  const loadPlaylists = () => {
    setPlaylists(getPlaylists());
  };

  const loadWatchNext = () => {
    setWatchNext(getWatchNext());
  };

  const handleDeletePlaylist = (id, e) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this playlist?')) {
      deletePlaylist(id);
      loadPlaylists();
      if (selectedPlaylist?.id === id) {
        setSelectedPlaylist(null);
      }
    }
  };

  const handleRemoveFromWatchNext = (videoId) => {
    removeFromWatchNext(videoId);
    loadWatchNext();
  };

  const handleWatchNextDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = watchNext.findIndex((v) => v.videoId === active.id);
      const newIndex = watchNext.findIndex((v) => v.videoId === over.id);

      const reordered = arrayMove(watchNext, oldIndex, newIndex);
      reorderWatchNext(reordered);
      setWatchNext(reordered);
    }
  };

  const handleMarkAsWatched = (item) => {
    markWatchedInQueue(item.videoId, item.playlistId);
    removeFromWatchNext(item.videoId);
    loadWatchNext();
    loadPlaylists();
  };

  // Topic management
  const handleRenameTopic = (oldTopic) => {
    if (!newTopicName.trim()) return;
    const updatedPlaylists = renameTopic(oldTopic, newTopicName.trim());
    setPlaylists(updatedPlaylists);
    setNewTopicName('');
    setEditingTopic(null);
  };

  const handleDeleteTopic = (topic) => {
    const playlistsInTopic = playlists.filter(p => p.topic === topic);
    if (playlistsInTopic.length === 0) {
      const result = deleteTopicAndPlaylists(topic);
      setPlaylists(result.playlists);
      return;
    }

    if (confirm(`Delete topic "${topic}" and all ${playlistsInTopic.length} playlist(s) in it?`)) {
      const result = deleteTopicAndPlaylists(topic);
      setPlaylists(result.playlists);
    }
  };

  // Group playlists by topic (no subtopics)
  const groupedPlaylists = playlists.reduce((acc, playlist) => {
    const topic = playlist.topic || 'Uncategorized';
    if (!acc[topic]) {
      acc[topic] = [];
    }
    acc[topic].push(playlist);
    return acc;
  }, {});

  // Get unique topics
  const topics = Object.keys(groupedPlaylists);

  // Filter playlists based on search
  const filteredPlaylists = playlists.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.topic?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (selectedPlaylist) {
    return (
      <PlaylistView
        playlist={selectedPlaylist}
        onBack={() => setSelectedPlaylist(null)}
        onUpdate={loadPlaylists}
        onWatchNextChange={loadWatchNext}
      />
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Video Playlist Manager
            </h1>
            <p className="text-gray-400">Organize your learning journey</p>
          </div>
          <div className="relative">
            <button
              onClick={() => setShowSettingsMenu(!showSettingsMenu)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors ${
                showSettingsMenu || isEditingTopics
                  ? 'bg-white text-black'
                  : 'bg-zinc-800 text-gray-400 hover:bg-zinc-700'
              }`}
            >
              <Settings className="w-5 h-5" />
              {showSettingsMenu ? 'Close' : 'Settings'}
            </button>

            {/* Settings Dropdown */}
            {showSettingsMenu && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl z-50">
                {!isEditingTopics ? (
                  <>
                    <button
                      onClick={() => {
                        setIsEditingTopics(true);
                        setShowSettingsMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-300 hover:bg-zinc-800 hover:text-white transition-colors rounded-t-xl"
                    >
                      <Pencil className="w-4 h-4" />
                      Manage Topics
                    </button>
                    <button
                      onClick={() => {
                        downloadBackup();
                        setShowSettingsMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-300 hover:bg-zinc-800 hover:text-white transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Export All Data
                    </button>
                    <button
                      onClick={() => {
                        setShowImportModal(true);
                        setShowSettingsMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-300 hover:bg-zinc-800 hover:text-white transition-colors rounded-b-xl"
                    >
                      <Upload className="w-4 h-4" />
                      Import Backup
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setIsEditingTopics(false);
                      setEditingTopic(null);
                      setNewTopicName('');
                      setShowSettingsMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-300 hover:bg-zinc-800 hover:text-white transition-colors rounded-xl"
                  >
                    <Check className="w-4 h-4" />
                    Done Editing
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Watch Next Section */}
        {watchNext.length > 0 && (
          <div className="mb-8 bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-6 h-6 text-gray-400" />
                <h2 className="text-xl font-bold text-white">Watch Next</h2>
                <span className="text-sm text-gray-500">({watchNext.length}/8)</span>
              </div>
            </div>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleWatchNextDragEnd}
            >
              <SortableContext
                items={watchNext.map((v) => v.videoId)}
                strategy={verticalListSortingStrategy}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {watchNext.map((item, index) => (
                    <WatchNextItem
                      key={item.videoId}
                      item={item}
                      index={index}
                      onRemove={handleRemoveFromWatchNext}
                      onMarkWatched={handleMarkAsWatched}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        )}

        {/* Search and Create */}
        <div className="flex gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
            <input
              type="text"
              placeholder="Search playlists..."
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
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-gray-200 text-black rounded-xl font-medium transition-colors"
          >
            <Plus className="w-5 h-5" />
            New Playlist
          </button>
        </div>

        {/* Topics and Playlists */}
        {searchQuery ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPlaylists.map((playlist) => (
              <PlaylistCard
                key={playlist.id}
                playlist={playlist}
                onClick={() => setSelectedPlaylist(playlist)}
                onDelete={handleDeletePlaylist}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-8">
            {topics.map((topic) => (
              <TopicSection
                key={topic}
                topic={topic}
                playlists={groupedPlaylists[topic]}
                isEditing={isEditingTopics}
                editingTopic={editingTopic}
                newTopicName={newTopicName}
                onEditStart={(t) => {
                  setEditingTopic(t);
                  setNewTopicName(t);
                }}
                onEditCancel={() => {
                  setEditingTopic(null);
                  setNewTopicName('');
                }}
                onEditSave={handleRenameTopic}
                onNewTopicNameChange={setNewTopicName}
                onDelete={handleDeleteTopic}
                onPlaylistClick={(playlist) => setSelectedPlaylist(playlist)}
                onPlaylistDelete={handleDeletePlaylist}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {playlists.length === 0 && (
          <div className="text-center py-16">
            <FolderOpen className="w-24 h-24 text-gray-700 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No playlists yet</h3>
            <p className="text-gray-600 mb-6">
              Create your first playlist to start organizing videos
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-gray-200 text-black rounded-xl font-medium transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create Playlist
            </button>
          </div>
        )}

        {/* No search results */}
        {searchQuery && filteredPlaylists.length === 0 && (
          <div className="text-center py-16">
            <Search className="w-24 h-24 text-gray-700 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No results found</h3>
            <p className="text-gray-600">Try adjusting your search query</p>
          </div>
        )}
      </div>

      {/* Create Playlist Modal */}
      {showCreateModal && (
        <CreatePlaylistModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadPlaylists();
          }}
        />
      )}

      {/* Import Modal */}
      {showImportModal && (
        <ImportModal
          onClose={() => setShowImportModal(false)}
          onImportSuccess={() => {
            setShowImportModal(false);
            loadPlaylists();
            loadWatchNext();
          }}
        />
      )}
    </div>
  );
}

function TopicSection({
  topic,
  playlists,
  isEditing,
  editingTopic,
  newTopicName,
  onEditStart,
  onEditCancel,
  onEditSave,
  onNewTopicNameChange,
  onDelete,
  onPlaylistClick,
  onPlaylistDelete,
}) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        {editingTopic === topic ? (
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <input
              type="text"
              value={newTopicName}
              onChange={(e) => onNewTopicNameChange(e.target.value)}
              className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-zinc-600"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') onEditSave(topic);
                if (e.key === 'Escape') onEditCancel();
              }}
            />
            <button
              onClick={() => onEditSave(topic)}
              className="p-2 bg-white hover:bg-gray-200 text-black rounded-lg transition-colors"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={onEditCancel}
              className="p-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <FolderOpen className="w-6 h-6 text-gray-400" />
              {topic}
            </h2>
            {isEditing && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onEditStart(topic)}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                  title="Rename topic"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(topic)}
                  className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                  title="Delete topic"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {playlists.map((playlist) => (
          <PlaylistCard
            key={playlist.id}
            playlist={playlist}
            onClick={() => onPlaylistClick(playlist)}
            onDelete={onPlaylistDelete}
          />
        ))}
      </div>
    </div>
  );
}

function PlaylistCard({ playlist, onClick, onDelete }) {
  const videoCount = playlist.videos?.length || 0;
  const watchedCount = playlist.videos?.filter((v) => v.watched).length || 0;

  return (
    <div
      onClick={onClick}
      className="group bg-zinc-900 border border-zinc-800 rounded-xl p-5 cursor-pointer hover:bg-zinc-800 hover:border-zinc-700 transition-all"
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-semibold text-white">{playlist.name}</h3>
        <button
          onClick={(e) => onDelete(playlist.id, e)}
          className="opacity-0 group-hover:opacity-100 p-1 text-gray-500 hover:text-red-400 transition-all"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center gap-4 text-sm text-gray-400">
        <span>
          {videoCount} video{videoCount !== 1 ? 's' : ''}
        </span>
        {watchedCount > 0 && <span className="text-gray-300">{watchedCount} watched</span>}
      </div>

      {videoCount > 0 && (
        <div className="mt-3">
          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-white transition-all"
              style={{ width: `${(watchedCount / videoCount) * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
