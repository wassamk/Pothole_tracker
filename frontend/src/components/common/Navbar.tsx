// src/components/common/Navbar.tsx
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';

const Navbar = () => {
  const { t } = useTranslation();
  const { pathname } = useLocation();

  const navLinks: Array<{ to: string; label: string }> = [
    { to: '/', label: t('nav.home') },
    { to: '/report', label: t('nav.report') },
    { to: '/map', label: t('nav.map') },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">🚧</span>
          <span className="brand-name">{t('app.name')}</span>
        </Link>

        <ul className="navbar-links">
          {navLinks.map(({ to, label }) => (
            <li key={to}>
              <Link to={to} className={`nav-link${pathname === to ? ' active' : ''}`}>
                {label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="navbar-actions">
          <LanguageSwitcher />
          <Link to="/admin/login" className="btn-admin-nav">
            {t('nav.admin')}
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
