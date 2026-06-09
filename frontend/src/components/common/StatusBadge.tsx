// src/components/common/StatusBadge.tsx
import { useTranslation } from 'react-i18next';
import type { PotholeStatus } from '@/types';

interface StyleConfig {
  color: string;
  bg: string;
  emoji: string;
}

const STATUS_STYLES: Record<PotholeStatus, StyleConfig> = {
  Reported:     { color: '#3b82f6', bg: '#eff6ff', emoji: '📍' },
  'In Progress':{ color: '#f59e0b', bg: '#fffbeb', emoji: '🔧' },
  Resolved:     { color: '#10b981', bg: '#ecfdf5', emoji: '✅' },
  Flagged:      { color: '#6b7280', bg: '#f9fafb', emoji: '🚩' },
};

interface Props {
  status: PotholeStatus;
}

const StatusBadge = ({ status }: Props) => {
  const { t } = useTranslation();
  const style = STATUS_STYLES[status] ?? STATUS_STYLES.Reported;

  return (
    <span
      className="status-badge"
      style={{ color: style.color, backgroundColor: style.bg, border: `1px solid ${style.color}44` }}
    >
      {style.emoji} {t(`status.${status}`, status)}
    </span>
  );
};

export default StatusBadge;
