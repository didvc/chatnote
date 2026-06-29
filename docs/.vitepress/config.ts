import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'chatnote',
  description: 'Self-hosted note-to-self chatrooms — infinite rooms, Markdown, three room types (persistent, ephemeral, incognito), image uploads, tags, and JSON import/export.',
  base: '/chatnote/',
  cleanUrls: true,
  lastUpdated: true,

  sitemap: {
    hostname: 'https://didvc.github.io/chatnote/'
  },

  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'Architecture', link: '/architecture/overview' },
      { text: 'Recipes', link: '/recipes/demo-mode' },
      { text: 'Reference', link: '/reference/config' },
    ],

    sidebar: [
      {
        text: 'Guide',
        items: [
          { text: 'Getting Started', link: '/guide/getting-started' },
          { text: 'Configuration', link: '/guide/configuration' },
          { text: 'Room Types', link: '/guide/room-types' },
          { text: 'Image Uploads', link: '/guide/image-uploads' },
          { text: 'Import & Export', link: '/guide/import-export' },
        ]
      },
      {
        text: 'Architecture',
        items: [
          { text: 'Overview', link: '/architecture/overview' },
          { text: 'In-Memory Room Design', link: '/architecture/in-memory-rooms' },
          { text: 'Security Model', link: '/architecture/security' },
        ]
      },
      {
        text: 'Recipes',
        items: [
          { text: 'Demo Mode', link: '/recipes/demo-mode' },
          { text: 'Self-Hosting', link: '/recipes/self-hosting' },
        ]
      },
      {
        text: 'Reference',
        items: [
          { text: 'Config Reference', link: '/reference/config' },
          { text: 'FAQ', link: '/reference/faq' },
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/didvc/chatnote' }
    ],

    editLink: {
      pattern: 'https://github.com/didvc/chatnote/edit/main/docs/:path'
    },

    footer: {
      message: 'Released under the Apache-2.0 License.',
      copyright: 'Copyright © 2026 didvc'
    },

    search: {
      provider: 'local'
    }
  },

  transformHead: async ({ pageData }) => {
    const head: any[] = []
    const title = pageData.frontmatter.title || pageData.title || 'chatnote'
    const description = pageData.frontmatter.description || 'Self-hosted note-to-self chatrooms with persistent, ephemeral, and incognito room types.'
    const baseUrl = 'https://didvc.github.io/chatnote'
    const cleanPath = pageData.relativePath.replace(/\.md$/, '').replace(/index$/, '')
    const pageUrl = `${baseUrl}/${cleanPath}`.replace(/\/$/, '')

    head.push(['link', { rel: 'canonical', href: pageUrl }])
    head.push(['meta', { property: 'og:title', content: title }])
    head.push(['meta', { property: 'og:description', content: description }])
    head.push(['meta', { property: 'og:url', content: pageUrl }])
    head.push(['meta', { property: 'og:site_name', content: 'chatnote' }])
    head.push(['meta', { property: 'og:type', content: 'website' }])
    head.push(['meta', { name: 'twitter:card', content: 'summary' }])
    head.push(['meta', { name: 'twitter:title', content: title }])
    head.push(['meta', { name: 'twitter:description', content: description }])

    return head
  }
})
