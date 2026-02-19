import { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, doc, updateDoc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { getFirebaseFirestore } from '~/lib/firebase/firebase';
import { toast } from 'react-toastify';

interface SupportTicket {
  id: string;
  subject: string;
  message: string;
  status: string;
  priority: string;
  author: string;
  authorEmail: string;
  createdAt: any;
  messages: Array<{ text: string; sender: string; timestamp: any }>;
}

const STATUS_COLORS: Record<string, string> = {
  open: '#3b82f6',
  'in-progress': '#8b5cf6',
  waiting: '#f59e0b',
  resolved: '#10b981',
  closed: '#6b7280',
};

export function AdminSupportDashboard() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [filter, setFilter] = useState<string>('all');

  const loadTickets = useCallback(async () => {
    try {
      const db = getFirebaseFirestore();
      const q = query(collection(db, 'support'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const items: SupportTicket[] = [];

      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...docSnap.data() } as SupportTicket);
      });

      setTickets(items);
    } catch (error) {
      console.error('Error loading tickets:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  const updateTicketStatus = useCallback(
    async (ticketId: string, status: string) => {
      try {
        const db = getFirebaseFirestore();
        await updateDoc(doc(db, 'support', ticketId), { status, updatedAt: serverTimestamp() });
        toast.success(`Ticket ${status}`);
        loadTickets();
      } catch (error) {
        console.error('Error updating ticket:', error);
        toast.error('Failed to update ticket');
      }
    },
    [loadTickets],
  );

  const filteredTickets = tickets.filter((t) => (filter === 'all' ? true : t.status === filter));

  const openCount = tickets.filter((t) => t.status === 'open').length;

  if (loading) {
    return (
      <div className="admin-tab-loading">
        <div className="auth-loading-spinner" />
      </div>
    );
  }

  return (
    <div className="support-dashboard">
      {/* Stats */}
      <div className="um-stats">
        <div className="um-stat-card">
          <div className="um-stat-value">{tickets.length}</div>
          <div className="um-stat-label">Total Tickets</div>
        </div>
        <div className="um-stat-card um-stat-warning">
          <div className="um-stat-value">{openCount}</div>
          <div className="um-stat-label">Open</div>
        </div>
        <div className="um-stat-card">
          <div className="um-stat-value">{tickets.filter((t) => t.status === 'in-progress').length}</div>
          <div className="um-stat-label">In Progress</div>
        </div>
        <div className="um-stat-card">
          <div className="um-stat-value">{tickets.filter((t) => t.status === 'resolved').length}</div>
          <div className="um-stat-label">Resolved</div>
        </div>
      </div>

      {/* Filters */}
      <div className="um-toolbar">
        <div className="um-filters">
          {['all', 'open', 'in-progress', 'waiting', 'resolved', 'closed'].map((s) => (
            <button key={s} className={`um-filter-btn ${filter === s ? 'active' : ''}`} onClick={() => setFilter(s)}>
              {s === 'all' ? 'All' : s === 'in-progress' ? 'In Progress' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Ticket List */}
      <div className="support-list">
        {filteredTickets.length === 0 ? (
          <div className="um-empty">No support tickets</div>
        ) : (
          filteredTickets.map((ticket) => (
            <div
              key={ticket.id}
              className={`support-ticket-card ${selectedTicket?.id === ticket.id ? 'selected' : ''}`}
              onClick={() => setSelectedTicket(ticket)}
            >
              <div className="support-ticket-header">
                <span className="support-ticket-subject">{ticket.subject}</span>
                <span
                  className="support-ticket-status"
                  style={{ background: STATUS_COLORS[ticket.status] || '#6b7280' }}
                >
                  {ticket.status}
                </span>
              </div>
              <p className="support-ticket-preview">{ticket.message?.substring(0, 120)}...</p>
              <div className="support-ticket-meta">
                <span>{ticket.authorEmail}</span>
                <div className="support-ticket-actions">
                  {ticket.status === 'open' && (
                    <button
                      className="um-action-btn um-action-approve"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateTicketStatus(ticket.id, 'in-progress');
                      }}
                    >
                      Start
                    </button>
                  )}
                  {ticket.status !== 'resolved' && ticket.status !== 'closed' && (
                    <button
                      className="um-action-btn um-action-promote"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateTicketStatus(ticket.id, 'resolved');
                      }}
                    >
                      Resolve
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
