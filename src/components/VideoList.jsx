import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import SortableItem from './SortableItem';
import VideoItem from './VideoItem';

export default function VideoList({
  videos,
  playlistId,
  playlistName,
  onDelete,
  onToggleWatched,
  onUpdateNotes,
  onAddToWatchNext,
  isInWatchNext,
  onReorder,
  editingNotes,
  setEditingNotes,
}) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = videos.findIndex((v) => v.id === active.id);
      const newIndex = videos.findIndex((v) => v.id === over.id);

      const reorderedVideos = arrayMove(videos, oldIndex, newIndex);
      onReorder(reorderedVideos);
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={videos.map((v) => v.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {videos.map((video) => (
            <SortableItem key={video.id} id={video.id}>
              <VideoItem
                video={video}
                playlistId={playlistId}
                playlistName={playlistName}
                onDelete={onDelete}
                onToggleWatched={onToggleWatched}
                onUpdateNotes={onUpdateNotes}
                onAddToWatchNext={onAddToWatchNext}
                isInWatchNext={isInWatchNext?.(video.id)}
                editingNotes={editingNotes}
                setEditingNotes={setEditingNotes}
              />
            </SortableItem>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
