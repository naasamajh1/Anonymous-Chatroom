import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, useMotionValue, useSpring, useInView, AnimatePresence } from 'framer-motion';
import { FiArrowRight, FiShuffle, FiUsers, FiShield, FiZap, FiLock, FiMessageCircle, FiGlobe, FiEye, FiCpu, FiChevronUp } from 'react-icons/fi';
import { publicAPI } from '../services/api';
import toast from 'react-hot-toast';
import Logo from '../components/Logo';
import './Landing.css';

// 3D Tilt Card Component
const TiltCard = ({ children, className = '', ...props }) => {
  const cardRef = useRef(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), { stiffness: 200, damping: 20 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), { stiffness: 200, damping: 20 });

  const handleMouse = (e) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      className={`tilt-card ${className}`}
      onMouseMove={handleMouse}
      onMouseLeave={handleLeave}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// Animated Counter
const AnimCounter = ({ target, duration = 2 }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !hasAnimated.current) {
        hasAnimated.current = true;
        let start = 0;
        const step = target / (duration * 60);
        const timer = setInterval(() => {
          start += step;
          if (start >= target) { setCount(target); clearInterval(timer); }
          else setCount(Math.floor(start));
        }, 1000 / 60);
      }
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target, duration]);

  return <span ref={ref}>{count.toLocaleString()}</span>;
};

// Orbiting Ring
const OrbitRing = ({ size, duration, delay = 0, opacity = 0.15 }) => (
  <motion.div
    className="orbit-ring"
    style={{ width: size, height: size }}
    initial={{ opacity: 0, scale: 0.5 }}
    animate={{ opacity, scale: 1, rotate: 360 }}
    transition={{ opacity: { delay, duration: 1 }, scale: { delay, duration: 1 }, rotate: { duration, repeat: Infinity, ease: 'linear' } }}
  />
);

// Scroll reveal text — reveals words one by one on scroll
const ScrollRevealText = ({ children, className = '' }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const words = children.split(' ');
  return (
    <span ref={ref} className={className}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          className="scroll-word"
          initial={{ opacity: 0, y: 20, filter: 'blur(4px)' }}
          animate={isInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
          transition={{ delay: i * 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          {word}&nbsp;
        </motion.span>
      ))}
    </span>
  );
};

const Landing = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [generating, setGenerating] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [showScrollTop, setShowScrollTop] = useState(false);
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const statsRef = useRef(null);
  const ctaRef = useRef(null);

  // Global scroll progress
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.25], [1, 0.92]);
  const heroBlur = useTransform(scrollYProgress, [0, 0.25], [0, 10]);
  const heroFilter = useTransform(heroBlur, v => `blur(${v}px)`);

  // Per-section scroll tracking
  const { scrollYProgress: statsProgress } = useScroll({ target: statsRef, offset: ['start end', 'end start'] });
  const statsX = useTransform(statsProgress, [0, 0.4], [-80, 0]);
  const statsOpacity = useTransform(statsProgress, [0, 0.3], [0, 1]);

  const { scrollYProgress: featuresProgress } = useScroll({ target: featuresRef, offset: ['start end', 'end start'] });
  const featuresY = useTransform(featuresProgress, [0, 0.5], [60, 0]);
  const featuresScale = useTransform(featuresProgress, [0, 0.4], [0.95, 1]);

  const { scrollYProgress: ctaProgress } = useScroll({ target: ctaRef, offset: ['start end', 'end start'] });
  const ctaScale = useTransform(ctaProgress, [0, 0.5], [0.85, 1]);
  const ctaRotate = useTransform(ctaProgress, [0, 0.5], [3, 0]);

  // Show/hide scroll-to-top button
  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 500);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const saved = sessionStorage.getItem('incognichat_username');
    if (saved) setUsername(saved);
  }, []);

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

  const generateName = async () => {
    setGenerating(true);
    try {
      const data = await publicAPI.generateName();
      setUsername(data.username);
      toast.success(`Generated: ${data.username}`, { icon: '🎲' });
    } catch {
      toast.error('Failed to generate name');
    } finally {
      setGenerating(false);
    }
  };

  const startChat = () => {
    const trimmed = username.trim();
    if (!trimmed || trimmed.length < 2) {
      toast.error('Username must be at least 2 characters');
      return;
    }
    if (trimmed.length > 30) {
      toast.error('Username must be 30 characters or less');
      return;
    }
    sessionStorage.setItem('incognichat_username', trimmed);
    navigate('/chat');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') startChat();
  };

  const features = [
    { icon: <FiZap />, title: 'Instant Access', desc: 'No signup. No email. Just pick a name and start chatting instantly.', color: '#f59e0b' },
    { icon: <FiShield />, title: 'AI Moderation', desc: 'Real-time AI-powered content filtering keeps the chat safe for everyone.', color: '#10b981' },
    { icon: <FiLock />, title: 'Ephemeral Messages', desc: 'All messages vanish when the session ends. Zero history. Zero traces.', color: '#8b5cf6' },
    { icon: <FiUsers />, title: 'Global Chat', desc: 'Connect with anyone online in a single, unified chatroom worldwide.', color: '#06b6d4' }
  ];

  const stats = [
    { value: 100, suffix: '%', label: 'Anonymous', icon: <FiEye /> },
    { value: 0, suffix: '', label: 'Data Stored', icon: <FiLock /> },
    { value: 24, suffix: '/7', label: 'AI Moderation', icon: <FiCpu /> },
    { value: 150, suffix: '+', label: 'Countries', icon: <FiGlobe /> },
  ];

  // Text animation variants
  const titleWords = ['Jump', 'In.', 'Chat', 'Freely.'];
  const wordVariants = {
    hidden: { opacity: 0, y: 30, rotateX: -40 },
    visible: (i) => ({
      opacity: 1, y: 0, rotateX: 0,
      transition: { delay: 0.5 + i * 0.12, duration: 0.6, ease: [0.16, 1, 0.3, 1] }
    })
  };

  return (
    <>
    <div className="landing-page">
      {/* Scroll progress bar */}
      <motion.div className="scroll-progress-bar" style={{ scaleX }} />

      {/* Enhanced Background */}
      <div className="bg-grid" />
      <div className="aurora-bg">
        <div className="aurora-1" />
        <div className="aurora-2" />
        <div className="aurora-3" />
      </div>
      <div className="bg-glow-orb bg-glow-orb-1" style={{ transform: `translate(${mousePos.x * 20}px, ${mousePos.y * 20}px)` }} />
      <div className="bg-glow-orb bg-glow-orb-2" style={{ transform: `translate(${mousePos.x * -15}px, ${mousePos.y * -15}px)` }} />
      <div className="bg-glow-orb bg-glow-orb-3" style={{ transform: `translate(${mousePos.x * 10}px, ${mousePos.y * 10}px)` }} />

      {/* Floating particles with variety */}
      <div className="particles">
        {[...Array(30)].map((_, i) => (
          <div key={i} className={`particle particle-${i % 3}`} style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${3 + Math.random() * 6}s`,
            width: `${2 + Math.random() * 4}px`,
            height: `${2 + Math.random() * 4}px`,
          }} />
        ))}
      </div>

      {/* Navbar with backdrop blur */}
      <motion.nav
        className="landing-nav"
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="nav-brand">
          <motion.div
            whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
            transition={{ duration: 0.5 }}
          >
            <Logo size={36} />
          </motion.div>
          <span className="nav-title gradient-text">IncogniChat</span>
        </div>
        <div className="nav-actions">
          <motion.div className="nav-status-pill glass" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.8 }}>
            <span className="status-dot-live" />
            <span>Live</span>
          </motion.div>
          <motion.button
            className="btn btn-secondary btn-sm nav-admin-btn"
            onClick={() => navigate('/admin-login')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiShield />
            Admin
          </motion.button>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <motion.section className="hero-section" ref={heroRef} style={{ opacity: heroOpacity, scale: heroScale, filter: heroFilter }}>
        <div className="hero-content">
          {/* 3D Logo with orbit rings */}
          <div className="hero-logo-container">
            <OrbitRing size={120} duration={20} delay={0.2} opacity={0.1} />
            <OrbitRing size={150} duration={30} delay={0.4} opacity={0.06} />
            <motion.div
              className="hero-logo-3d"
              initial={{ scale: 0, rotateY: -180 }}
              animate={{ scale: 1, rotateY: 0 }}
              transition={{ type: 'spring', stiffness: 120, delay: 0.3 }}
              whileHover={{ rotateY: 15, rotateX: -10, scale: 1.1 }}
              style={{ transformStyle: 'preserve-3d' }}
            >
              <Logo size={64} />
              <div className="logo-reflection" />
            </motion.div>
          </div>

          {/* Animated Title */}
          <h1 className="hero-title" style={{ perspective: '600px' }}>
            <span className="title-line">
              {titleWords.map((word, i) => (
                <motion.span
                  key={i}
                  className="title-word"
                  custom={i}
                  initial="hidden"
                  animate="visible"
                  variants={wordVariants}
                  style={{ display: 'inline-block', transformOrigin: 'bottom' }}
                >
                  {word}&nbsp;
                </motion.span>
              ))}
            </span>
            <motion.span
              className="gradient-text title-gradient-line"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 0.6 }}
            >
              Stay Anonymous.
            </motion.span>
          </h1>

          <motion.p
            className="hero-subtitle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3, duration: 0.7 }}
          >
            No signup. No accounts. No history. Just pick a name and start chatting instantly with people around the world.
          </motion.p>

          {/* Username Input Card with 3D tilt */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <TiltCard className="join-card glass-strong">
              <div className="join-card-glow" />
              <div className="join-input-group">
                <div className="join-input-wrapper">
                  <FiMessageCircle className="input-icon" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Enter your anonymous name..."
                    className="join-input"
                    maxLength={30}
                    autoFocus
                  />
                  <span className="char-counter">{username.length}/30</span>
                </div>

                <motion.button
                  className="btn btn-secondary generate-btn"
                  onClick={generateName}
                  disabled={generating}
                  title="Generate random name"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FiShuffle className={generating ? 'spin-icon' : ''} />
                  {generating ? 'Generating...' : 'Random'}
                </motion.button>
              </div>

              <motion.button
                className="btn btn-primary btn-lg start-btn"
                onClick={startChat}
                disabled={!username.trim() || username.trim().length < 2}
                whileHover={{ scale: 1.02, boxShadow: '0 8px 40px rgba(124, 58, 237, 0.5)' }}
                whileTap={{ scale: 0.98 }}
              >
                <span>Start Chatting</span>
                <FiArrowRight />
                <div className="btn-shine" />
              </motion.button>

              <p className="join-hint">
                💡 Your username is only for this session. Once you leave, it's gone forever.
              </p>
            </TiltCard>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="scroll-indicator"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5 }}
        >
          <motion.div
            className="scroll-line"
            animate={{ scaleY: [0, 1, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          />
          <span>Scroll to explore</span>
        </motion.div>
      </motion.section>

      {/* Stats Section — horizontal slide-in */}
      <section className="stats-section" ref={statsRef}>
        <motion.div className="stats-container" style={{ x: statsX, opacity: statsOpacity }}>
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              className="stat-pill glass"
              initial={{ opacity: 0, x: -40, rotateY: -15 }}
              whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
              transition={{ delay: idx * 0.12, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.08, y: -6, boxShadow: '0 12px 40px rgba(124, 58, 237, 0.2)' }}
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className="stat-pill-icon">{stat.icon}</div>
              <div className="stat-pill-info">
                <span className="stat-pill-value">
                  <AnimCounter target={stat.value} />{stat.suffix}
                </span>
                <span className="stat-pill-label">{stat.label}</span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Features Section — scroll-linked parallax + 3D card flip entrance */}
      <motion.section className="features-section" ref={featuresRef} style={{ y: featuresY, scale: featuresScale }}>
        <motion.div
          className="features-header"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
        >
          <motion.span
            className="section-badge glass"
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            ✨ Features
          </motion.span>
          <h2 className="section-title">
            Why <span className="gradient-text">IncogniChat</span>?
          </h2>
          <p className="section-subtitle">
            <ScrollRevealText>Built for privacy, speed, and simplicity</ScrollRevealText>
          </p>
        </motion.div>

        <div className="features-grid">
          {features.map((f, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 60, rotateX: -15, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
              transition={{ duration: 0.7, delay: idx * 0.15, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: true, margin: '-50px' }}
              style={{ perspective: '800px' }}
            >
              <TiltCard className="feature-card card">
                <div className="feature-glow" style={{ background: `radial-gradient(circle at 50% 0%, ${f.color}15, transparent 70%)` }} />
                <motion.div
                  className="feature-icon"
                  style={{ background: `${f.color}18`, color: f.color }}
                  whileInView={{ rotate: [0, -10, 10, 0] }}
                  transition={{ delay: 0.8 + idx * 0.15, duration: 0.5 }}
                  viewport={{ once: true }}
                >
                  {f.icon}
                </motion.div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
                <div className="feature-line" style={{ background: `linear-gradient(90deg, transparent, ${f.color}, transparent)` }} />
              </TiltCard>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* CTA Section — scale-up on scroll with rotation */}
      <section className="cta-section" ref={ctaRef}>
        <motion.div
          className="cta-content"
          style={{ scale: ctaScale, rotateX: ctaRotate, transformPerspective: 800 }}
        >
          <div className="cta-bg-elements">
            <div className="cta-ring cta-ring-1" />
            <div className="cta-ring cta-ring-2" />
          </div>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            Ready to Chat <span className="gradient-text">Anonymously</span>?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            viewport={{ once: true }}
          >
            Join the conversation now. No registration needed.
          </motion.p>
          <motion.button
            className="btn btn-primary btn-lg cta-btn"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.05, boxShadow: '0 10px 50px rgba(124, 58, 237, 0.5)' }}
            whileTap={{ scale: 0.95 }}
          >
            Get Started <FiArrowRight />
          </motion.button>
        </motion.div>
      </section>

      {/* Footer */}
      <motion.footer
        className="landing-footer"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="footer-content">
          <div className="footer-brand">
            <Logo size={28} />
            <span className="gradient-text">IncogniChat</span>
          </div>
          <p className="footer-text">© 2026 IncogniChat. Chat anonymously, safely, and freely.</p>
        </div>
      </motion.footer>
    </div>

    {/* Floating scroll-to-top button — outside landing-page to avoid overflow clipping */}
    <AnimatePresence>
      {showScrollTop && (
        <motion.button
          className="scroll-top-btn"
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <FiChevronUp />
        </motion.button>
      )}
    </AnimatePresence>
  </>
  );
};

export default Landing;
