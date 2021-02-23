module.exports = {
    title: 'feathers-authentication-management',
    description: 'Sign up verification, forgotten password reset, and other capabilities for local authentication',
    //head: [['link', { rel: 'icon', href: '/favicon.ico' }]],
    theme: 'default-prefers-color-scheme',
    markdown: {
      toc: { includeLevel: [1, 2] },
    },
    themeConfig: {
      //logo: '/img/logo.svg',
      displayAllHeaders: true,
      sidebarDepth: 1,
      repo: 'feathersjs-ecosystem/feathers-authentication-management',
      docsDir: 'docs',
      editLinks: true,
      lastUpdated: true,
      sidebar: [
        'overview.md',
        '/getting-started.md',
        '/basic.md',
        '/services.md',
        '/hooks.md',
        '/client.md',
        '/advanced.md'
      ],
      serviceWorker: {
        updatePopup: true
      }
    },
    plugins: [
        '@vuepress/active-header-links', {
        sidebarLinkSelector: '.sidebar-link',
        headerAnchorSelector: '.header-anchor'
    }]
  }
