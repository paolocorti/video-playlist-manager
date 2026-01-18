import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Play, Trash2, ExternalLink, CheckCircle2, GripVertical } from 'lucide-react';

export default function WatchNextItem({ item, index, onRemove, onMarkWatched }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.videoId,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // Get YouTube thumbnail
  const getYoutubeThumbnail = (url) => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? `https://img.youtube.com/vi/${match[1]}/mqdefault.jpg` : null;
  };

  const thumbnail = getYoutubeThumbnail(item.url);

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:bg-zinc-800 hover:border-zinc-700 transition-all">
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="absolute top-2 left-2 z-10 cursor-grab active:cursor-grabbing text-gray-500 hover:text-white p-1 bg-black/50 rounded-lg"
        >
          <GripVertical className="w-4 h-4" />
        </div>

        {/* Number Badge */}
        <div className="absolute top-2 right-2 z-10 bg-white text-black text-sm font-bold rounded-full w-6 h-6 flex items-center justify-center">
          {index + 1}
        </div>

        {/* Thumbnail */}
        <div className="relative aspect-video bg-zinc-800">
          {thumbnail ? (
            <img src={thumbnail} alt="Video thumbnail" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-600">
              <ExternalLink className="w-8 h-8" />
            </div>
          )}

          {/* Play overlay on hover */}
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Play className="w-12 h-12 text-white" />
          </a>
        </div>

        {/* Content */}
        <div className="p-3">
          <h3 className="font-medium text-white text-sm mb-1 line-clamp-2">
            {item.title || 'Video'}
          </h3>
          <p className="text-xs text-gray-500 mb-2">{item.playlistName}</p>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => onMarkWatched(item)}
              className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-gray-300 rounded-lg text-xs font-medium transition-colors"
              title="Mark as watched"
            >
              <CheckCircle2 className="w-3 h-3" />
              Done
            </button>
            <button
              onClick={() => onRemove(item.videoId)}
              className="flex items-center justify-center p-1.5 bg-zinc-800 hover:bg-red-900/30 text-gray-500 hover:text-red-400 rounded-lg transition-colors"
              title="Remove from queue"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
