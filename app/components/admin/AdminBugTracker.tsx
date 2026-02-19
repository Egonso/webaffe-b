import { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, doc, updateDoc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { getFirebaseFirestore } from '~/lib/firebase/firebase';
import { toast } from 'react-toastify';
import { DragDropContext, Droppable, Draggable, type DropResult } from 'react-beautiful-dnd';

interface BugItem {
  id: string;
  title: string;
  description: string;
  steps: string;
  status: string;
  severity: string;
  author: string;
  authorEmail: string;
  createdAt: any;
}

const COLUMNS = [
  { id: 'reported', label: 'Reported', color: '#ef4444' },
  { id: 'confirmed', label: 'Confirmed', color: '#f59e0b' },
  { id: 'in-progress', label: 'In Progress', color: '#8b5cf6' },
  { id: 'fixed', label: 'Fixed', color: '#10b981' },
  { id: 'wont-fix', label: "Won't Fix", color: '#6b7280' },
];

const SEVERITY_COLORS: Record<string, string> = {
  low: '#6b7280',
  medium: '#f59e0b',
  high: '#ef4444',
  critical: '#dc2626',
};

export function AdminBugTracker() {
  const [bugs, setBugs] = useState<BugItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadBugs = useCallback(async () => {
    try {
      const db = getFirebaseFirestore();
      const q = query(collection(db, 'bugs'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const items: BugItem[] = [];

      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...docSnap.data() } as BugItem);
      });

      setBugs(items);
    } catch (error) {
      console.error('Error loading bugs:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBugs();
  }, [loadBugs]);

  const handleDragEnd = useCallback(
    async (result: DropResult) => {
      if (!result.destination) {
        return;
      }

      const bugId = result.draggableId;
      const newStatus = result.destination.droppableId;

      setBugs((prev) => prev.map((b) => (b.id === bugId ? { ...b, status: newStatus } : b)));

      try {
        const db = getFirebaseFirestore();
        await updateDoc(doc(db, 'bugs', bugId), {
          status: newStatus,
          updatedAt: serverTimestamp(),
        });
        toast.success(`Bug moved to ${COLUMNS.find((c) => c.id === newStatus)?.label}`);
      } catch (error) {
        console.error('Error updating bug:', error);
        toast.error('Failed to update bug');
        loadBugs();
      }
    },
    [loadBugs],
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
          <span>{bugs.length} bug reports</span>
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="kanban-board">
          {COLUMNS.map((column) => {
            const columnBugs = bugs.filter((b) => b.status === column.id);

            return (
              <div key={column.id} className="kanban-column">
                <div className="kanban-column-header" style={{ borderTopColor: column.color }}>
                  <span className="kanban-column-title">{column.label}</span>
                  <span className="kanban-column-count">{columnBugs.length}</span>
                </div>
                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`kanban-column-body ${snapshot.isDraggingOver ? 'kanban-dragging-over' : ''}`}
                    >
                      {columnBugs.map((bug, index) => (
                        <Draggable key={bug.id} draggableId={bug.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`kanban-card ${snapshot.isDragging ? 'kanban-card-dragging' : ''}`}
                            >
                              <div className="kanban-card-header">
                                <span className="kanban-card-title">{bug.title}</span>
                                {bug.severity && (
                                  <span
                                    className="kanban-card-priority"
                                    style={{ background: SEVERITY_COLORS[bug.severity] || '#6b7280' }}
                                  >
                                    {bug.severity}
                                  </span>
                                )}
                              </div>
                              <p className="kanban-card-desc">{bug.description}</p>
                              {bug.steps && (
                                <div className="kanban-card-steps">
                                  <div className="i-ph:list-numbers text-xs" />
                                  <span>Steps to reproduce</span>
                                </div>
                              )}
                              <div className="kanban-card-footer">
                                <span className="kanban-card-author">{bug.authorEmail}</span>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                      {columnBugs.length === 0 && <div className="kanban-empty">No items</div>}
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
