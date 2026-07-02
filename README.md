# ROVX — AI Navigation Platform

<p align="center">
  <img src="frontend/public/logo.png" width="120" height="120" alt="ROVX Logo" />
</p>

<p align="center">
  <strong>Next-generation AI-powered navigation for drivers, truckers, and travelers</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15-black?logo=nextdotjs" />
  <img src="https://img.shields.io/badge/NestJS-10-red?logo=nestjs" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-blue?logo=postgresql" />
  <img src="https://img.shields.io/badge/Redis-7-red?logo=redis" />
  <img src="https://img.shields.io/badge/TypeScript-5-blue?logo=typescript" />
  <img src="https://img.shields.io/badge/WebSocket-Socket.io-black" />
  <img src="https://img.shields.io/badge/PWA-Ready-purple" />
</p>

---

## ✨ Features

### 🗺️ Navigation
- **Real-time map** with OpenStreetMap tiles + satellite mode
- **Night mode** map theme
- **13 route types**: Fastest, Shortest, Safest, Scenic, Cheapest, No Tolls, Eco, Tourist, Truck, and more
- **Per-route stats**: distance, duration, fuel estimate, eco score, hazard count
- **Turn-by-turn** voice navigation in RU/EN/UZ

### 🤖 AI Co-Driver
- **Voice commands** in Russian, English, Uzbek
- **Smart suggestions** based on driving history, weather, time of day
- **Automatic hazard announcements** (cameras, accidents, ice, low bridges)
- **GPT-4o** powered command understanding and route analysis

### ⚠️ Community Reports
- 23 report types (accidents, potholes, ice, cameras, police, road works, floods, etc.)
- Real-time broadcast to nearby users via WebSocket
- Vote-based confidence scoring — confirmed reports get priority
- Automatic expiry based on hazard type

### 📍 POI Database
- 20+ category types: gas stations, EV chargers, parking, cafes, hotels, hospitals, tire shops, customs, rest areas, tourist attractions
- Premium promoted listings
- User ratings & reviews

### 👥 Social
- Follow/unfollow drivers
- Direct messages
- Regional driver groups with group chat
- Driver leaderboard & reputation system
- Achievements (8+ badges)

### 📱 PWA
- Works offline (map tile caching)
- Installable on iOS/Android
- Push notifications via FCM

### 🏢 Admin Panel API
- User management (ban, roles)
- Report moderation
- Map object CRUD
- Dashboard analytics
- Advertisement management

---

## 🚀 Quick Start

### Prerequisites
- **Docker** + **Docker Compose** v2+
- **Node.js** 20+ (for local dev)
- **Git**

### 1. Clone
```bash
git clone https://github.com/your-org/rovx.git
cd rovx
```

### 2. Configure
```bash
cp .env.example .env
# Edit .env — set your OPENAI_API_KEY if you want AI features
```

### 3. Launch (Docker)
```bash
docker compose up -d
```

This starts:
- PostgreSQL on `localhost:5432`
- Redis on `localhost:6379`
- Backend API on `localhost:3001`
- Frontend on `localhost:3000`
- Nginx on `localhost:80`

### 4. Open
Navigate to [http://localhost:3000](http://localhost:3000)

**Test accounts:**
| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@rovx.app` | `Admin@123456` |
| Demo User | `demo@rovx.app` | `Demo@123456` |

API Docs: [http://localhost:3001/docs](http://localhost:3001/docs)

---

## 💻 Local Development

```bash
# Terminal 1 — Infra (DB + Redis only)
docker compose up postgres redis -d

# Terminal 2 — Backend
cd backend
cp .env.example .env  # Edit with local values
npm install
npx prisma generate
npx prisma migrate dev
npx ts-node prisma/seed.ts
npm run start:dev

# Terminal 3 — Frontend
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

---

## 🏗️ Architecture

```
rovx/
├── backend/                    # NestJS API Server
│   ├── src/
│   │   ├── auth/               # JWT + Refresh token auth
│   │   ├── users/              # Profiles, vehicles, preferences
│   │   ├── routes/             # Route calculation (OSRM), trip history
│   │   ├── map/                # POI objects, bookmarks, traffic
│   │   ├── reports/            # Hazard reports + voting
│   │   ├── ai/                 # GPT-4o voice commands, route AI
│   │   ├── social/             # Follows, messages, groups
│   │   ├── admin/              # Admin CRUD + analytics
│   │   ├── websocket/          # Socket.io real-time gateway
│   │   ├── prisma/             # Database service
│   │   └── redis/              # Cache service
│   └── prisma/
│       ├── schema.prisma       # Full database schema
│       └── seed.ts             # Demo data seeder
│
├── frontend/                   # Next.js 15 PWA
│   └── src/
│       ├── app/                # App Router pages
│       │   ├── page.tsx        # Main map page
│       │   └── auth/           # Login + Register
│       ├── components/
│       │   ├── map/            # MapView, ObjectPanel, ReportPanel, Layers
│       │   ├── navigation/     # TopBar, BottomBar, Sidebar, RoutePanel, HUD
│       │   └── ai/             # AiAssistantPanel with voice
│       ├── store/              # Zustand (auth + map state)
│       ├── hooks/              # useSocket, useGeolocation, useVoiceAssistant
│       └── lib/                # API client (axios), map icons
│
├── nginx/                      # Reverse proxy config
├── docker-compose.yml          # Full stack orchestration
└── .env                        # Environment variables
```

---

## 🔌 API Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register user |
| POST | `/api/v1/auth/login` | Login |
| POST | `/api/v1/auth/refresh` | Refresh tokens |
| POST | `/api/v1/auth/logout` | Logout |
| GET | `/api/v1/auth/me` | Current user |

### Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/routes/calculate` | Calculate route options |
| POST | `/api/v1/routes/save` | Save a route |
| GET | `/api/v1/routes/saved` | Get saved routes |
| GET | `/api/v1/routes/trips` | Trip history |
| POST | `/api/v1/routes/trips/start` | Start a trip |
| POST | `/api/v1/routes/trips/:id/end` | End a trip |

### Map
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/map/objects` | POIs in bounds |
| GET | `/api/v1/map/nearby` | Nearby objects |
| GET | `/api/v1/map/search?q=` | Search places |
| GET | `/api/v1/map/traffic` | Traffic data |

### Reports
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/reports` | Create report |
| GET | `/api/v1/reports` | Get reports in area |
| POST | `/api/v1/reports/:id/vote` | Confirm/reject |

### AI
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/ai/voice-command` | Process voice command |
| POST | `/api/v1/ai/analyze-route` | AI route analysis |
| GET | `/api/v1/ai/suggestions` | Smart suggestions |

---

## 🔧 WebSocket Events

### Client → Server
| Event | Payload | Description |
|-------|---------|-------------|
| `location:update` | `{lat, lng, speed, heading}` | Update location |
| `subscribe:area` | `{lat, lng, radius}` | Subscribe to area events |
| `join:group` | `{groupId}` | Join group chat |
| `message:send` | `{receiverId, content}` | Send DM |
| `group:message` | `{groupId, content}` | Group message |

### Server → Client
| Event | Description |
|-------|-------------|
| `report:new` | New hazard report nearby |
| `traffic:update` | Traffic segment update |
| `message:received` | New direct message |
| `group:message` | New group message |

---

## 🗄️ Database Schema

Key models:
- **User** — auth, profile, stats, subscription
- **Vehicle** — car/truck specs per user
- **Trip** — trip history with polylines, fuel, speed
- **SavedRoute** — bookmarked routes
- **MapObject** — 20+ POI categories
- **Report** — community hazard reports with voting
- **TrafficSegment** — real-time traffic data
- **Follow / Message / Group** — social graph
- **Achievement / UserAchievement** — gamification
- **Advertisement** — partner monetization

---

## 🔒 Security

- JWT access tokens (15min) + refresh tokens (30 days) with rotation
- Redis-based token blacklisting
- Rate limiting: 10/min short, 50/10s medium, 200/min long
- Helmet security headers
- CORS whitelist
- bcrypt password hashing (cost 12)
- Input validation (class-validator)
- Role-based guards (USER → MODERATOR → ADMIN → SUPERADMIN)

---

## 📈 Scaling Notes

This architecture supports millions of users:
- **WebSocket** clustering via Redis pub/sub (add `@socket.io/redis-adapter`)
- **PostgreSQL** — add read replicas, Prisma accelerate
- **Redis** — Cluster mode for 100M+ cache entries
- **OSRM** — Self-host for SLA-critical routing
- **CDN** — Serve map tiles + static assets via Cloudflare
- **Horizontal scaling** — all services are stateless (state in Redis/PG)

---

## 🌐 Supported Languages

| Language | Voice | UI |
|----------|-------|----|
| Русский | ✅ | ✅ |
| English | ✅ | ✅ |
| O'zbek | ✅ | Partial |

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<p align="center">
  Built with ❤️ for the road
</p>
