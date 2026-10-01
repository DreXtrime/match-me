import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api.js';
import { Btn } from '../components/Btn.tsx';

interface LoginPageProps {
  onLogin: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('token')) {
      navigate('/');
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authService.login(email, password);
      localStorage.setItem('token', response.token);
      localStorage.setItem('userId', response.userId);
      onLogin();
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-[400px] border-2 border-border">
        {/* Header */}
        <div className="bg-surface border-b-2 border-border px-5 py-2">
          <span className="text-yellow font-bold text-sm uppercase tracking-wider" style={{ fontFamily: 'var(--font-ui)' }}>
            Match-Me
          </span>
        </div>

        <div className="bg-panel px-6 py-6 flex flex-col gap-5">
          <h1 className="text-text font-bold text-xl m-0" style={{ fontFamily: 'var(--font-ui)' }}>
            Sign in
          </h1>

          {error && (
            <div className="border border-red/30 bg-red/10 text-red px-4 py-3 text-sm" style={{ fontFamily: 'var(--font-ui)' }}>
              ✕ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-muted text-xs font-bold uppercase tracking-wider" style={{ fontFamily: 'var(--font-ui)' }}>
                Email
              </label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-muted text-xs font-bold uppercase tracking-wider" style={{ fontFamily: 'var(--font-ui)' }}>
                Password
              </label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>

            <Btn variant="chat" onClick={() => {}}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Btn>
          </form>

          <p className="text-muted text-sm m-0 text-center" style={{ fontFamily: 'var(--font-ui)' }}>
            No account? <a href="/register">Sign up here</a>
          </p>
        </div>
      </div>
    </div>
  );
};
