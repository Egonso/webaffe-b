import { json, type MetaFunction } from '@remix-run/cloudflare';
import { ClientOnly } from 'remix-utils/client-only';
import { AdminDashboard } from '~/components/admin/AdminDashboard.client';

export const meta: MetaFunction = () => {
  return [{ title: 'Admin Dashboard | WebAffe' }, { name: 'description', content: 'WebAffe Admin Dashboard' }];
};

export const loader = () => json({});

export default function AdminRoute() {
  return (
    <ClientOnly
      fallback={
        <div className="auth-loading">
          <div className="auth-loading-content">
            <div className="auth-loading-spinner" />
            <p>Loading Admin Dashboard...</p>
          </div>
        </div>
      }
    >
      {() => <AdminDashboard />}
    </ClientOnly>
  );
}
