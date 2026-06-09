// src/components/common/LanguageSwitcher.tsx
import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation();
  const isUrdu = i18n.language === 'ur';

  const toggle = () => {
    const next = isUrdu ? 'en' : 'ur';
    i18n.changeLanguage(next);
    document.documentElement.dir = next === 'ur' ? 'rtl' : 'ltr';
    document.documentElement.lang = next;
  };

  return (
    <button onClick={toggle} className="lang-switcher" aria-label="Toggle language">
      <span>{isUrdu ? '🇬🇧' : '🇵🇰'}</span>
      <span className="lang-label">{t('language.toggle')}</span>
    </button>
  );
};

export default LanguageSwitcher;
