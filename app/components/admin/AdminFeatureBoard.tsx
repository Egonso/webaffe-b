import { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, doc, updateDoc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { getFirebaseFirestore } from '~/lib/firebase/firebase';
import { toast } from 'react-toastify';
import { DragDropContext, Droppable, Draggable, type DropResult } from 'react-beautiful-dnd';

interface FeatureItem {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  votes: string[];
  author: string;
  authorEmail: string;
  createdAt: any;
}

const COLUMNS = [
  { id: 'submitted', label: 'Submitted', color: '#6366f1' },
  { id: 'under-review', label: 'Under Review', color: '#f59e0b' },
  { id: 'planned', label: 'Planned', color: '#3b82f6' },
  { id: 'in-progress', label: 'In Progress', color: '#8b5cf6' },
  { id: 'done', label: 'Done', color: '#10b981' },
  { id: 'rejected', label: 'Rejected', color: '#ef4444' },
];

const PRIORITY_COLORS: Record<string, string> = {
  low: '#6b7280',
  medium: '#f59e0b',
  high: '#ef4444',
  critical: '#dc2626',
};

export function AdminFeatureBoard() {
  const [features, setFeatures] = useState<FeatureItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFeatures = useCallback(async () => {
    try {
      const db = getFirebaseFirestore();
      const q = query(collection(db, 'features'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const items: FeatureItem[] = [];

      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...docSnap.data() } as FeatureItem);
      });

      setFeatures(items);
    } catch (error) {
      console.error('Error loading features:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFeatures();
  }, [loadFeatures]);

  const handleDragEnd = useCallback(
    async (result: DropResult) => {
      if (!result.destination) {
        return;
      }

      const featureId = result.draggableId;
      const newStatus = result.destination.droppableId;

      setFeatures((prev) => prev.map((f) => (f.id === featureId ? { ...f, status: newStatus } : f)));

      try {
        const db = getFirebaseFirestore();
        await updateDoc(doc(db, 'features', featureId), {
          status: newStatus,
          updatedAt: serverTimestamp(),
        });
        toast.success(`Feature moved to ${COLUMNS.find((c) => c.id === newStatus)?.label}`);
      } catch (error) {
        console.error('Error updating feature:', error);
        toast.error('Failed to update feature');
        loadFeatures();
      }
    },
    [loadFeatures],
  );

  if (loading) {
    return (
      <div className="admin-tab-loading">
        <div className="auth-loading-spinner" />
      </div>
    );
  }

  return (
    <div className="kanban-container">
      <div className="kanban-header">
        <div className="kanban-stats">
          <span>{features.length} feature requests</span>
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="kanban-board">
          {COLUMNS.map((column) => {
            const columnFeatures = features.filter((f) => f.status === column.id);

            return (
              <div key={column.id} className="kanban-column">
                <div className="kanban-column-header" style={{ borderTopColor: column.color }}>
                  <span className="kanban-column-title">{column.label}</span>
                  <span className="kanban-column-count">{columnFeatures.length}</span>
                </div>
                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`kanban-column-body ${snapshot.isDraggingOver ? 'kanban-dragging-over' : ''}`}
                    >
                      {columnFeatures.map((feature, index) => (
                        <Draggable key={feature.id} draggableId={feature.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`kanban-card ${snapshot.isDragging ? 'kanban-card-dragging' : ''}`}
                            >
                              <div className="kanban-card-header">
                                <span className="kanban-card-title">{feature.title}</span>
                                {feature.priority && (
                                  <span
                                    className="kanban-card-priority"
                                    style={{ background: PRIORITY_COLORS[feature.priority] || '#6b7280' }}
                                  >
                                    {feature.priority}
                                  </span>
                                )}
                              </div>
                              <p className="kanban-card-desc">{feature.description}</p>
                              <div className="kanban-card-footer">
                                <span className="kanban-card-votes">
                                  <div className="i-ph:arrow-fat-up text-xs" />
                                  {feature.votes?.length || 0}
                                </span>
                                <span className="kanban-card-author">{feature.authorEmail}</span>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                      {columnFeatures.length === 0 && <div className="kanban-empty">No items</div>}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
}
