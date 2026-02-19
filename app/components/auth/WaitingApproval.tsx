import { motion } from 'framer-motion';

interface WaitingApprovalProps {
  email: string;
  onLogout: () => void;
}

export function WaitingApproval({ email, onLogout }: WaitingApprovalProps) {
  return (
    <div className="login-page">
      <div className="login-background">
        <div className="login-gradient-orb login-gradient-orb-1" />
        <div className="login-gradient-orb login-gradient-orb-2" />
        <div className="login-gradient-orb login-gradient-orb-3" />
      </div>

      <motion.div
        className="login-container"
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      >
        <div className="waiting-content">
          <motion.div
            className="waiting-icon"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            ⏳
          </motion.div>
          <h1 className="waiting-title">Waiting for Approval</h1>
          <p className="waiting-subtitle">
            Your account <strong>{email}</strong> has been registered successfully.
          </p>
          <p className="waiting-description">
            An administrator needs to approve your account before you can access WebAffe. You'll be able to use the
            platform as soon as you're approved.
          </p>
          <div className="waiting-status">
            <div className="waiting-status-dot" />
            <span>Pending admin approval</span>
          </div>
          <button type="button" className="login-text-btn" onClick={onLogout} style={{ marginTop: '2rem' }}>
            Sign in with a different account
          </button>
        </div>
      </motion.div>
    </div>
  );
}
