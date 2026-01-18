import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

export default function SortableItem({ id, children }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative">
      <div
        {...attributes}
        {...listeners}
        className="absolute left-3 top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing text-gray-500 hover:text-white p-1"
      >
        <GripVertical className="w-5 h-5" />
      </div>
      <div className="pl-10">{children}</div>
    </div>
  );
}
