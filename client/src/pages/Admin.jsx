import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiUsers, FiMessageCircle, FiAlertTriangle, FiLogOut,
  FiRefreshCw, FiActivity, FiBarChart2, FiTrash2,
  FiUserX, FiX, FiMessageSquare
} from 'react-icons/fi';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';
import Logo from '../components/Logo';
import './Admin.css';

// ===== CHART COMPONENTS =====

const AreaChart = ({ data, dataKey, color = '#7c3aed', height = 200, labelKey = 'label', title, subtitle }) => {
  if (!data || data.length === 0) return <div className="chart-empty">No data available</div>;
  const maxVal = Math.max(...data.map(d => d[dataKey]), 1);
  const pad = { top: 20, right: 20, bottom: 40, left: 50 };
  const W = 600, H = height, iW = W - pad.left - pad.right, iH = H - pad.top - pad.bottom;
  const pts = data.map((d, i) => ({
    x: pad.left + (i / (data.length - 1 || 1)) * iW,
    y: pad.top + iH - (d[dataKey] / maxVal) * iH,
    v: d[dataKey], l: d[labelKey]
  }));
  const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const area = `${line} L ${pts[pts.length - 1].x} ${pad.top + iH} L ${pts[0].x} ${pad.top + iH} Z`;
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(f => ({ v: Math.round(maxVal * f), y: pad.top + iH - f * iH }));
  const step = Math.max(1, Math.floor(data.length / 7));

  return (
    <div className="chart-card glass">
      {title && <div className="chart-header"><h3 className="chart-title">{title}</h3>{subtitle && <span className="chart-subtitle">{subtitle}</span>}</div>}
      <svg viewBox={`0 0 ${W} ${H}`} className="chart-svg">
        <defs>
          <linearGradient id={`g-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" /><stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {yTicks.map((t, i) => (
          <g key={i}>
            <line x1={pad.left} y1={t.y} x2={W - pad.right} y2={t.y} stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
            <text x={pad.left - 10} y={t.y + 4} textAnchor="end" fill="rgba(255,255,255,0.35)" fontSize="11" fontFamily="Inter">{t.v}</text>
          </g>
        ))}
        <path d={area} fill={`url(#g-${color.replace('#','')})`} />
        <path d={line} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {pts.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="4" fill={color} stroke="rgba(0,0,0,0.3)" strokeWidth="1.5" opacity={data[i][dataKey] > 0 ? 1 : 0.3} />
            {data[i][dataKey] > 0 && <text x={p.x} y={p.y - 10} textAnchor="middle" fill={color} fontSize="10" fontWeight="600" fontFamily="Inter">{p.v}</text>}
          </g>
        ))}
        {data.map((d, i) => i % step === 0 && <text key={i} x={pts[i].x} y={H - 8} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="10" fontFamily="Inter">{d[labelKey]}</text>)}
      </svg>
    </div>
  );
};

const BarChart = ({ data, bars, height = 220, labelKey = 'label', title, subtitle }) => {
  if (!data || data.length === 0) return <div className="chart-empty">No data</div>;
  const maxVal = Math.max(...data.flatMap(d => bars.map(b => d[b.key])), 1);
  const pad = { top: 20, right: 20, bottom: 50, left: 50 };
  const W = 600, H = height, iW = W - pad.left - pad.right, iH = H - pad.top - pad.bottom;
  const barGW = iW / data.length;
  const barW = Math.min(barGW * 0.6 / bars.length, 40);
  const gap = 3;
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(f => ({ v: Math.round(maxVal * f), y: pad.top + iH - f * iH }));

  return (
    <div className="chart-card glass">
      {title && <div className="chart-header"><h3 className="chart-title">{title}</h3>{subtitle && <span className="chart-subtitle">{subtitle}</span>}</div>}
      <div className="chart-legend">{bars.map(b => <div key={b.key} className="legend-item"><span className="legend-dot" style={{ background: b.color }} /><span>{b.label}</span></div>)}</div>
      <svg viewBox={`0 0 ${W} ${H}`} className="chart-svg">
        {yTicks.map((t, i) => (
          <g key={i}>
            <line x1={pad.left} y1={t.y} x2={W - pad.right} y2={t.y} stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
            <text x={pad.left - 10} y={t.y + 4} textAnchor="end" fill="rgba(255,255,255,0.35)" fontSize="11" fontFamily="Inter">{t.v}</text>
          </g>
        ))}
        {data.map((d, i) => {
          const gX = pad.left + i * barGW + barGW / 2;
          const totalBW = bars.length * barW + (bars.length - 1) * gap;
          const sX = gX - totalBW / 2;
          return (
            <g key={i}>
              {bars.map((b, bi) => {
                const bH = (d[b.key] / maxVal) * iH;
                const x = sX + bi * (barW + gap);
                const y = pad.top + iH - bH;
                return (
                  <g key={b.key}>
                    <rect x={x} y={y} width={barW} height={bH} fill={b.color} rx="3" opacity="0.85" />
                    {d[b.key] > 0 && <text x={x + barW / 2} y={y - 6} textAnchor="middle" fill={b.color} fontSize="10" fontWeight="600" fontFamily="Inter">{d[b.key]}</text>}
                  </g>
                );
              })}
              <text x={gX} y={H - 10} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="11" fontFamily="Inter">{d[labelKey]}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

const DonutChart = ({ data, title, subtitle }) => {
  const total = data ? data.reduce((s, d) => s + d.value, 0) : 0;
  if (!data || total === 0) return <div className="chart-card glass"><div className="chart-header"><h3 className="chart-title">{title}</h3></div><div className="chart-empty-inner">No data yet</div></div>;
  const cx = 100, cy = 100, r = 70, sw = 24, circ = 2 * Math.PI * r;
  let off = 0;
  return (
    <div className="chart-card glass donut-chart-card">
      {title && <div className="chart-header"><h3 className="chart-title">{title}</h3>{subtitle && <span className="chart-subtitle">{subtitle}</span>}</div>}
      <div className="donut-wrapper">
        <svg viewBox="0 0 200 200" className="donut-svg">
          {data.map((d, i) => {
            const p = d.value / total, dash = p * circ, da = `${dash} ${circ - dash}`, doff = -off;
            off += dash;
            return <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={d.color} strokeWidth={sw} strokeDasharray={da} strokeDashoffset={doff} strokeLinecap="round" transform={`rotate(-90 ${cx} ${cy})`} opacity="0.85" />;
          })}
          <text x={cx} y={cy - 6} textAnchor="middle" fill="white" fontSize="28" fontWeight="800" fontFamily="Inter">{total}</text>
          <text x={cx} y={cy + 14} textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="11" fontFamily="Inter">Total</text>
        </svg>
        <div className="donut-legend">
          {data.map((d, i) => <div key={i} className="donut-legend-item"><span className="legend-dot" style={{ background: d.color }} /><span className="legend-label">{d.label}</span><span className="legend-value" style={{ color: d.color }}>{d.value}</span></div>)}
        </div>
      </div>
    </div>
  );
};

const HorizontalBarChart = ({ data, title, subtitle }) => {
  if (!data || data.length === 0) return <div className="chart-empty">No data</div>;
  const maxVal = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="chart-card glass">
      {title && <div className="chart-header"><h3 className="chart-title">{title}</h3>{subtitle && <span className="chart-subtitle">{subtitle}</span>}</div>}
      <div className="hbar-list">
        {data.map((d, i) => (
          <div key={i} className="hbar-item">
            <div className="hbar-label"><span>{d.label}</span></div>
            <div className="hbar-bar-wrapper">
              <motion.div className="hbar-bar" style={{ background: d.color }} initial={{ width: 0 }} animate={{ width: `${(d.value / maxVal) * 100}%` }} transition={{ duration: 0.8, delay: i * 0.1 }} />
            </div>
            <span className="hbar-value" style={{ color: d.color }}>{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ===== MAIN ADMIN COMPONENT =====
const Admin = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [kickedUsers, setKickedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [kickModal, setKickModal] = useState(null);
  const [kickReason, setKickReason] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('incognichat_admin_token');
    if (!token) { navigate('/admin-login'); return; }
    fetchDashboard();
    fetchAnalytics();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') { fetchOnlineUsers(); fetchKickedUsers(); }
  }, [activeTab]);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getStats();
      setStats(data.stats);
    } catch (err) {
      if (err.message?.includes('Not authorized')) {
        localStorage.removeItem('incognichat_admin_token');
        navigate('/admin-login');
      }
      toast.error('Failed to fetch stats');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try { setAnalyticsLoading(true); const d = await adminAPI.getAnalytics(); setAnalytics(d.analytics); }
    catch { toast.error('Failed to fetch analytics'); }
    finally { setAnalyticsLoading(false); }
  };

  const fetchOnlineUsers = async () => {
    try { const d = await adminAPI.getOnlineUsers(); setOnlineUsers(d.users); }
    catch { toast.error('Failed to fetch users'); }
  };

  const fetchKickedUsers = async () => {
    try { const d = await adminAPI.getKickedUsers(); setKickedUsers(d.kicked); }
    catch { /* ignore */ }
  };

  const handleKick = async (socketId) => {
    try {
      await adminAPI.kickUser(socketId, kickReason);
      toast.success('User kicked');
      setKickModal(null); setKickReason('');
      fetchOnlineUsers(); fetchDashboard();
    } catch (err) { toast.error(err.message); }
  };

  const handleUnkick = async (username) => {
    try {
      await adminAPI.unkickUser(username);
      toast.success(`${username} unkicked`);
      fetchKickedUsers();
    } catch (err) { toast.error(err.message); }
  };

  const handleClearMessages = async () => {
    if (!confirm('Clear all messages?')) return;
    try { await adminAPI.clearMessages(); toast.success('Messages cleared'); fetchDashboard(); }
    catch { toast.error('Failed to clear messages'); }
  };

  const handleLogout = () => {
    localStorage.removeItem('incognichat_admin_token');
    navigate('/');
  };

  const statCards = stats ? [
    { icon: <FiUsers />, label: 'Online Now', value: stats.onlineUsers, color: '#10b981' },
    { icon: <FiMessageCircle />, label: 'Total Messages', value: stats.totalMessages, color: '#8b5cf6' },
    { icon: <FiAlertTriangle />, label: 'Flagged', value: stats.flaggedMessages, color: '#ef4444' },
    { icon: <FiActivity />, label: 'Last Hour', value: stats.recentMessages, color: '#06b6d4' },
  ] : [];

  const modDonutData = analytics ? [
    { label: 'Clean', value: analytics.moderationStats.clean, color: '#10b981' },
    { label: 'Flagged', value: analytics.moderationStats.flagged, color: '#ef4444' }
  ] : [];

  const topChattersData = analytics ? analytics.topChatters.map((t, i) => ({
    label: t.username, value: t.count, color: ['#7c3aed', '#6366f1', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6', '#14b8a6'][i % 10]
  })) : [];

  const getAvatarColor = (name) => {
    const c = ['#7c3aed','#6366f1','#3b82f6','#06b6d4','#10b981','#f59e0b','#ef4444','#ec4899','#8b5cf6','#14b8a6'];
    let h = 0; for (let i = 0; i < (name||'').length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
    return c[Math.abs(h) % c.length];
  };

  return (
    <div className="admin-page">
      <div className="bg-grid" />

      <aside className="admin-sidebar glass-strong">
        <div className="sidebar-header">
          <Logo size={36} />
          <div>
            <h2 className="gradient-text">IncogniChat</h2>
            <span className="sidebar-role">Admin Panel</span>
          </div>
        </div>
        <nav className="sidebar-nav">
          {[
            { key: 'dashboard', icon: <FiActivity />, label: 'Dashboard' },
            { key: 'users', icon: <FiUsers />, label: 'Users' },
          ].map(tab => (
            <button key={tab.key} className={`nav-item ${activeTab === tab.key ? 'active' : ''}`} onClick={() => setActiveTab(tab.key)}>
              {tab.icon}<span>{tab.label}</span>
            </button>
          ))}
          <button className="nav-item" onClick={() => navigate('/chat')}><FiMessageCircle /><span>View Chat</span></button>
        </nav>
        <div className="sidebar-footer">
          <button className="nav-item logout" onClick={handleLogout}><FiLogOut /><span>Logout</span></button>
        </div>
      </aside>

      <main className="admin-main">
        <AnimatePresence mode="wait">
          {/* DASHBOARD */}
          {activeTab === 'dashboard' && (
            <motion.div key="dash" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="admin-content">
              <div className="content-header">
                <div><h1>Dashboard</h1><p className="content-subtitle">Real-time overview of IncogniChat</p></div>
                <div className="header-actions">
                  <button className="btn btn-danger btn-sm" onClick={handleClearMessages}><FiTrash2 /> Clear Messages</button>
                  <button className="btn btn-secondary btn-sm" onClick={() => { fetchDashboard(); fetchAnalytics(); }}><FiRefreshCw /> Refresh</button>
                </div>
              </div>
              {loading ? (
                <div className="loading-state"><div className="spinner" /><p>Loading...</p></div>
              ) : (
                <>
                  <div className="stats-grid">
                    {statCards.map((s, i) => (
                      <motion.div key={i} className="stat-card glass" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} whileHover={{ y: -4, transition: { duration: 0.2 } }}>
                        <div className="stat-icon" style={{ background: `${s.color}20`, color: s.color }}>{s.icon}</div>
                        <div className="stat-info"><span className="stat-value">{s.value}</span><span className="stat-label-text">{s.label}</span></div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Analytics Charts */}
                  <div className="dashboard-analytics-section">
                    <h2 className="section-title"><FiBarChart2 /> Analytics</h2>
                    {analyticsLoading ? (
                      <div className="loading-state"><div className="spinner" /><p>Loading analytics...</p></div>
                    ) : analytics ? (
                      <div className="analytics-grid">
                        <div className="analytics-row">
                          <div className="analytics-col-wide">
                            <BarChart data={analytics.messageActivity} bars={[{ key: 'total', label: 'Total', color: '#8b5cf6' }, { key: 'flagged', label: 'Flagged', color: '#ef4444' }]} labelKey="label" height={240} title="Message Activity" subtitle="Last 7 days" />
                          </div>
                          <div className="analytics-col-narrow">
                            <DonutChart data={modDonutData} title="Moderation" subtitle="Clean vs Flagged" />
                          </div>
                        </div>
                        <div className="analytics-row">
                          <div className="analytics-col-wide">
                            <AreaChart data={analytics.hourlyActivity} dataKey="count" labelKey="label" color="#06b6d4" height={200} title="Hourly Activity" subtitle="Peak usage hours (7 days)" />
                          </div>
                          <div className="analytics-col-narrow">
                            <HorizontalBarChart data={topChattersData} title="Top Chatters" subtitle="Most active users" />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="loading-state"><FiBarChart2 style={{ fontSize: 48, opacity: 0.3 }} /><p>No analytics data available</p></div>
                    )}
                  </div>
                </>
              )}
            </motion.div>
          )}



          {/* USERS */}
          {activeTab === 'users' && (
            <motion.div key="users" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="admin-content">
              <div className="content-header">
                <div><h1>Online Users</h1><p className="content-subtitle">Manage active connections</p></div>
                <button className="btn btn-secondary btn-sm" onClick={() => { fetchOnlineUsers(); fetchKickedUsers(); }}><FiRefreshCw /> Refresh</button>
              </div>

              {/* Online Users */}
              <div className="users-table-wrapper glass">
                <table className="users-table">
                  <thead>
                    <tr><th>User</th><th>Joined</th><th>Socket ID</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {onlineUsers.map(u => (
                      <motion.tr key={u.socketId} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="user-row">
                        <td>
                          <div className="user-cell">
                            <div className="mini-avatar" style={{ background: getAvatarColor(u.username) }}>{u.username?.charAt(0)}</div>
                            <span className="anon-name">{u.username}</span>
                          </div>
                        </td>
                        <td className="date-cell">{new Date(u.joinedAt).toLocaleTimeString()}</td>
                        <td className="email-cell" style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>{u.socketId}</td>
                        <td>
                          <button className="action-btn block-perm" title="Kick User" onClick={() => setKickModal(u)}><FiUserX /></button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
                {onlineUsers.length === 0 && <div className="no-data"><FiUsers /><p>No users online</p></div>}
              </div>

              {/* Kicked Users */}
              {kickedUsers.length > 0 && (
                <div className="kicked-section">
                  <h3 className="kicked-title">🚫 Kicked Users</h3>
                  <div className="kicked-list">
                    {kickedUsers.map(name => (
                      <div key={name} className="kicked-item glass">
                        <span>{name}</span>
                        <button className="btn btn-success btn-sm" onClick={() => handleUnkick(name)}>Unkick</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Kick Modal */}
      <AnimatePresence>
        {kickModal && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setKickModal(null)}>
            <motion.div className="modal-card glass-strong" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} onClick={e => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setKickModal(null)}><FiX /></button>
              <div className="modal-icon"><FiUserX /></div>
              <h3>Kick User</h3>
              <p className="modal-desc">Kick <strong>{kickModal.username}</strong> from the chatroom. They won't be able to rejoin with this name.</p>
              <div className="form-group">
                <label className="form-label">Reason (optional)</label>
                <textarea value={kickReason} onChange={e => setKickReason(e.target.value)} placeholder="Enter reason..." className="form-input" rows={3} style={{ resize: 'vertical' }} />
              </div>
              <div className="modal-actions">
                <button className="btn btn-secondary" onClick={() => setKickModal(null)}>Cancel</button>
                <button className="btn btn-danger" onClick={() => handleKick(kickModal.socketId)}>Kick User</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Admin;
