// src/pages/admin/AdminLoginPage.tsx
import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate, useLocation, type Location } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';

interface LocationState {
  from?: Location;
}

const AdminLoginPage = () => {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const state = location.state as LocationState | null;
  const from = state?.from?.pathname ?? '/admin/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast.error(t('errors.required')); return; }
    setLoading(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        t('errors.generic');
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <span className="login-logo">🚧</span>
          <h1>{t('admin.login_title')}</h1>
          <p>{t('admin.login_subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">{t('admin.email')}</label>
            <input
              id="email" type="email" value={email}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              className="form-input" placeholder="admin@fixkarachi.pk"
              autoComplete="email" required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">{t('admin.password')}</label>
            <input
              id="password" type="password" value={password}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              className="form-input" placeholder="••••••••"
              autoComplete="current-password" required
            />
          </div>
          <button type="submit" className="btn-primary btn-full" disabled={loading}>
            {loading ? `⏳ ${t('admin.logging_in')}` : `🔐 ${t('admin.login_btn')}`}
          </button>
        </form>

        <div className="login-footer">
          <p>Default: admin@fixkarachi.pk / Admin@1234</p>
          <p>Run <code>pnpm seed</code> to create the admin user</p>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
