// src/pages/admin/AdminDashboard.tsx
import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { MapContainer, TileLayer } from 'react-leaflet';
import toast from 'react-hot-toast';
import 'leaflet/dist/leaflet.css';
import { useAuth } from '@/context/AuthContext';
import { adminApi } from '@/utils/api';
import HeatmapLayer from '@/components/map/HeatmapLayer';
import SeverityBadge from '@/components/common/SeverityBadge';
import StatusBadge from '@/components/common/StatusBadge';
import type {
  DashboardStats,
  HeatmapPoint,
  Pothole,
  PotholeStatus,
} from '@/types';
import type { LatLngTuple } from 'leaflet';

const KARACHI_CENTER: LatLngTuple = [24.8607, 67.0011];
type Tab = 'overview' | 'heatmap' | 'reports';

const AdminDashboard = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();

  const [stats, setStats]         = useState<DashboardStats | null>(null);
  const [heatmap, setHeatmap]     = useState<HeatmapPoint[]>([]);
  const [potholes, setPotholes]   = useState<Pothole[]>([]);
  const [total, setTotal]         = useState(0);
  const [pages, setPages]         = useState(1);
  const [filter, setFilter]       = useState<PotholeStatus | ''>('');
  const [currentPage, setPage]    = useState(1);
  const [loading, setLoading]     = useState(true);
  const [tab, setTab]             = useState<Tab>('overview');

  const fetchStats = useCallback(async () => {
    const res = await adminApi.getStats();
    setStats(res.data.data);
  }, []);

  const fetchHeatmap = useCallback(async () => {
    const res = await adminApi.getHeatmap();
    setHeatmap(res.data.data);
  }, []);

  const fetchPotholes = useCallback(async () => {
    const res = await adminApi.getAllPotholes({
      page: currentPage, limit: 20, ...(filter ? { status: filter } : {}),
    });
    setPotholes(res.data.data);
    setTotal(res.data.pagination.total);
    setPages(res.data.pagination.pages);
  }, [currentPage, filter]);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchStats(), fetchHeatmap(), fetchPotholes()])
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, [fetchStats, fetchHeatmap, fetchPotholes]);

  // ── Action handlers ──────────────────────────────────────────────
  const handleStatus = async (id: string, status: PotholeStatus) => {
    try {
      await adminApi.updateStatus(id, status);
      toast.success(t('admin.update_success'));
      void fetchPotholes();
      void fetchStats();
      void fetchHeatmap();
    } catch { toast.error(t('errors.generic')); }
  };

  const handleFlag = async (id: string) => {
    const reason = window.prompt('Flag reason (optional):') ?? 'Duplicate or spam';
    try {
      await adminApi.flagPothole(id, reason);
      toast.success('Report flagged.');
      void fetchPotholes();
    } catch { toast.error(t('errors.generic')); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(t('admin.confirm_delete'))) return;
    try {
      await adminApi.deletePothole(id);
      toast.success(t('admin.delete_success'));
      void fetchPotholes();
      void fetchStats();
    } catch { toast.error(t('errors.generic')); }
  };

  // ── Helpers ──────────────────────────────────────────────────────
  const statusCount = (s: PotholeStatus) =>
    stats?.statusBreakdown.find((b) => b.status === s)?.count ?? 0;

  const statCards = [
    { key: 'total',    label: t('home.stats_total'),       value: stats?.totalCount ?? 0,            cls: 'total'    },
    { key: 'reported', label: '📍 Reported',               value: statusCount('Reported'),            cls: 'reported' },
    { key: 'progress', label: '🔧 In Progress',            value: statusCount('In Progress'),         cls: 'progress' },
    { key: 'resolved', label: '✅ Resolved',               value: statusCount('Resolved'),            cls: 'resolved' },
    { key: 'severity', label: '🔥 Avg. Severity',          value: stats?.averageSeverityScore ?? '—', cls: 'severity' },
  ];

  const tabs: Array<{ id: Tab; label: string }> = [
    { id: 'overview', label: '📊 Overview'                    },
    { id: 'heatmap',  label: `🌡️ ${t('admin.heatmap_title')}` },
    { id: 'reports',  label: `📋 ${t('admin.reports_title')}` },
  ];

  const filterOptions: Array<{ value: PotholeStatus | ''; label: string }> = [
    { value: '',            label: t('admin.filter_all') },
    { value: 'Reported',    label: 'Reported'            },
    { value: 'In Progress', label: 'In Progress'         },
    { value: 'Resolved',    label: 'Resolved'            },
    { value: 'Flagged',     label: 'Flagged'             },
  ];

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <header className="admin-header">
        <div className="admin-header-left">
          <span className="admin-logo">🚧</span>
          <div>
            <h1>{t('admin.dashboard_title')}</h1>
            <span className="admin-user">
              {user?.name} · <span className="admin-role">{user?.role}</span>
            </span>
          </div>
        </div>
        <button onClick={logout} className="btn-logout">🚪 {t('admin.logout')}</button>
      </header>

      {/* Tabs */}
      <div className="admin-tabs">
        {tabs.map(({ id, label }) => (
          <button
            key={id} onClick={() => setTab(id)}
            className={`admin-tab${tab === id ? ' active' : ''}`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="admin-loading"><div className="spinner" /><p>Loading…</p></div>
      ) : (
        <div className="admin-content">
          {/* ── Overview ── */}
          {tab === 'overview' && stats && (
            <div className="overview-tab">
              <div className="stats-grid">
                {statCards.map(({ key, label, value, cls }) => (
                  <div key={key} className={`stat-card ${cls}`}>
                    <div className="stat-card-value">{value}</div>
                    <div className="stat-card-label">{label}</div>
                  </div>
                ))}
              </div>
              <div className="overview-tables">
                <div className="mini-table-section">
                  <h3>🕐 Recent Reports</h3>
                  <div className="mini-table">
                    {stats.recentReports.map((p) => (
                      <div key={p._id} className="mini-table-row">
                        <span className="mini-address">{p.address ?? 'No address'}</span>
                        <StatusBadge status={p.status} />
                        <SeverityBadge score={p.severityScore} />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mini-table-section">
                  <h3>🔥 Top Priority</h3>
                  <div className="mini-table">
                    {stats.topSeverityAreas.map((p) => (
                      <div key={p._id} className="mini-table-row">
                        <span className="mini-address">{p.address ?? 'No address'}</span>
                        <SeverityBadge score={p.severityScore} />
                        <StatusBadge status={p.status} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Heatmap ── */}
          {tab === 'heatmap' && (
            <div className="heatmap-tab">
              <div className="heatmap-info">
                <span>📍 {heatmap.length} active reports</span>
                <span className="legend-inline">
                  {[
                    { c: '#ef4444', l: 'High' },
                    { c: '#f97316', l: 'Medium' },
                    { c: '#3b82f6', l: 'Low' },
                    { c: '#10b981', l: 'Resolved' },
                  ].map(({ c, l }) => (
                    <span key={l}>
                      <span className="ldot" style={{ background: c }} />
                      {l}
                    </span>
                  ))}
                </span>
              </div>
              <div className="heatmap-container">
                <MapContainer
                  center={KARACHI_CENTER} zoom={12}
                  style={{ height: '550px', width: '100%', borderRadius: '12px' }}
                >
                  <TileLayer
                    attribution="&copy; OpenStreetMap contributors"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <HeatmapLayer points={heatmap} />
                </MapContainer>
              </div>
            </div>
          )}

          {/* ── Reports ── */}
          {tab === 'reports' && (
            <div className="reports-tab">
              <div className="reports-toolbar">
                <select
                  value={filter}
                  onChange={(e) => {
                    setFilter(e.target.value as PotholeStatus | '');
                    setPage(1);
                  }}
                  className="status-filter"
                >
                  {filterOptions.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                <span className="reports-count">{total} total</span>
              </div>

              <div className="table-wrapper">
                <table className="reports-table">
                  <thead>
                    <tr>
                      <th>{t('admin.col_location')}</th>
                      <th>{t('admin.col_severity')}</th>
                      <th>{t('admin.col_status')}</th>
                      <th>{t('admin.col_date')}</th>
                      <th>{t('admin.col_actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {potholes.length === 0 ? (
                      <tr><td colSpan={5} className="no-data">{t('admin.no_reports')}</td></tr>
                    ) : potholes.map((p) => (
                      <tr key={p._id} className={p.isFlagged ? 'row-flagged' : ''}>
                        <td className="col-location">
                          <div>{p.address ?? '—'}</div>
                          <small className="coords-text">
                            {p.location.coordinates[1].toFixed(4)}, {p.location.coordinates[0].toFixed(4)}
                          </small>
                          {p.clusterCount > 0 && (
                            <span className="cluster-badge">🔥 +{p.clusterCount} cluster</span>
                          )}
                        </td>
                        <td><SeverityBadge score={p.severityScore} /></td>
                        <td><StatusBadge status={p.status} /></td>
                        <td className="col-date">
                          {new Date(p.createdAt).toLocaleDateString('en-PK', {
                            day: '2-digit', month: 'short', year: 'numeric',
                          })}
                        </td>
                        <td className="col-actions">
                          <div className="action-buttons">
                            {p.status !== 'In Progress' && p.status !== 'Resolved' && (
                              <button
                                onClick={() => handleStatus(p._id, 'In Progress')}
                                className="action-btn progress-btn"
                                title={t('admin.action_progress')}
                              >🔧</button>
                            )}
                            {p.status !== 'Resolved' && (
                              <button
                                onClick={() => handleStatus(p._id, 'Resolved')}
                                className="action-btn resolve-btn"
                                title={t('admin.action_resolve')}
                              >✅</button>
                            )}
                            {!p.isFlagged && (
                              <button
                                onClick={() => handleFlag(p._id)}
                                className="action-btn flag-btn"
                                title={t('admin.action_flag')}
                              >🚩</button>
                            )}
                            <button
                              onClick={() => handleDelete(p._id)}
                              className="action-btn delete-btn"
                              title={t('admin.action_delete')}
                            >🗑️</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {pages > 1 && (
                <div className="pagination">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1} className="page-btn"
                  >← Prev</button>
                  <span className="page-info">Page {currentPage} of {pages}</span>
                  <button
                    onClick={() => setPage((p) => Math.min(pages, p + 1))}
                    disabled={currentPage === pages} className="page-btn"
                  >Next →</button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
