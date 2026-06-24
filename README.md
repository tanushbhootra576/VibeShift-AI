# VibeShift AI ⚡

**VibeShift AI** is a proactive, autonomous productivity agent—not just a to-do list. Designed like a spacecraft cockpit, it monitors your deadlines, analyzes your cognitive load, and leverages Gemini AI to actively prevent burnout by re-routing your calendar blocks and generating real-time insights.

Built for the **Vibe2Ship (CodingNinjas × Google for Developers)** hackathon.

---

## 🚀 Features

- **Agentic Task Loop:** Drop a task in, and the AI actively organizes it, breaks it down, and schedules it automatically in your Google Calendar.
- **Deadline Drift Velocity (DDV) Engine:** A background Web Worker mathematically calculates if you're drifting off schedule and generates alerts.
- **Chaos Dump:** Snap a picture of your whiteboard or messy notebook, and Gemini Vision extracts structured, prioritized tasks.
- **Cognitive Intervention:** If the DDV Engine detects high stress, the system auto-locks into Single Objective Mode to minimize friction.
- **Stakeholder Shield:** Autonomously drafts professional extension emails to stakeholders if you're critically falling behind.
- **Neo-Brutalism UI:** Glassmorphism meets a spacecraft cockpit. Hard borders, high contrast, immersive aesthetic.

---

## 🛠 Tech Stack

- **Framework:** Next.js 15 (App Router)
- **UI/UX:** Tailwind CSS, Framer Motion, Neo-brutalism design language
- **Backend/DB:** Firebase (Auth, Firestore, Cloud Functions ready)
- **AI/LLM:** Google Gemini API (`gemini-2.5-flash`), Gemini Function Calling
- **Integrations:** Google Calendar API, Web Speech API
- **State:** Zustand (Optimistic Updates)

---

## ⚙️ Local Setup

1. **Clone the repo:**
   ```bash
   git clone https://github.com/yourusername/vibeshift-ai.git
   cd vibeshift-ai
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Variables:**
   Create a `.env.local` file in the root directory:
   ```env
   # Firebase Config
   NEXT_PUBLIC_FIREBASE_API_KEY="..."
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="..."
   NEXT_PUBLIC_FIREBASE_PROJECT_ID="..."
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="..."
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="..."
   NEXT_PUBLIC_FIREBASE_APP_ID="..."

   # Firebase Admin (For server-side execution)
   FIREBASE_ADMIN_CLIENT_EMAIL="..."
   FIREBASE_ADMIN_PRIVATE_KEY="..."

   # Encryption (AES-256 for secure Google OAuth Tokens)
   ENCRYPTION_KEY="32-byte-long-secure-random-string!"
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

---

## 🔒 Security

All sensitive user tokens (like Google Calendar OAuth scopes) are encrypted at rest in Firestore using an AES-256 cipher before being written. The `geminiApiKey` can also be stored securely to limit token exposure.

---

## 🎨 Theme & Design System

The app utilizes a custom **"Cyber Obsidian"** theme implemented natively in `index.css` via CSS variables:
- **Base:** `#000000`
- **Surface:** `#0A0A0A`
- **Primary Accent:** `#10B981` (Emerald)
- **Live/Active:** `#06B6D4` (Cyan)

Everything features 0px border-radius, heavy 4px borders, and stark drop shadows mimicking terminal interfaces and modern hardware consoles.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 📜 License

[MIT](https://choosealicense.com/licenses/mit/)
