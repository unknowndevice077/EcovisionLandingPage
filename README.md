[![License: MIT](https://img.shields.io/badge/License-MIT-76b900.svg)](LICENSE)

# EcoVision Smartpole

Landing page for **EcoVision** — a solar-powered smartpole with on-device computer
vision (a custom-trained YOLOv11 model) for local threat detection. Built with
Next.js, React, and TypeScript, with a live inference sandbox backed by a separate
Python model server.

## 🌐 Overview

A single-page marketing + demo site: hero, live specs, a video showcase of the
detection classes (assault, weapon, theft, vandalism), a hardware breakdown, and an
**Inference Sandbox** where a visitor can upload an image and get real bounding-box
predictions back from the trained model.

## 🛠️ Tech Stack

- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 (globals) + hand-authored CSS-in-JS for the page itself
- **AI Backend**: Python (`predict.py`) serving a custom-trained YOLOv11 model
  (`best.pt`), called from `app/api/detect/route.ts`
- **Deployment**: Vercel (frontend) + a separately hosted Python service (backend)

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- npm

### Installation

```bash
npm install
```

### Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the site.

### Inference Sandbox (optional, local)

The "Live Testing Area" on the page needs the Python model server running:

```bash
python predict.py
```

By default the frontend talks to `http://127.0.0.1:5000`. Without it running, the
sandbox fails gracefully with an on-page connection error — the rest of the site
works fine either way.

## 📁 Project Structure

```
EcovisionLandingPage/
├── app/
│   ├── api/detect/route.ts       # Proxies uploads to the Python model server
│   ├── components/               # Page sections (hero, showcase, sandbox, footer…)
│   ├── styles.ts                 # ASSETS registry + shared style objects — the one
│   │                              #   place to swap videos/photos (see DEPLOYMENT.md)
│   └── page.tsx                  # Top-level page composition
├── public/                       # Static videos & images
├── predict.py                    # Python YOLOv11 inference server (hosted separately)
├── best.pt                       # Trained model weights (gitignored, kept local)
├── vercel.json / .vercelignore   # Vercel build config
└── DEPLOYMENT.md                 # Deploy steps + media replacement guide
```

## 🚢 Deployment

Frontend deploys on [Vercel](https://vercel.com); see [DEPLOYMENT.md](DEPLOYMENT.md)
for the full walkthrough, including hosting the Python backend separately and wiring
`NEXT_PUBLIC_PYTHON_BACKEND_URL`. Not yet deployed — no live URL to link here until
that's done.

### Deploy Your Own

1. Fork or clone this repository
2. Visit [vercel.com](https://vercel.com) and import the repo
3. Vercel auto-detects Next.js, builds, and deploys
4. Set `NEXT_PUBLIC_PYTHON_BACKEND_URL` in the project's env vars once the Python
   backend is hosted somewhere (see DEPLOYMENT.md)

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [TypeScript](https://www.typescriptlang.org)
- [Vercel Documentation](https://vercel.com/docs)

## 📄 License

MIT — see [LICENSE](LICENSE).

## 👤 Author

**unknowndevice077** — [GitHub](https://github.com/unknowndevice077)

## 💬 Support

Questions or issues? [Open an issue](https://github.com/unknowndevice077/EcovisionLandingPage/issues) on GitHub.
