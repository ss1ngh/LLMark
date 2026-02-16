import { defineManifest } from '@crxjs/vite-plugin'

export default defineManifest({
    name: 'LLMark',
    description: 'Context Anchor for AI Chats',
    version: '1.0.0',
    manifest_version: 3,
    permissions: ['storage', 'activeTab', 'scripting', 'alarms'],
    action: {
        default_title: 'LLMark',
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