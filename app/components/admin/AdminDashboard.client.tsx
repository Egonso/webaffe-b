import { useState } from 'react';
import { useAuth } from '~/lib/hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { UserManagement } from './UserManagement';
import { AdminFeatureBoard } from './AdminFeatureBoard';
import { AdminBugTracker } from './AdminBugTracker';
import { AdminSupportDashboard } from './AdminSupportDashboard';
import { AdminSettings } from './AdminSettings';

type AdminTab = 'users' | 'features' | 'bugs' | 'support' | 'settings';

const TABS: { id: AdminTab; label: string; icon: string }[] = [
  { id: 'users', label: 'Users', icon: 'i-ph:users-three' },
  { id: 'features', label: 'Features', icon: 'i-ph:lightbulb' },
  { id: 'bugs', label: 'Bugs', icon: 'i-ph:bug' },
  { id: 'support', label: 'Support', icon: 'i-ph:headset' },
  { id: 'settings', label: 'Settings', icon: 'i-ph:gear-six' },
];

export function AdminDashboard() {
  const { isAdmin, loading, profile } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('users');

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="auth-loading-spinner" />
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="admin-denied">
        <div className="admin-denied-content">
          <div className="admin-denied-icon">🔒</div>
          <h1>Access Denied</h1>
          <p>You don't have permission to access the Admin Dashboard.</p>
          <a href="/" className="admin-back-link">
            ← Back to WebAffe
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <a href="/" className="admin-logo-link">
            <svg width="28" height="28" viewBox="0 0 100 100" fill="none">
              <circle cx="50" cy="50" r="45" fill="url(#admin-logo-grad)" />
              <path
                d="M30 55 L45 40 L60 55 L75 35"
                stroke="white"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <defs>
                <linearGradient id="admin-logo-grad" x1="0" y1="0" x2="100" y2="100">
                  <stop offset="0%" stopColor="#7c3aed" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
              </defs>
            </svg>
            <span>WebAffe</span>
          </a>
          <span className="admin-badge">Admin</span>
        </div>

        <nav className="admin-nav">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`admin-nav-item ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <div className={`${tab.icon} text-lg`} />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-user-info">
            <div className="admin-user-avatar">{profile?.displayName?.[0]?.toUpperCase() || 'A'}</div>
            <div className="admin-user-details">
              <span className="admin-user-name">{profile?.displayName || 'Admin'}</span>
              <span className="admin-user-email">{profile?.email}</span>
            </div>
          </div>
          <a href="/" className="admin-back-btn">
            <div className="i-ph:arrow-left text-sm" />
            Back to App
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <header className="admin-header">
          <h1 className="admin-page-title">{TABS.find((t) => t.id === activeTab)?.label}</h1>
        </header>

        <div className="admin-content">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="admin-tab-content"
            >
              {activeTab === 'users' && <UserManagement />}
              {activeTab === 'features' && <AdminFeatureBoard />}
              {activeTab === 'bugs' && <AdminBugTracker />}
              {activeTab === 'support' && <AdminSupportDashboard />}
              {activeTab === 'settings' && <AdminSettings />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
