import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiShield, FiMail, FiLock, FiArrowRight, FiArrowLeft, FiActivity, FiUsers, FiEye, FiBarChart2 } from 'react-icons/fi';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';
import Logo from '../components/Logo';
import './AdminLogin.css';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouse = (e) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2
      });
    };
    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return toast.error('Please fill in all fields');

    setLoading(true);
    try {
      const data = await adminAPI.login(email, password);
      localStorage.setItem('incognichat_admin_token', data.token);
      toast.success('Welcome, Admin!', { icon: '👑' });
      navigate('/admin');
    } catch (error) {
      toast.error(error.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: <FiActivity />, label: 'Real-time Analytics', desc: 'Monitor chat activity live' },
    { icon: <FiUsers />, label: 'User Management', desc: 'Block & manage users' },
    { icon: <FiEye />, label: 'Content Moderation', desc: 'AI-powered safety filters' },
    { icon: <FiBarChart2 />, label: 'Dashboard Insights', desc: 'Detailed usage statistics' },
  ];

  return (
    <div className="admin-login-page">
      {/* Left Panel — Branding & Info */}
      <motion.div
        className="login-art-panel"
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Animated background elements */}
        <div className="art-bg-elements">
          <div className="art-orb art-orb-1" style={{ transform: `translate(${mousePos.x * 15}px, ${mousePos.y * 15}px)` }} />
          <div className="art-orb art-orb-2" style={{ transform: `translate(${mousePos.x * -10}px, ${mousePos.y * -10}px)` }} />
          <div className="art-grid" />
          <div className="art-ring art-ring-1" />
          <div className="art-ring art-ring-2" />
          <div className="art-ring art-ring-3" />
        </div>

        <div className="art-content">
          <motion.div
            className="art-logo"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 120, delay: 0.3 }}
          >
            <Logo size={56} />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <span className="gradient-text">IncogniChat</span>
            <span className="art-title-sub">Admin Panel</span>
          </motion.h1>

          <motion.p
            className="art-desc"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
          >
            Monitor, moderate, and manage your anonymous chat platform from a single powerful dashboard.
          </motion.p>

          <div className="art-features">
            {features.map((f, i) => (
              <motion.div
                key={i}
                className="art-feature"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 + i * 0.1, duration: 0.5 }}
              >
                <div className="art-feature-icon">{f.icon}</div>
                <div>
                  <span className="art-feature-label">{f.label}</span>
                  <span className="art-feature-desc">{f.desc}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          className="art-footer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          <span>© 2026 IncogniChat</span>
          <span>Secure Admin Access</span>
        </motion.div>
      </motion.div>

      {/* Right Panel — Login Form */}
      <motion.div
        className="login-form-panel"
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="login-form-wrapper">
          <motion.button
            className="back-btn"
            onClick={() => navigate('/')}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ x: -4 }}
          >
            <FiArrowLeft />
            <span>Back to Chat</span>
          </motion.button>

          <div className="login-header">
            <motion.div
              className="login-icon-wrap"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.3 }}
            >
              <FiShield />
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              Welcome back
            </motion.h2>
            <motion.p
              className="login-subtitle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              Sign in to access the admin dashboard
            </motion.p>
          </div>

          <motion.form
            onSubmit={handleLogin}
            className="login-form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
          >
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="input-with-icon">
                <FiMail className="field-icon" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@incognichat.com"
                  className="form-input"
                  autoFocus
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-with-icon">
                <FiLock className="field-icon" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="form-input"
                />
              </div>
            </div>

            <motion.button
              type="submit"
              className="btn btn-primary btn-lg login-btn"
              disabled={loading}
              whileHover={{ scale: 1.02, boxShadow: '0 8px 30px rgba(124, 58, 237, 0.5)' }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <><span className="spinner spinner-sm" /> Authenticating...</>
              ) : (
                <>Sign In <FiArrowRight /></>
              )}
            </motion.button>
          </motion.form>

          <motion.div
            className="login-secure-badge"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            <FiLock />
            <span>Secured with JWT authentication</span>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
