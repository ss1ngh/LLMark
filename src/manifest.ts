import { defineManifest } from '@crxjs/vite-plugin'

export default defineManifest({
    name: 'LLMark',
    description: 'Context Anchor for AI Chats',
    version: '1.0.0',
    manifest_version: 3,
    permissions: ['storage', 'activeTab', 'scripting', 'alarms'],
    icons: {
        16: 'favicon-96x96.png',
        48: 'favicon-96x96.png',
        128: 'web-app-manifest-192x192.png',
    },
    action: {
        default_title: 'LLMark',
        default_icon: 'favicon-96x96.png',
    },
    content_scripts: [
        {
            matches: [
                'https://gemini.google.com/*',
                'https://chatgpt.com/*',
                'https://claude.ai/*',
                'https://www.perplexity.ai/*',
                'https://en.wikipedia.org/*',
                'https://www.grok.com/*'
            ],
            js: ['src/content/index.tsx'],
        },
    ],
    web_accessible_resources: [
        {
            resources: ['bookmark.svg'],
            matches: ['<all_urls>'],
        },
    ],
    background: {
        service_worker: 'src/background/index.ts',
        type: 'module',
    },
})