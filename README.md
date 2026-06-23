<div align="center">
  <img src="https://via.placeholder.com/150x150/080810/6366F1?text=VibeShift+AI" alt="VibeShift AI Logo" width="120" />

  <h1>VibeShift AI</h1>
  <p><strong>Your Autonomous Execution Operating System.</strong></p>

  <p>Built for the <b>Vibe2Ship Hackathon</b> (CodingNinjas × Google for Developers)</p>
</div>

<br />

> **The Problem:** Productivity apps are static lists that wait for you to fail. They demand cognitive overhead to maintain, they don't understand your momentum, and they do nothing when a deadline drifts.
> 
> **The Solution:** VibeShift AI is a proactive execution environment. It predicts failure before it happens, autonomously reroutes your calendar, dynamically negotiates deadlines, and intervenes when your momentum collapses.

---

## ⚡ Core Architecture

VibeShift AI replaces the traditional "to-do list" with a 4-Phase Intelligence architecture powered by **Google Gemini 2.5 Flash**, **Next.js 15**, and **Firebase**.

### 1. The Telemetry Engine
Instead of just tracking time, VibeShift calculates your **Deadline Drift Velocity (DDV)** in real-time. It evaluates remaining workload, calendar pressure, and historical execution speed off-thread via a dedicated Web Worker to predict schedule collapse before it occurs.

### 2. Autonomous Workspace Assembly
When you start a task, Gemini instantly generates a complete execution environment (`/api/agent/workspace`). It provisions documentation, starter code, and terminal commands perfectly suited to your active objective.

### 3. Cognitive De-Escalation Router (CDR)
When VibeShift detects 10 seconds of paralysis or extreme context switching, the UI physically transforms. The "I'm Stuck" protocol triggers an aggressive Gemini prompt (`/api/agent/intervention`) that distills overwhelming complexity into a single, highly specific 5-minute micro-step to instantly break cognitive friction.

### 4. Autonomous Re-Routing & Stakeholder Shield
If your DDV reaches `Critical` levels, VibeShift stops asking questions and starts acting (`/api/agent/reroute`). It analyzes your Google Calendar, finds low-priority meetings, shifts them, creates focus blocks, and automatically drafts extension request emails to your stakeholders.

### 5. Multimodal Chaos Dump
Have a messy whiteboard or a notebook full of scribbles? Point your camera at it. Our vision integration (`/api/agent/chaos-dump`) extracts actionable tasks, infers reasonable deadlines, and assigns priorities instantly.

---

## 💻 Tech Stack

- **Framework:** Next.js 15 (App Router, Turbopack)
- **AI Core:** `@google/genai` (Gemini 2.5 Flash)
- **Database & Auth:** Firebase, Cloud Firestore
- **State & Logic:** Zustand, Dedicated Web Workers
- **Styling:** Tailwind CSS v4, Framer Motion
- **Design System:** Neo-Brutalism (High-contrast, structural, stark black borders)

---

## 🚀 Getting Started

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/vibeshift-ai.git

# 2. Install dependencies
cd vibeshift-ai
npm install

# 3. Configure Environment Variables
# Create a .env.local file with your Firebase configs and Gemini API Key
GEMINI_API_KEY=your_key_here
NEXT_PUBLIC_FIREBASE_API_KEY=your_key_here
# ...

# 4. Launch the Engine
npm run dev
```

---

## 🎨 UI/UX: Neo-Brutalism
The interface was engineered to reject soft, decorative distractions. High-contrast colors, harsh 3px solid black borders, sharp edges, and aggressive monospace typography create a raw, highly functional "execution terminal" vibe. Telemetry and agent thoughts stand out boldly against the stark structure, enforcing absolute clarity.

---

<div align="center">
  <p><i>"Don't manage tasks. Execute them."</i></p>
  <p>Built in 48 hours for Vibe2Ship.</p>
</div>
