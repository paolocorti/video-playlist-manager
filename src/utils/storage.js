const STORAGE_KEY = 'video-playlist-manager';

// Get all data from localStorage
export const getStorageData = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : { playlists: [], watchNext: [] };
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return { playlists: [], watchNext: [] };
  }
};

// Save all data to localStorage
export const saveStorageData = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

// Get all playlists
export const getPlaylists = () => {
  const data = getStorageData();
  return data.playlists || [];
};

// Save playlists
export const savePlaylists = (playlists) => {
  const data = getStorageData();
  saveStorageData({ ...data, playlists });
};

// Add a new playlist
export const addPlaylist = (playlist) => {
  const playlists = getPlaylists();
  const newPlaylist = {
    id: crypto.randomUUID(),
    name: playlist.name,
    topic: playlist.topic,
    videos: [],
    createdAt: new Date().toISOString(),
    ...playlist
  };
  savePlaylists([...playlists, newPlaylist]);
  return newPlaylist;
};

// Update a playlist
export const updatePlaylist = (id, updates) => {
  const playlists = getPlaylists();
  const updatedPlaylists = playlists.map(p =>
    p.id === id ? { ...p, ...updates } : p
  );
  savePlaylists(updatedPlaylists);
};

// Delete a playlist
export const deletePlaylist = (id) => {
  const playlists = getPlaylists();
  const filtered = playlists.filter(p => p.id !== id);
  savePlaylists(filtered);
};

// Helper to get YouTube thumbnail
const getYoutubeThumbnail = (url) => {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? `https://img.youtube.com/vi/${match[1]}/mqdefault.jpg` : null;
};

// Add a video to a playlist
export const addVideo = (playlistId, video) => {
  const playlists = getPlaylists();
  const playlist = playlists.find(p => p.id === playlistId);
  if (playlist) {
    const thumbnail = getYoutubeThumbnail(video.url);
    const newVideo = {
      id: crypto.randomUUID(),
      url: video.url,
      title: video.title || '',
      notes: '',
      watched: false,
      order: playlist.videos.length,
      createdAt: new Date().toISOString(),
      thumbnail,
      ...video
    };
    playlist.videos.push(newVideo);
    savePlaylists(playlists);
    return newVideo;
  }
};

// Update a video
export const updateVideo = (playlistId, videoId, updates) => {
  const playlists = getPlaylists();
  const playlist = playlists.find(p => p.id === playlistId);
  if (playlist) {
    playlist.videos = playlist.videos.map(v =>
      v.id === videoId ? { ...v, ...updates } : v
    );
    savePlaylists(playlists);
  }
};

// Delete a video
export const deleteVideo = (playlistId, videoId) => {
  const playlists = getPlaylists();
  const playlist = playlists.find(p => p.id === playlistId);
  if (playlist) {
    playlist.videos = playlist.videos.filter(v => v.id !== videoId);
    savePlaylists(playlists);
  }
};

// Reorder videos in a playlist
export const reorderVideos = (playlistId, videos) => {
  const playlists = getPlaylists();
  const playlist = playlists.find(p => p.id === playlistId);
  if (playlist) {
    playlist.videos = videos.map((v, index) => ({ ...v, order: index }));
    savePlaylists(playlists);
  }
};

// Watch Next Queue
const MAX_WATCH_NEXT = 8;

export const getWatchNext = () => {
  const data = getStorageData();
  return data.watchNext || [];
};

export const saveWatchNext = (watchNext) => {
  const data = getStorageData();
  saveStorageData({ ...data, watchNext });
};

export const addToWatchNext = (video, playlistId, playlistName) => {
  const watchNext = getWatchNext();
  const existingIndex = watchNext.findIndex(v => v.videoId === video.id);

  if (existingIndex !== -1) {
    return false; // Already in queue
  }

  if (watchNext.length >= MAX_WATCH_NEXT) {
    return false; // Queue is full
  }

  const queueItem = {
    videoId: video.id,
    url: video.url,
    title: video.title,
    thumbnail: video.thumbnail,
    playlistId,
    playlistName,
    addedAt: new Date().toISOString(),
  };

  saveWatchNext([...watchNext, queueItem]);
  return true;
};

export const removeFromWatchNext = (videoId) => {
  const watchNext = getWatchNext();
  saveWatchNext(watchNext.filter(v => v.videoId !== videoId));
};

export const isInWatchNext = (videoId) => {
  const watchNext = getWatchNext();
  return watchNext.some(v => v.videoId === videoId);
};

export const reorderWatchNext = (watchNext) => {
  saveWatchNext(watchNext);
};

export const clearWatchNext = () => {
  saveWatchNext([]);
};

export const markWatchedInQueue = (videoId, playlistId) => {
  const playlists = getPlaylists();
  const playlist = playlists.find(p => p.id === playlistId);
  if (playlist) {
    const video = playlist.videos.find(v => v.id === videoId);
    if (video) {
      updateVideo(playlistId, videoId, { watched: true });
    }
  }
};

// Fetch video title from URL using noembed.com (free, no API key needed)
export const fetchVideoTitle = async (url) => {
  try {
    const response = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(url)}`);
    const data = await response.json();
    return data.title || null;
  } catch (error) {
    console.error('Error fetching video title:', error);
    return null;
  }
};

// Fetch all missing video titles in a playlist
export const fetchMissingTitles = async (playlistId, onProgress) => {
  const playlists = getPlaylists();
  const playlist = playlists.find(p => p.id === playlistId);
  if (!playlist) return 0;

  const videosWithoutTitles = playlist.videos.filter(v => !v.title || v.title.trim() === '');
  if (videosWithoutTitles.length === 0) return 0;

  let fetchedCount = 0;

  for (const video of videosWithoutTitles) {
    const title = await fetchVideoTitle(video.url);
    if (title) {
      updateVideo(playlistId, video.id, { title });
      fetchedCount++;
      onProgress?.(fetchedCount, videosWithoutTitles.length);
    }
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  return fetchedCount;
};

// Topic Management
export const renameTopic = (oldTopic, newTopic) => {
  const playlists = getPlaylists();
  const updatedPlaylists = playlists.map(p => {
    // Match if topic equals oldTopic, or if oldTopic is 'Uncategorized' and topic is undefined/empty
    const shouldUpdate = p.topic === oldTopic ||
      (oldTopic === 'Uncategorized' && (!p.topic || p.topic === ''));
    if (shouldUpdate) {
      return { ...p, topic: newTopic };
    }
    return p;
  });
  savePlaylists(updatedPlaylists);
  return updatedPlaylists;
};

export const deleteTopic = (topic) => {
  const playlists = getPlaylists();
  const playlistsInTopic = playlists.filter(p =>
    p.topic === topic || (topic === 'Uncategorized' && (!p.topic || p.topic === ''))
  );

  if (playlistsInTopic.length > 0) {
    return { success: false, count: playlistsInTopic.length };
  }

  return { success: true, count: 0 };
};

export const deleteTopicAndPlaylists = (topic) => {
  const playlists = getPlaylists();
  const filtered = playlists.filter(p =>
    p.topic !== topic && !(topic === 'Uncategorized' && (!p.topic || p.topic === ''))
  );
  savePlaylists(filtered);
  return { deleted: playlists.length - filtered.length, playlists: filtered };
};

// Import/Export
export const exportData = () => {
  const data = getStorageData();
  const exportData = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    ...data,
  };
  return JSON.stringify(exportData, null, 2);
};

export const downloadBackup = () => {
  const data = exportData();
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  link.href = url;
  link.download = `video-playlists-${timestamp}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const importData = (jsonData, mode = 'merge') => {
  try {
    const imported = JSON.parse(jsonData);

    // Validate imported data structure
    if (!imported.playlists || !Array.isArray(imported.playlists)) {
      throw new Error('Invalid data format: missing or invalid playlists');
    }

    const currentData = getStorageData();

    if (mode === 'replace') {
      saveStorageData({
        playlists: imported.playlists || [],
        watchNext: imported.watchNext || [],
      });
      return {
        success: true,
        playlistsImported: imported.playlists?.length || 0,
        watchNextImported: imported.watchNext?.length || 0,
      };
    }

    // Merge mode
    const existingIds = new Set(currentData.playlists.map(p => p.id));
    const mergedPlaylists = [...currentData.playlists];

    // Add new playlists from import
    for (const playlist of imported.playlists || []) {
      if (!existingIds.has(playlist.id)) {
        mergedPlaylists.push(playlist);
      }
    }

    saveStorageData({
      playlists: mergedPlaylists,
      watchNext: currentData.watchNext || [],
    });

    return {
      success: true,
      playlistsImported: imported.playlists?.length || 0,
      playlistsAdded: mergedPlaylists.length - currentData.playlists.length,
    };
  } catch (error) {
    console.error('Import error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};
