import { useState, useEffect, useCallback } from 'react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { getFirebaseFirestore } from '~/lib/firebase/firebase';
import { toast } from 'react-toastify';
import type { AppConfig } from '~/lib/stores/authStore';

export function AdminSettings() {
  const [config, setConfig] = useState<AppConfig>({ defaultModel: '', defaultProvider: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const db = getFirebaseFirestore();
      const configDoc = await getDoc(doc(db, 'config', 'app'));

      if (configDoc.exists()) {
        const data = configDoc.data();
        setConfig({
          defaultModel: data.defaultModel || '',
          defaultProvider: data.defaultProvider || '',
        });
      }
    } catch (error) {
      console.error('Error loading config:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = useCallback(async () => {
    setSaving(true);

    try {
      const db = getFirebaseFirestore();
      await setDoc(
        doc(db, 'config', 'app'),
        {
          ...config,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );
      toast.success('Settings saved');
    } catch (error) {
      console.error('Error saving config:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  }, [config]);

  if (loading) {
    return (
      <div className="admin-tab-loading">
        <div className="auth-loading-spinner" />
      </div>
    );
  }

  return (
    <div className="admin-settings">
      <div className="admin-settings-section">
        <h2 className="admin-settings-title">Default AI Configuration</h2>
        <p className="admin-settings-desc">
          Configure the default model and provider for non-admin users. Users who don't have admin access will
          automatically use these settings.
        </p>

        <div className="admin-settings-form">
          <div className="admin-settings-field">
            <label>Default Provider</label>
            <input
              type="text"
              value={config.defaultProvider}
              onChange={(e) => setConfig((prev) => ({ ...prev, defaultProvider: e.target.value }))}
              placeholder="e.g., Google, OpenAI, Anthropic"
            />
          </div>

          <div className="admin-settings-field">
            <label>Default Model</label>
            <input
              type="text"
              value={config.defaultModel}
              onChange={(e) => setConfig((prev) => ({ ...prev, defaultModel: e.target.value }))}
              placeholder="e.g., gemini-2.0-flash, gpt-4o"
            />
          </div>

          <button className="admin-settings-save" onClick={saveConfig} disabled={saving}>
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      <div className="admin-settings-section">
        <h2 className="admin-settings-title">Firebase Configuration</h2>
        <p className="admin-settings-desc">Your Firebase project is configured and active.</p>
        <div className="admin-settings-info">
          <div className="admin-settings-info-item">
            <span className="admin-settings-info-label">Project:</span>
            <span>webaffe</span>
          </div>
          <div className="admin-settings-info-item">
            <span className="admin-settings-info-label">Auth Methods:</span>
            <span>Email/Password, Google, Magic Link</span>
          </div>
          <div className="admin-settings-info-item">
            <span className="admin-settings-info-label">Database:</span>
            <span>Cloud Firestore</span>
          </div>
        </div>
      </div>
    </div>
  );
}
