// src/components/common/SeverityBadge.tsx
interface SeverityLevel {
  label: string;
  color: string;
  bg: string;
  emoji: string;
}

const getLevel = (score: number): SeverityLevel => {
  if (score >= 41) return { label: 'HIGH',   color: '#ef4444', bg: '#fef2f2', emoji: '🔴' };
  if (score >= 21) return { label: 'MEDIUM', color: '#f97316', bg: '#fff7ed', emoji: '🟠' };
  return              { label: 'LOW',    color: '#22c55e', bg: '#f0fdf4', emoji: '🟢' };
};

interface Props {
  score: number;
  showScore?: boolean;
}

const SeverityBadge = ({ score, showScore = true }: Props) => {
  const level = getLevel(score);
  return (
    <span
      className="severity-badge"
      style={{ color: level.color, backgroundColor: level.bg, border: `1px solid ${level.color}33` }}
    >
      {level.emoji} {level.label}
      {showScore && <span className="severity-score"> ({score})</span>}
    </span>
  );
};

export default SeverityBadge;
