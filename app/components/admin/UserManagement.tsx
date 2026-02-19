import { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, doc, updateDoc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { getFirebaseFirestore } from '~/lib/firebase/firebase';
import { toast } from 'react-toastify';

interface UserRecord {
  uid: string;
  email: string;
  displayName: string;
  role: string;
  isApproved: boolean;
  createdAt: any;
  lastLogin: any;
}

export function UserManagement() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'admin'>('all');

  const loadUsers = useCallback(async () => {
    try {
      const db = getFirebaseFirestore();
      const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const userList: UserRecord[] = [];

      snapshot.forEach((docSnap) => {
        userList.push({ uid: docSnap.id, ...docSnap.data() } as UserRecord);
      });

      setUsers(userList);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const updateUser = useCallback(
    async (uid: string, data: Partial<UserRecord>) => {
      try {
        const db = getFirebaseFirestore();
        await updateDoc(doc(db, 'users', uid), { ...data, updatedAt: serverTimestamp() });
        toast.success('User updated');
        loadUsers();
      } catch (error) {
        console.error('Error updating user:', error);
        toast.error('Failed to update user');
      }
    },
    [loadUsers],
  );

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      !search ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.displayName?.toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      filter === 'all' ||
      (filter === 'pending' && !u.isApproved) ||
      (filter === 'approved' && u.isApproved && u.role !== 'admin') ||
      (filter === 'admin' && u.role === 'admin');

    return matchesSearch && matchesFilter;
  });

  const pendingCount = users.filter((u) => !u.isApproved).length;

  if (loading) {
    return (
      <div className="admin-tab-loading">
        <div className="auth-loading-spinner" />
      </div>
    );
  }

  return (
    <div className="um-container">
      {/* Stats */}
      <div className="um-stats">
        <div className="um-stat-card">
          <div className="um-stat-value">{users.length}</div>
          <div className="um-stat-label">Total Users</div>
        </div>
        <div className="um-stat-card um-stat-warning">
          <div className="um-stat-value">{pendingCount}</div>
          <div className="um-stat-label">Pending Approval</div>
        </div>
        <div className="um-stat-card">
          <div className="um-stat-value">{users.filter((u) => u.isApproved).length}</div>
          <div className="um-stat-label">Approved</div>
        </div>
        <div className="um-stat-card">
          <div className="um-stat-value">{users.filter((u) => u.role === 'admin').length}</div>
          <div className="um-stat-label">Admins</div>
        </div>
      </div>

      {/* Filters */}
      <div className="um-toolbar">
        <div className="um-search">
          <div className="i-ph:magnifying-glass text-sm" />
          <input type="text" placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="um-filters">
          {(['all', 'pending', 'approved', 'admin'] as const).map((f) => (
            <button key={f} className={`um-filter-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
              {f === 'all'
                ? 'All'
                : f === 'pending'
                  ? `Pending (${pendingCount})`
                  : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* User List */}
      <div className="um-list">
        {filteredUsers.length === 0 ? (
          <div className="um-empty">No users found</div>
        ) : (
          filteredUsers.map((user) => (
            <div key={user.uid} className={`um-user-card ${!user.isApproved ? 'um-user-pending' : ''}`}>
              <div className="um-user-main">
                <div className="um-user-avatar">
                  {user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="um-user-info">
                  <div className="um-user-name">{user.displayName || 'No name'}</div>
                  <div className="um-user-email">{user.email}</div>
                </div>
                <div className="um-user-meta">
                  <span className={`um-role-badge ${user.role === 'admin' ? 'um-role-admin' : 'um-role-user'}`}>
                    {user.role}
                  </span>
                  {!user.isApproved && <span className="um-status-badge um-status-pending">Pending</span>}
                </div>
              </div>
              <div className="um-user-actions">
                {!user.isApproved && (
                  <button
                    className="um-action-btn um-action-approve"
                    onClick={() => updateUser(user.uid, { isApproved: true })}
                  >
                    <div className="i-ph:check-circle text-sm" />
                    Approve
                  </button>
                )}
                {user.isApproved && user.role !== 'admin' && (
                  <button
                    className="um-action-btn um-action-promote"
                    onClick={() => updateUser(user.uid, { role: 'admin' })}
                  >
                    <div className="i-ph:shield-check text-sm" />
                    Make Admin
                  </button>
                )}
                {user.role === 'admin' && user.email !== 'mo.feich@gmail.com' && (
                  <button
                    className="um-action-btn um-action-demote"
                    onClick={() => updateUser(user.uid, { role: 'user' })}
                  >
                    <div className="i-ph:shield-slash text-sm" />
                    Remove Admin
                  </button>
                )}
                {user.isApproved && user.email !== 'mo.feich@gmail.com' && (
                  <button
                    className="um-action-btn um-action-revoke"
                    onClick={() => updateUser(user.uid, { isApproved: false })}
                  >
                    <div className="i-ph:x-circle text-sm" />
                    Revoke
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
