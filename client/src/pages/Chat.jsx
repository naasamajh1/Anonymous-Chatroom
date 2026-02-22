import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSend, FiLogOut, FiUsers, FiWifi, FiWifiOff,
  FiMessageCircle, FiAlertTriangle
} from 'react-icons/fi';
import { connectSocket, disconnectSocket, getSocket } from '../services/socket';
import toast from 'react-hot-toast';
import Logo from '../components/Logo';
import './Chat.css';

const Chat = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [onlineCount, setOnlineCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [showSidebar, setShowSidebar] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeout = useRef(null);
  const inputRef = useRef(null);

  const username = sessionStorage.getItem('incognichat_username');

  useEffect(() => {
    if (!username) {
      navigate('/');
      return;
    }

    const socket = connectSocket(username);

    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));

    socket.on('recent_messages', (msgs) => setMessages(msgs));

    socket.on('new_message', (msg) => {
      setMessages(prev => [...prev, msg]);
    });

    socket.on('user_joined', (data) => {
      setOnlineCount(data.onlineCount);
      setOnlineUsers(data.onlineUsers || []);
      if (data.username !== username) {
        toast(`${data.username} joined the chat`, { icon: '👋', duration: 2000 });
      }
    });

    socket.on('user_left', (data) => {
      setOnlineCount(data.onlineCount);
      setOnlineUsers(data.onlineUsers || []);
    });

    socket.on('online_count', (count) => setOnlineCount(count));

    socket.on('user_typing', (data) => {
      setTypingUsers(prev => prev.includes(data.username) ? prev : [...prev, data.username]);
    });

    socket.on('user_stop_typing', (data) => {
      setTypingUsers(prev => prev.filter(u => u !== data.username));
    });

    socket.on('message_warning', (data) => {
      toast.error(data.message, { duration: 4000, icon: '⚠️' });
    });

    socket.on('error_message', (msg) => {
      toast.error(msg, { duration: 4000 });
      sessionStorage.removeItem('incognichat_username');
      navigate('/');
    });

    socket.on('kicked', (data) => {
      toast.error(data.reason || 'You have been kicked from the chat.', { duration: 5000, icon: '🚫' });
      sessionStorage.removeItem('incognichat_username');
      disconnectSocket();
      navigate('/');
    });

    socket.on('messages_cleared', () => {
      setMessages([]);
    });

    return () => {
      disconnectSocket();
    };
  }, [username, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !isConnected) return;

    const socket = getSocket();
    if (socket) {
      socket.emit('send_message', { content: newMessage.trim() });
      socket.emit('stop_typing');
    }
    setNewMessage('');
    inputRef.current?.focus();
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    const socket = getSocket();
    if (!socket) return;

    socket.emit('typing');
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => socket.emit('stop_typing'), 1500);
  };

  const handleLeave = () => {
    setMessages([]);
    disconnectSocket();
    sessionStorage.removeItem('incognichat_username');
    navigate('/');
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getAvatarColor = (name) => {
    const colors = [
      '#7c3aed', '#6366f1', '#3b82f6', '#06b6d4', '#10b981',
      '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6', '#14b8a6'
    ];
    let hash = 0;
    for (let i = 0; i < (name || '').length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className="chat-page">
      <div className="bg-grid" />

      {/* Header */}
      <header className="chat-header glass-strong">
        <div className="header-left">
          <Logo size={36} />
          <div className="header-info">
            <h1 className="header-title gradient-text">IncogniChat</h1>
            <div className="header-status">
              {isConnected ? (
                <><FiWifi className="status-icon connected" /> <span>Connected</span></>
              ) : (
                <><FiWifiOff className="status-icon disconnected" /> <span>Disconnected</span></>
              )}
            </div>
          </div>
        </div>
        <div className="header-right">
          <button
            className="btn btn-secondary btn-sm online-btn"
            onClick={() => setShowSidebar(!showSidebar)}
          >
            <FiUsers />
            <span>{onlineCount} Online</span>
          </button>
          <div className="user-badge glass">
            <div className="user-avatar" style={{ background: getAvatarColor(username) }}>
              {username?.charAt(0)}
            </div>
            <span className="user-name">{username}</span>
          </div>
          <button className="btn btn-danger btn-sm" onClick={handleLeave}>
            <FiLogOut />
            Leave
          </button>
        </div>
      </header>

      <div className="chat-body">
        {/* Online Users Sidebar */}
        <AnimatePresence>
          {showSidebar && (
            <motion.aside
              className="online-sidebar glass-strong"
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <div className="sidebar-header-bar">
                <h3><FiUsers /> Online ({onlineCount})</h3>
              </div>
              <div className="online-list">
                {onlineUsers.map((u, i) => (
                  <div key={i} className="online-user-item">
                    <div className="online-dot" />
                    <div className="online-avatar" style={{ background: getAvatarColor(u) }}>
                      {u.charAt(0)}
                    </div>
                    <span className={u === username ? 'you-label' : ''}>{u}{u === username ? ' (You)' : ''}</span>
                  </div>
                ))}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Messages */}
        <div className="messages-container">
          <div className="messages-area">
            {messages.length === 0 ? (
              <div className="empty-chat">
                <motion.div
                  className="empty-icon-wrap"
                  animate={{ y: [0, -8, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <FiMessageCircle className="empty-icon" />
                </motion.div>
                <h3>Welcome to IncogniChat!</h3>
                <p>Be the first to send a message. Remember, be respectful! 💬</p>
              </div>
            ) : (
              messages.map((msg, idx) => {
                const isOwn = msg.sender === username;
                return (
                  <motion.div
                    key={msg._id || idx}
                    className={`message ${isOwn ? 'message-own' : 'message-other'}`}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    {!isOwn && (
                      <div className="message-avatar" style={{ background: getAvatarColor(msg.sender) }}>
                        {msg.sender?.charAt(0)}
                      </div>
                    )}
                    <div className="message-content">
                      {!isOwn && <span className="message-sender" style={{ color: getAvatarColor(msg.sender) }}>{msg.sender}</span>}
                      <div className={`message-bubble ${isOwn ? 'bubble-own' : 'bubble-other'}`}>
                        <p>{msg.content}</p>
                        <span className="message-time">{formatTime(msg.createdAt)}</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}

            {/* Typing Indicator */}
            <AnimatePresence>
              {typingUsers.length > 0 && (
                <motion.div
                  className="typing-indicator"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                >
                  <div className="typing-dots">
                    <span /><span /><span />
                  </div>
                  <span className="typing-text">
                    {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form className="message-input-form glass-strong" onSubmit={handleSend}>
            <input
              ref={inputRef}
              type="text"
              value={newMessage}
              onChange={handleTyping}
              placeholder="Type a message..."
              className="message-input"
              maxLength={1000}
              disabled={!isConnected}
              autoFocus
            />
            <motion.button
              type="submit"
              className="send-btn"
              disabled={!newMessage.trim() || !isConnected}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FiSend />
            </motion.button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chat;
