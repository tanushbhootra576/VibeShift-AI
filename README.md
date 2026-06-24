# VibeShift AI ⚡

**VibeShift AI** is a proactive, autonomous productivity agent—not just a to-do list. Designed with a striking Brutalist aesthetic, it monitors your deadlines, calculates cognitive load, and leverages Gemini 2.0 Flash to actively prevent burnout by auto-negotiating your calendar and generating real-time insights.

Built for the **Vibe2Ship (CodingNinjas × Google for Developers)** hackathon.

---

## 🚀 Key Features

- **Agentic Task Loop:** Drop a task in, and the AI actively organizes, breaks down, and schedules it automatically in your Google Calendar.
- **Deadline Drift Velocity (DDV) Engine:** A background Web Worker mathematically calculates if you're drifting off schedule and recommends interventions.
- **Chaos Dump:** Snap a picture of your whiteboard or record a voice note, and Gemini 2.0 extracts structured, prioritized tasks.
- **Cognitive Intervention:** If the DDV Engine detects high stress, the system auto-locks into Single Objective Mode to minimize friction.
- **Stakeholder Shield:** Autonomously drafts professional extension emails to stakeholders via Gmail if you fall behind.
- **Light Brutalist UI:** High contrast, sharp corners, thick borders, and grid patterns. A developer-focused "faux UI" that prioritizes readability and bold statements.

---

## 🛠 Tech Stack

- **Framework:** Next.js 15 (App Router)
- **UI/UX:** Tailwind CSS, Framer Motion, Brutalism design language, Lucide Icons
- **Backend/DB:** Firebase (Auth, Firestore, Cloud Functions)
- **Security:** Firebase App Check, NextAuth, Upstash Redis (Edge Rate Limiting), Zod (Schema Validation)
- **AI/LLM:** Google Gemini API (`gemini-2.0-flash`), Gemini Function Calling
- **Integrations:** Google Calendar API, Gmail API

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
   Copy the example environment file:
   ```bash
   cp .env.local.example .env.local
   ```
   Fill in `.env.local` with your Firebase, Google Cloud, Gemini, and Upstash keys.

4. **Run the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

---

## 🔒 Enterprise-Grade Security

- **Edge Rate Limiting:** All AI API routes are protected by Upstash Redis to prevent abuse.
- **Token Encryption:** Sensitive Google OAuth tokens are encrypted at rest in Firestore using an AES-256 cipher.
- **App Check:** Firebase resources are protected by App Check (via reCAPTCHA Enterprise) to prevent unauthorized backend access.
- **Schema Validation:** Zod is used for strict runtime validation of all API inputs.

---

## 🎨 Theme & Design System

The app utilizes a custom **"Brutalism"** theme implemented natively in `globals.css`:
- **Base Background:** `#F4F4F0`
- **Surface:** `#FFFFFF`
- **Primary Accent:** `#FF3B30` (Red)
- **Live/Active:** `#0000FF` (Blue)

Everything features 0px border-radius, heavy block borders (`border-[4px] border-black`), and stark offset drop shadows (`shadow-[6px_6px_0px_0px_#000]`), mimicking blueprint wireframes and modern developer tools.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 📜 License

[MIT](https://choosealicense.com/licenses/mit/)
