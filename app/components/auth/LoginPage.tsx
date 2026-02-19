import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type AuthMode = 'login' | 'signup' | 'magic-link';

interface LoginPageProps {
  onLogin: (email: string, password: string) => Promise<any>;
  onSignUp: (email: string, password: string) => Promise<any>;
  onGoogleLogin: () => Promise<any>;
  onMagicLink: (email: string) => Promise<any>;
}

export function LoginPage({ onLogin, onSignUp, onGoogleLogin, onMagicLink }: LoginPageProps) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        await onLogin(email, password);
      } else if (mode === 'signup') {
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);

          return;
        }

        if (password.length < 6) {
          setError('Password must be at least 6 characters');
          setLoading(false);

          return;
        }

        await onSignUp(email, password);
      } else if (mode === 'magic-link') {
        await onMagicLink(email);
        setMagicLinkSent(true);
      }
    } catch (err: any) {
      const errorMessages: Record<string, string> = {
        'auth/user-not-found': 'No account found with this email',
        'auth/wrong-password': 'Incorrect password',
        'auth/email-already-in-use': 'An account with this email already exists',
        'auth/weak-password': 'Password is too weak',
        'auth/invalid-email': 'Invalid email address',
        'auth/too-many-requests': 'Too many attempts. Please try again later',
        'auth/invalid-credential': 'Invalid email or password',
      };
      setError(errorMessages[err.code] || err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);

    try {
      await onGoogleLogin();
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed');
    } finally {
      setLoading(false);
    }
  };

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
        {/* Logo & Title */}
        <div className="login-header">
          <motion.div
            className="login-logo"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 15 }}
          >
            <svg width="48" height="48" viewBox="0 0 100 100" fill="none">
              <circle cx="50" cy="50" r="45" fill="url(#logo-gradient)" />
              <path
                d="M30 55 L45 40 L60 55 L75 35"
                stroke="white"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <defs>
                <linearGradient id="logo-gradient" x1="0" y1="0" x2="100" y2="100">
                  <stop offset="0%" stopColor="#7c3aed" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
              </defs>
            </svg>
          </motion.div>
          <h1 className="login-title">WebAffe</h1>
          <p className="login-subtitle">
            {mode === 'login' && 'Sign in to your account'}
            {mode === 'signup' && 'Create your account'}
            {mode === 'magic-link' && 'Sign in with Magic Link'}
          </p>
        </div>

        {/* Google Sign-In */}
        {mode !== 'magic-link' && (
          <button type="button" className="login-google-btn" onClick={handleGoogleLogin} disabled={loading}>
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </button>
        )}

        {mode !== 'magic-link' && (
          <div className="login-divider">
            <span>or</span>
          </div>
        )}

        {/* Form */}
        <AnimatePresence mode="wait">
          <motion.form
            key={mode}
            onSubmit={handleSubmit}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="login-form"
          >
            {magicLinkSent && mode === 'magic-link' ? (
              <div className="login-magic-sent">
                <div className="login-magic-icon">✉️</div>
                <h3>Check your email</h3>
                <p>
                  We sent a sign-in link to <strong>{email}</strong>
                </p>
                <button
                  type="button"
                  className="login-text-btn"
                  onClick={() => {
                    setMagicLinkSent(false);
                    setMode('login');
                  }}
                >
                  Back to sign in
                </button>
              </div>
            ) : (
              <>
                <div className="login-field">
                  <label htmlFor="login-email">Email</label>
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    autoComplete="email"
                  />
                </div>

                {mode !== 'magic-link' && (
                  <div className="login-field">
                    <label htmlFor="login-password">Password</label>
                    <input
                      id="login-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    />
                  </div>
                )}

                {mode === 'signup' && (
                  <div className="login-field">
                    <label htmlFor="login-confirm-password">Confirm Password</label>
                    <input
                      id="login-confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      autoComplete="new-password"
                    />
                  </div>
                )}

                {error && (
                  <motion.div className="login-error" initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}>
                    {error}
                  </motion.div>
                )}

                <button type="submit" className="login-submit-btn" disabled={loading}>
                  {loading ? (
                    <div className="login-spinner" />
                  ) : mode === 'login' ? (
                    'Sign In'
                  ) : mode === 'signup' ? (
                    'Create Account'
                  ) : (
                    'Send Magic Link'
                  )}
                </button>
              </>
            )}
          </motion.form>
        </AnimatePresence>

        {/* Mode Switcher */}
        <div className="login-footer">
          {mode === 'login' && (
            <>
              <button type="button" className="login-text-btn" onClick={() => setMode('signup')}>
                Don't have an account? <strong>Sign up</strong>
              </button>
              <button
                type="button"
                className="login-text-btn login-text-btn-subtle"
                onClick={() => setMode('magic-link')}
              >
                Sign in with Magic Link
              </button>
            </>
          )}
          {mode === 'signup' && (
            <button type="button" className="login-text-btn" onClick={() => setMode('login')}>
              Already have an account? <strong>Sign in</strong>
            </button>
          )}
          {mode === 'magic-link' && !magicLinkSent && (
            <button type="button" className="login-text-btn" onClick={() => setMode('login')}>
              Back to <strong>Sign in</strong>
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
