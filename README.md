# IncogniChat — Anonymous Real-Time Chatroom

> **Jump in. Chat freely. Stay anonymous.**
> No signup. No accounts. No history. Just pick a name and start chatting instantly.

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=nodedotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.IO-4.8-010101?logo=socketdotio&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-11-FF0055?logo=framer&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue)

---

## ✨ Features

### 🚀 Zero-Friction Chat
- **No signup, no login, no email** — just enter a username and start chatting
- **Random name generator** — one-click anonymous username creation (e.g. `ShadowPhoenix4821`)
- **Instant connection** — Socket.IO powered real-time messaging with typing indicators

### 🔒 Privacy First
- **Ephemeral messages** — all chat history is automatically deleted when users disconnect
- **No accounts stored** — users exist only as live socket connections
- **Session-based identity** — usernames live in `sessionStorage` and vanish when the tab closes

### 🤖 AI-Powered Moderation
- **Groq AI (LLaMA 3.3 70B)** — real-time content analysis for every message
- **Fallback profanity filter** — keyword-based filtering when AI is unavailable
- **Transparent warnings** — users are notified when their message is flagged

### 👑 Admin Dashboard
- **Real-time stats** — online users, total messages, flagged content, hourly activity
- **User management** — kick active users, ban usernames, view live connections
- **Integrated analytics** — charts displayed directly on the dashboard:
  - 📊 Message activity (bar chart — last 7 days)
  - 🍩 Moderation breakdown (donut chart — clean vs flagged)
  - 📈 Hourly activity patterns (area chart)
  - 🏆 Top chatters (horizontal bar chart)
- **Message clearing** — wipe all messages with one click

### 💎 Premium UI/UX
- **Custom SVG brand logo** — incognito-themed chat bubble with mask eyes
- **Dark glassmorphism** design with purple accent gradients
- **3D effects** — tilt cards, perspective transforms, orbiting rings
- **Aurora background** — animated gradient orbs with mouse-reactive parallax
- **Framer Motion** animations and scroll-driven effects:
  - Scroll progress bar
  - Word-by-word text reveal with blur transition
  - 3D card flip entrance for feature cards
  - Hero blur-out on scroll with scale-down
  - Per-section parallax and scale animations
  - Animated stat counters
  - Floating scroll-to-top button
- **Split-panel admin login** — branding panel + form panel with animated backgrounds
- **Responsive layout** — works on desktop, tablet, and mobile
- **Typing indicators** — see who's composing a message
- **Online user sidebar** — toggle to see all active participants
- **Color-coded avatars** — unique colors derived from username hash

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 19, Vite 6, Framer Motion 11, React Router 7 |
| **Styling** | Vanilla CSS (custom design system with CSS variables) |
| **Real-time** | Socket.IO 4.8 (WebSocket + polling fallback) |
| **Backend** | Node.js, Express 4, Helmet, CORS, Rate Limiting |
| **Database** | MongoDB Atlas (Mongoose ODM) |
| **AI Moderation** | Groq SDK (LLaMA 3.3 70B Versatile) |
| **Auth** | JWT (admin-only) |
| **Icons** | React Icons (Feather set) |
| **Notifications** | React Hot Toast |

---

## 📁 Project Structure

```
chatroom/
├── server/                          # Backend API & WebSocket server
│   ├── index.js                     # Express + Socket.IO entry point
│   ├── .env                         # Environment configuration
│   ├── models/
│   │   ├── Admin.js                 # Admin account schema
│   │   └── Message.js               # Chat message schema
│   ├── controllers/
│   │   └── adminController.js       # Dashboard stats, analytics, user mgmt
│   ├── routes/
│   │   └── adminRoutes.js           # Protected admin API endpoints
│   ├── middleware/
│   │   └── auth.js                  # JWT authentication (admin only)
│   ├── socket/
│   │   └── chatSocket.js            # Real-time chat handler
│   └── utils/
│       ├── moderator.js             # AI content moderation (Groq + fallback)
│       └── nameGenerator.js         # Random username generator
│
├── client/                          # React frontend
│   ├── index.html                   # HTML entry (custom SVG favicon)
│   ├── vite.config.js               # Vite configuration + API proxy
│   └── src/
│       ├── main.jsx                 # React entry point
│       ├── App.jsx                  # Route definitions
│       ├── index.css                # Global design system
│       ├── components/
│       │   └── Logo.jsx             # Custom SVG brand logo component
│       ├── services/
│       │   ├── socket.js            # Socket.IO client
│       │   └── api.js               # REST API service (public + admin)
│       └── pages/
│           ├── Landing.jsx / .css   # Home — 3D hero, features, stats, CTA
│           ├── Chat.jsx / .css      # Real-time chatroom interface
│           ├── AdminLogin.jsx / .css # Split-panel admin authentication
│           └── Admin.jsx / .css     # Admin dashboard + integrated analytics
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+
- **MongoDB Atlas** account (or local MongoDB instance)
- **Groq API key** ([console.groq.com](https://console.groq.com)) — optional, falls back to keyword filter

### 1. Clone & Install

```bash
git clone https://github.com/your-username/chatroom.git
cd chatroom

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Configure Environment

Create `server/.env`:

```env
PORT=5001
MONGODB_URI="your_mongodb_connection_string"
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

# Groq AI (optional — uses fallback filter if not set)
GROQ_API_KEY=your_groq_api_key

# Default admin credentials
ADMIN_EMAIL=admin@gmail.com
ADMIN_PASSWORD=YourSecurePassword

# Client URL (must match Vite dev server)
CLIENT_URL=http://localhost:5174
```

### 3. Run Development Servers

```bash
# Terminal 1 — Backend
cd server
npm run dev        # Starts on http://localhost:5001

# Terminal 2 — Frontend
cd client
npm run dev        # Starts on http://localhost:5174
```

### 4. Open in Browser

- **Chat:** [http://localhost:5174](http://localhost:5174)
- **Admin:** [http://localhost:5174/admin-login](http://localhost:5174/admin-login)

---

## 🎨 Design System

The app uses a custom CSS design system built with CSS variables:

| Token | Value | Usage |
|-------|-------|-------|
| `--bg-primary` | `#050510` | Page backgrounds |
| `--accent-primary` | `#7c3aed` | Buttons, highlights, gradients |
| `--accent-secondary` | `#a78bfa` | Icons, hover states |
| `--gradient-primary` | `#7c3aed → #a78bfa` | Buttons, text gradients |
| `--radius-md` | `12px` | Cards, inputs |
| `--font-primary` | Inter | All body text |
| `--font-mono` | JetBrains Mono | Counters, code |

### Animation Philosophy
- **Spring physics** for natural-feeling interactions (`useSpring`, `useMotionValue`)
- **Scroll-linked transforms** for parallax, scale, and blur effects (`useScroll`, `useTransform`)
- **3D perspective** transforms for card tilt and flip entrances
- **Staggered reveals** for sequential element entrance

---

## 🔗 API Reference

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Health check |
| `GET` | `/api/generate-name` | Generate random anonymous username |
| `POST` | `/api/admin/login` | Admin authentication (returns JWT) |

### Protected Admin Endpoints (requires `Authorization: Bearer <token>`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/admin/stats` | Dashboard statistics |
| `GET` | `/api/admin/analytics` | Charts & analytics data |
| `GET` | `/api/admin/online-users` | List active socket connections |
| `GET` | `/api/admin/kicked-users` | List banned usernames |
| `POST` | `/api/admin/kick/:socketId` | Kick a user (body: `{ reason }`) |
| `POST` | `/api/admin/unkick/:username` | Remove username ban |
| `DELETE` | `/api/admin/messages` | Clear all messages |

### Socket.IO Events

| Event | Direction | Payload | Description |
|-------|-----------|---------|-------------|
| `send_message` | Client → Server | `{ content }` | Send a chat message |
| `new_message` | Server → Client | `{ _id, sender, content, createdAt }` | Broadcast new message |
| `user_joined` | Server → Client | `{ username, onlineCount, onlineUsers }` | User connected |
| `user_left` | Server → Client | `{ username, onlineCount, onlineUsers }` | User disconnected |
| `online_count` | Server → Client | `number` | Updated online count |
| `typing` | Client → Server | — | User is typing |
| `user_typing` | Server → Client | `{ username }` | Broadcast typing indicator |
| `stop_typing` | Client → Server | — | User stopped typing |
| `message_warning` | Server → Client | `{ message, reason }` | Message was flagged |
| `kicked` | Server → Client | `{ reason }` | User was kicked by admin |
| `messages_cleared` | Server → Client | — | All messages wiped |
| `error_message` | Server → Client | `string` | Connection error |

---

## 🔐 Security

- **Rate limiting** — 200 requests per 15 minutes per IP
- **Helmet** — HTTP security headers
- **CORS** — restricted to configured client origin
- **Input validation** — username (2–30 chars), message (max 1000 chars)
- **AI moderation** — real-time content filtering on all messages
- **JWT auth** — admin routes are fully protected
- **Ephemeral data** — messages are auto-deleted, no persistent user data

---

## 📱 Responsive Design

The app is fully responsive with breakpoints at:
- **1024px** — feature grid to 2 columns, admin stats collapse, art panel hides on admin login
- **768px** — mobile layout, sidebar hides, simplified header, stats pills shrink
- **480px** — single-column feature grid, stacked stats, adjusted typography

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

<p align="center">
  <strong>IncogniChat</strong> — Chat anonymously, safely, and freely.<br>
  Built with ❤️ using React, Node.js, Socket.IO, Framer Motion & Groq AI
</p>
