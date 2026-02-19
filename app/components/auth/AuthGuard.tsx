import { useAuth } from '~/lib/hooks/useAuth';
import { LoginPage } from './LoginPage';
import { WaitingApproval } from './WaitingApproval';
import { motion } from 'framer-motion';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const {
    loading,
    isAuthenticated,
    isApproved,
    loginWithEmail,
    signUpWithEmail,
    loginWithGoogle,
    sendMagicLink,
    logout,
    profile,
  } = useAuth();

  if (loading) {
    return (
      <div className="auth-loading">
        <motion.div
          className="auth-loading-content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="auth-loading-spinner" />
          <p>Loading...</p>
        </motion.div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <LoginPage
        onLogin={loginWithEmail}
        onSignUp={signUpWithEmail}
        onGoogleLogin={loginWithGoogle}
        onMagicLink={sendMagicLink}
      />
    );
  }

  if (!isApproved) {
    return <WaitingApproval email={profile?.email || ''} onLogout={logout} />;
  }

  return <>{children}</>;
}
