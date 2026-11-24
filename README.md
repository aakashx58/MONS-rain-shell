# AI Studio Applet

A Next.js application built with React, TypeScript, and Tailwind CSS, powered by Google Generative AI.

<img width="1919" height="894" alt="image" src="https://github.com/user-attachments/assets/ebcb710d-a155-4048-9ebf-4a3fc8fd72eb" />

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **UI:** React 19, Tailwind CSS 4
- **Animations:** Motion (Framer Motion)
- **Forms:** React Hook Form with resolvers
- **AI:** Google Generative AI (`@google/genai`)
- **Icons:** Lucide React
- **Language:** TypeScript
- **Linting:** ESLint with `eslint-config-next`

## Getting Started

### Prerequisites

- Node.js (v20 or higher)
- npm (comes with Node.js)

### Installation

Clone the repository and install dependencies:

```bash
git clone <repository-url>
cd ai-studio-applet
npm install
```

### Environment Setup

Copy the example environment file and fill in your values:

```bash
cp .env.example .env.local
```

Set the required environment variables in `.env.local` (e.g., your Google Generative AI API key).

### Running the App

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

Other available scripts:

| Script | Description |
|--------|-------------|
| `npm run dev` | Start the development server with Turbopack |
| `npm run build` | Build the application for production |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint to check for code issues |
| `npm run clean` | Clean the Next.js build cache |

## Project Structure

```
ai-studio-applet/
├── app/              # Next.js App Router (routes, pages, layouts)
├── components/       # Reusable React components
├── hooks/            # Custom React hooks
├── lib/              # Utility functions and shared logic
├── public/           # Static assets
├── .vscode/          # VS Code debug configurations (launch.json)
├── .env.example      # Example environment variables
├── next.config.ts    # Next.js configuration
├── tailwind.config.* # Tailwind CSS configuration
├── tsconfig.json     # TypeScript configuration
└── package.json      # Project dependencies and scripts
```

## Debugging in VS Code

This project includes a `.vscode/launch.json` with the following configurations:

- **Launch Next.js (dev)** — Starts the Next.js dev server with the Node.js debugger attached.
- **Debug Next.js Client (Chrome)** — Launches Chrome and attaches the debugger to the running dev server at `http://localhost:3000`.
- **Debug Next.js Client (Edge)** — Same as above, but for Microsoft Edge.
- **Attach to Next.js Client** — Attaches the Chrome debugger to an already-running browser instance on port 9222.
- **Full Stack Debug** — Compound launch that starts both the server and client debuggers at once.

Open the Run and Debug panel in VS Code (`Ctrl+Shift+D` / `Cmd+Shift+D`) and select a configuration to begin debugging.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

## License

This project is private and proprietary.
