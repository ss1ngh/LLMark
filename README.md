# LLMark 

**Context Anchor for AI Chats**

> Stop scrolling through miles of AI chats—anchor and jump to specific messages instantly.

LLMark is a Chrome Extension designed to help you navigate long AI conversations with ease. Whether you're using ChatGPT, Claude, Gemini, or Perplexity, LLMark allows you to bookmark specific parts of the chat, giving you a reliable way to jump back to important context without losing your flow.

## ✨ Features

- **Context Anchoring**: Smart anchoring logic that locates the exact paragraph or element you bookmarked, even if the page content shifts or reloads.
- **Floating Sidebar**: A non-intrusive, floating sidebar on the right side of your screen stores all your bookmarks for the current chat.
- **Visual Bookmarks**: Auto-generated colors for each bookmark make them easy to distinguish.
- **Quick Preview**: Hover over a bookmark to see a preview of the anchored text.
- **Edit & Organize**: Rename bookmarks to something meaningful or delete them when they're no longer needed.
- **Local Storage**: Your bookmarks are saved locally in your browser, ensuring privacy and persistence across sessions.

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Extension Bundler**: [CRXJS Vite Plugin](https://crxjs.dev/vite-plugin)
- **Icons**: [Lucide React](https://lucide.dev/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/) (Tooltip)

## 🚀 Installation & Development

### Prerequisites
- Node.js (v18 or higher)
- npm or pnpm

### Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd LLMark
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run in Development Mode**
   ```bash
   npm run dev
   ```
   This will start the Vite development server.

4. **Load into Chrome**
   - Open Chrome and navigate to `chrome://extensions/`.
   - Enable **Developer mode** (toggle in the top right).
   - Click **Load unpacked**.
   - Select the `dist` directory in your project folder (created after build or dev start).
   
   *Note: In development mode using CRXJS, HMR (Hot Module Replacement) allows you to see changes instantly for most files.*

5. **Build for Production**
   ```bash
   npm run build
   ```
   The production-ready extension will be generated in the `dist` folder.

## 🌐 Supported Platforms

LLMark is currently configured to work on:
- [Gemini](https://gemini.google.com/)
- [ChatGPT](https://chatgpt.com/)
- [Claude](https://claude.ai/)
- [Perplexity](https://www.perplexity.ai/)
- [Wikipedia](https://en.wikipedia.org/) (for testing/research)
- [Grok](https://www.grok.com/)

## 📂 Project Structure

- `src/content`: Contains the main logic for the content script (`LLMarkApp.tsx`), which injects the sidebar and handles anchoring.
- `src/background`: Service worker configuration.
- `src/components`: Reusable UI components (Tooltips, etc.).
- `src/manifest.ts`: The source of truth for the extension's `manifest.json`.

---

