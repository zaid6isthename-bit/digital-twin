# 🏫 Campus Digital Twin
### AI-Powered Smart Campus Intelligence Platform

> A real-time digital replica of a campus — visualizing buildings, rooms, sensors, and AI insights in a futuristic mission-control interface.

---

## ✨ Features

- **Live Sensor Simulation** — 10 rooms, 2 buildings, updating every 2 seconds
- **Interactive Floor Plan** — Click any room for full sensor detail panel
- **AI Optimization Engine** — Detects AC waste, water leaks, energy spikes
- **Real-time Charts** — Energy trends, occupancy bars, heatmaps
- **Futuristic UI** — Particle background, glassmorphism, glow effects, animated everything
- **Boot Sequence** — Cinematic startup experience

---

## 🚀 Quick Start (Local)

```bash
# 1. Clone or download this repo
git clone https://github.com/YOUR_USERNAME/campus-digital-twin.git
cd campus-digital-twin

# 2. Install dependencies
npm install

# 3. Start dev server
npm run dev

# 4. Open browser
http://localhost:3000
```

---

## ☁️ Deploy to Vercel (Free — Recommended)

### Option 1: Vercel CLI
```bash
npm install -g vercel
vercel deploy
```

### Option 2: GitHub → Vercel (Easiest)

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → **New Project**
3. Import your GitHub repo
4. Framework: **Next.js** (auto-detected)
5. Click **Deploy** — done in ~2 min!

### Option 3: Netlify
```bash
npm run build
# Upload the `.next` folder to Netlify, or connect GitHub repo
```

---

## 📁 Project Structure

```
campus-digital-twin/
├── pages/
│   ├── _app.js           # App wrapper
│   ├── _document.js      # HTML head (fonts)
│   └── index.js          # Main page
├── components/
│   ├── dashboard/
│   │   ├── TopBar.jsx    # Header with live stats
│   │   ├── LeftPanel.jsx # Building list + room status
│   │   └── RightPanel.jsx# Charts, alerts, AI insights
│   ├── campus-map/
│   │   └── CampusMap.jsx # Interactive floor plan
│   └── animations/
│       └── ParticleBackground.jsx
├── lib/
│   └── sensorData.js     # Data model + sensor simulator
├── styles/
│   └── globals.css       # Design tokens + animations
├── package.json
├── tailwind.config.js
└── next.config.js
```

---

## 🎨 Design Philosophy

The UI is built around three visual metaphors:

1. **Mission Control** — Three-panel layout mirrors NASA/Palantir control rooms
2. **Living Data** — Everything pulses, glows, and reacts; static data is dead data  
3. **Holographic HUD** — Glassmorphism + cyan/purple palette = Iron Man meets Cyberpunk

### Color System
| Color | Meaning |
|-------|---------|
| 🔵 Cyan `#00d4ff` | Primary data, energy, connectivity |
| 🟣 Purple `#a855f7` | AI insights, predictions |
| 🟢 Green `#00ff94` | Empty rooms, healthy status |
| 🔴 Red `#ff3d5a` | Occupied rooms, critical alerts |
| 🟡 Amber `#fbbf24` | High energy, warnings |
| 🔵 Blue `#3b82f6` | Water leaks |

---

## 📡 How the Sensor Simulator Works

```
Every 2 seconds:
├── Each room's values do a "random walk"
│   ├── Occupancy ± 4 (clamped to 0..capacity)
│   ├── Energy ± 0.35 kW
│   ├── Temperature ± 0.4°C
│   └── CO₂ ± 40 ppm
├── Random events fire:
│   ├── 0.5% chance: Water leak starts
│   ├── 40% chance: Leak clears itself
│   └── 3% chance: AC toggles
└── UI re-renders with smooth transitions
```

---

## 🧠 AI Insights Logic

| Condition | Priority | Suggestion |
|-----------|----------|-----------|
| Water leak detected | CRITICAL | Shutdown valve, dispatch maintenance |
| AC on + room empty | HIGH | Auto-shutdown AC |
| Energy > 5 kW | MEDIUM | Audit connected equipment |
| CO₂ > 950 ppm | MEDIUM | Increase ventilation |
| Occupancy < 15% | LOW | Consolidate to smaller room |

---

## 💰 Pitch Stats (For Hackathon)

- **Est. Energy Savings**: ₹2–8 lakh/month per campus
- **Payback Period**: < 6 months
- **Market**: 1,000+ colleges in India alone
- **Scalable**: Same platform works for hospitals, offices, factories

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 |
| UI | React 18 + TailwindCSS |
| Animations | Framer Motion |
| Charts | Recharts |
| 3D Ready | Three.js (add via @react-three/fiber) |
| Icons | Lucide React |
| Fonts | Orbitron + Rajdhani + Share Tech Mono |

---

## 🔧 Extending the Project

### Add real IoT sensors
Replace `tickSensors()` in `lib/sensorData.js` with WebSocket calls:
```js
const ws = new WebSocket('wss://your-iot-backend/sensors');
ws.onmessage = (msg) => setSensors(JSON.parse(msg.data));
```

### Add 3D campus view
```bash
npm install @react-three/fiber @react-three/drei
```
Then import `Canvas` and build room boxes with emissive materials.

### Add database persistence
Connect to MongoDB/PostgreSQL and log sensor readings for historical analytics.

---

## 📸 Screenshots

The app features:
- Cinematic 4-second boot sequence
- Three-panel command center layout
- Pulsing, color-coded room grid
- Live energy trend chart + occupancy bars + heatmap
- AI recommendation cards with savings estimates
- Particle background with connected dots

---

Built with ❤️ for the ideathon — **Campus Digital Twin Platform**
