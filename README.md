# Socratic

A cross-platform desktop AI tutor that lives in your system tray and appears on demand. Socratic uses the **Socratic method** — it never gives you the answer directly. Instead, it asks the one question, analogy, or nudge that helps you reach clarity yourself.

Built with **Electron** (main process), **React + TypeScript + Tailwind CSS** (renderer), **Google Gemini** (reasoning), and **Groq Whisper** (speech-to-text).

**Current version: 1.5.0**

---

## Features

| Feature | Description |
|---|---|
| **Global shortcut** | Summon or dismiss the overlay with `Ctrl+Shift+Space` |
| **System tray** | Runs quietly in the background; right-click for Open, Hide, or Quit |
| **Frameless overlay** | Always-on-top, blurred dark panel that hides when you click away |
| **Socratic AI** | Gemini-powered tutor constrained by a strict system prompt |
| **Screen context** | Silent screenshot on summon; opt-in toggle to attach it to your next message |
| **Markdown replies** | AI responses rendered with `react-markdown` (code, lists, bold, links) |
| **Animated mic** | Framer Motion ripple/pulse when recording |
| **Voice input** | Tap the mic button to record; Groq Whisper transcribes your speech |
| **Voice output** | Optional text-to-speech for AI responses via the Web Speech API |
| **Persistent session** | One chat session per app lifetime — system prompt seeded once, not per message |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Electron Main Process                    │
│  main.ts  ·  preload.ts  ·  tray.ts  ·  globalShortcut      │
│  Loads .env · IPC for API keys · Window show/hide           │
└──────────────────────────┬──────────────────────────────────┘
                           │ contextBridge (electronAPI)
┌──────────────────────────▼──────────────────────────────────┐
│                    React Renderer Process                    │
│  App.tsx · OverlayWindow · ChatMessage · MicButton · …    │
│                                                              │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────┐ │
│  │  aiBrain    │  │  groqSTT     │  │  ttsService         │ │
│  │  (Gemini)   │  │  (Whisper)   │  │  (speechSynthesis)  │ │
│  └──────┬──────┘  └──────┬───────┘  └─────────────────────┘ │
└─────────┼────────────────┼──────────────────────────────────┘
          │                │
          ▼                ▼
   Google Gemini API   Groq Whisper API
```

### Process model

- **Main process** owns the window, tray, global shortcuts, and environment variables. API keys never reach the renderer as hardcoded strings — they are fetched over IPC at runtime.
- **Preload script** exposes a minimal `window.electronAPI` surface via `contextBridge` with `contextIsolation: true` and `nodeIntegration: false`.
- **Renderer process** is a standard Vite + React SPA. All AI and audio logic runs here.

### Chat session lifecycle

The AI brain maintains a **single persistent `ChatSession`** for the entire time the app is running:

1. **First message** — A Gemini chat is created and seeded with the Socratic system prompt (one user + one model acknowledgment turn).
2. **Subsequent messages** — Only the new user message is sent. Gemini retains prior turns server-side within the session.
3. **Overlay hide/show** — The UI conversation is preserved. Hiding the overlay does not reset the session.
4. **App quit** — The session is destroyed when the renderer process exits. Relaunching the app starts a fresh session.

This avoids re-sending the ~350-token system prompt on every message, which significantly reduces API cost and latency.

---

## Prerequisites

- **Node.js** 18 or later
- **npm** 9 or later
- A **Groq API key** — [console.groq.com](https://console.groq.com)
- A **Google Gemini API key** — [aistudio.google.com/apikey](https://aistudio.google.com/apikey)

---

## Installation

```bash
git clone <your-repo-url>
cd socratic-app
npm install
```

---

## Configuration

Create or edit `.env` in the project root:

```env
GROQ_API_KEY=gsk_your_groq_key_here
GEMINI_API_KEY=your_gemini_key_here
GEMINI_MODEL=gemini-1.5-flash
```

| Variable | Used for | Required when |
|---|---|---|
| `GEMINI_API_KEY` | Socratic AI responses | Sending any chat message |
| `GEMINI_MODEL` | Which Gemini model to use (e.g. `gemini-1.5-flash`, `gemini-1.5-pro`, `gemini-2.0-flash`) | Optional — defaults to `gemini-1.5-flash` |
| `GROQ_API_KEY` | Voice transcription (Whisper large v3) | Using the microphone button |

The main process loads `.env` at startup via `dotenv`. Keys are passed to the renderer only when a service requests them — they are not bundled into the frontend build.

> **Security note:** Never commit `.env` to version control. Add it to `.gitignore` if you initialize a git repo.

---

## Development

Electron and Vite run as separate processes in development. On **Windows**, use two terminals (PowerShell does not support the `&` operator in the bundled `electron:dev` script).

### Terminal 1 — Vite dev server

```bash
cd socratic-app
npm run dev
```

Wait until you see `Local: http://localhost:5173/`.

### Terminal 2 — Electron

```bash
cd socratic-app
npx tsc -p tsconfig.electron.json
npx electron dist-electron/main.js
```

Electron loads the Vite dev server URL and opens detached DevTools automatically.

### macOS / Linux (single command)

```bash
npm run electron:dev
```

---

## Usage

### Summoning the overlay

| Action | How |
|---|---|
| Show / toggle | `Ctrl+Shift+Space` |
| Open from tray | Right-click tray icon → **Open Socratic** |
| Hide | Click outside the window, press `✕`, or `Ctrl+Shift+Space` again |
| Quit | Right-click tray icon → **Quit** |

### Chatting

- **Text** — Type in the input bar. Press `Enter` to send, `Shift+Enter` for a new line.
- **Screen context** — When you summon the overlay, a screenshot is captured silently (before the window appears). A thumbnail appears above the input. Click it to toggle **Include screen** — only attached messages send the image to Gemini. The screenshot is cleared when you hide the overlay or after you send with it attached.
- **Voice** — Click the microphone to start recording, click again (square icon) to stop. The transcript is sent automatically.
- **TTS** — Toggle the speaker icon to have responses read aloud.

### What to expect from Socratic

Socratic will **not** solve problems for you. It will:

- Ask one targeted question
- Offer a brief analogy
- Point at the concept you are skipping
- Acknowledge frustration without giving in

Responses are capped at 3–4 sentences by the system prompt.

---

## Production build

```bash
npm run build
```

This runs TypeScript compilation, Vite production build, Electron main compilation, and `electron-builder` packaging. Output lands in the `dist/` and `dist-electron/` directories (and a platform installer if `electron-builder` is configured).

---

## Project structure

```
socratic-app/
├── electron/
│   ├── main.ts          # Window, shortcuts, IPC, .env loading
│   ├── preload.ts       # Secure bridge to renderer
│   └── tray.ts          # System tray menu
├── src/
│   ├── App.tsx          # Root state, message flow, visibility handling
│   ├── components/
│   │   ├── OverlayWindow.tsx
│   │   ├── ChatMessage.tsx
│   │   ├── MicButton.tsx
│   │   ├── TextInput.tsx
│   │   └── TTSToggle.tsx
│   ├── services/
│   │   ├── aiBrain.ts   # Persistent Gemini chat session
│   │   ├── groqSTT.ts   # MediaRecorder + Groq Whisper
│   │   └── ttsService.ts
│   └── types/
│       └── electron.d.ts
├── public/
│   └── icon.png         # Tray icon
├── .env                 # API keys (not committed)
├── vite.config.ts
├── tailwind.config.js
└── package.json
```

---

## Troubleshooting

### DevTools console errors on startup

Messages like `Autofill.enable wasn't found` or `Failed to fetch` in `devtools://` URLs are **harmless Chromium DevTools internals**. They do not affect the app. DevTools opens automatically in development (`main.ts` line 37).

### `GEMINI_API_KEY is not configured`

Add your key to `.env` and restart the Electron process (the main process reads `.env` only at launch).

### Microphone not working

- Grant microphone permission when prompted by the OS/browser layer.
- Ensure `GROQ_API_KEY` is set before using voice input.

### Overlay does not appear

1. Confirm Vite is running on port 5173.
2. Confirm Electron compiled (`npx tsc -p tsconfig.electron.json`).
3. Press `Ctrl+Shift+Space` or use the tray menu.

### Vite `CJS build deprecated` warning

Cosmetic warning from Vite 5. Safe to ignore in development.

### Chat context after long sessions

Gemini chat sessions have a context window limit. For very long conversations within one app session, responses may eventually degrade. Quit and relaunch the app to start fresh.

### Changing the Gemini model

Set `GEMINI_MODEL` in `.env`, then restart Electron. The model is locked in when the first message is sent — a running session will not pick up a model change until you quit the app.

---

## Scripts reference

| Script | Description |
|---|---|
| `npm run dev` | Start Vite dev server only |
| `npm run build` | Full production build + electron-builder |
| `npm run electron:dev` | Compile Electron + start Vite and Electron (Unix shells) |

---

## License

Private — see repository owner for terms.
